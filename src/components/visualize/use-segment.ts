"use client";

import { useCallback, useRef, useState } from "react";

export interface AIMask {
  /** Unique id (index-based) */
  id: string;
  /** Label derived from the AI detection (e.g. "countertop", "wall") */
  label: string;
  /** data-URL of the mask PNG (white = surface, black = bg) */
  url: string;
}

/** Result of a runPoint call. Three outcomes:
 *   - "mask"   → SAM-2 succeeded and returned a usable mask
 *   - "manual" → SAM-2 missed; the UI should open the manual frame
 *   - "error"  → request failed; an error message is set on the hook
 */
export type RunPointResult =
  | { kind: "mask"; mask: AIMask }
  | { kind: "manual"; tap: { x: number; y: number } }
  | { kind: "error" };

/**
 * Hook that calls /api/segment to detect surfaces in a room photo.
 *
 * The API uses a two-stage pipeline:
 *   1. GroundingDINO detects surfaces by text prompt → bounding boxes
 *   2. Grounded SAM segments each detection → per-surface masks
 *
 * If the primary prompt fails (e.g. no countertops found), the API
 * automatically retries with broader prompts before giving up.
 *
 * Returns `{ masks, loading, error, run, clear }`.
 */
export function useSegment() {
  const [masks, setMasks] = useState<AIMask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback(async (imageDataUrl: string, prompt?: string) => {
    // Abort any in-flight request
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setLoading(true);
    setError(null);
    setMasks([]);

    try {
      const res = await fetch("/api/segment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: imageDataUrl,
          ...(prompt ? { prompt } : {}),
        }),
        signal: ac.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Server error" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const data: {
        masks: { url: string; label?: string }[];
        warning?: string;
      } = await res.json();

      if (data.warning) {
        console.warn("[segment]", data.warning);
      }

      const aiMasks: AIMask[] = data.masks.map((m, i) => ({
        id: `ai-mask-${i}`,
        label: m.label || `Surface ${i + 1}`,
        url: m.url,
      }));

      setMasks(aiMasks);

      // If no masks returned, set a soft warning (not an error)
      if (aiMasks.length === 0) {
        setError("No surfaces auto-detected. Tap to select manually.");
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      const message =
        err instanceof Error ? err.message : "Segmentation failed";
      setError(message);
    } finally {
      if (!ac.signal.aborted) setLoading(false);
    }
  }, []);

  /**
   * Run SAM-2 with a point prompt at the given normalized (0–1) coordinates.
   * Used as a fallback when AMG missed a surface — the user taps where the
   * surface should be, and SAM-2 returns a precise mask for it.
   *
   * Appends the result to the existing masks list (does NOT replace) so the
   * user keeps any selections they've already made. Returns the new mask, or
   * null on failure.
   */
  const runPoint = useCallback(
    async (
      imageDataUrl: string,
      x: number,
      y: number
    ): Promise<RunPointResult> => {
      setLoading(true);
      setError(null);
      try {
        // Calls /api/process-surface which runs SAM-2 only.
        //   - SAM-2 success → returns { mask, source: "sam2" }
        //   - SAM-2 miss    → returns { manual_required: true, ... }
        //                     → caller should show draggable frame
        const res = await fetch("/api/process-surface", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: imageDataUrl, x, y }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Server error" }));
          throw new Error(err.error || `HTTP ${res.status}`);
        }
        const data: {
          mask?: { url: string; label?: string };
          manual_required?: boolean;
          tap?: { x: number; y: number };
          image_dims?: { w: number; h: number };
          source?: string;
        } = await res.json();

        // SAM-2 missed — signal the UI to open the manual draggable frame.
        if (data.manual_required) {
          console.log(
            "[useSegment] SAM-2 missed — needs manual frame at tap",
            data.tap
          );
          return { kind: "manual", tap: { x, y } };
        }

        if (!data.mask) {
          setError("No surface detected at that point.");
          return { kind: "error" };
        }

        console.log(
          `[useSegment] Tap → mask returned (source: ${data.source ?? "sam2"})`
        );

        const newMask: AIMask = {
          id: `ai-point-${Date.now()}`,
          label: data.mask.label || "Tapped surface",
          url: data.mask.url,
        };
        setMasks((prev) => [...prev, newMask]);
        return { kind: "mask", mask: newMask };
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Point segmentation failed";
        setError(message);
        return { kind: "error" };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Add a mask built client-side from a manually-drawn polygon
   * (the "draggable frame" fallback when SAM-2 misses).
   *
   * The polygon is variable-length and each edge can optionally have
   * a quadratic Bezier control point (for curved edges).
   *   - `points`: array of [x, y] normalised in [0, 1] image coords
   *   - `controls[i]`: optional control point for the segment from
   *     points[i] to points[(i+1) % points.length]. null = straight.
   */
  const addManualMask = useCallback(
    (
      points: [number, number][],
      controls: ([number, number] | null)[],
      imgW: number,
      imgH: number
    ): AIMask | null => {
      if (points.length < 3) return null;
      const c = document.createElement("canvas");
      c.width = imgW;
      c.height = imgH;
      const ctx = c.getContext("2d");
      if (!ctx) return null;
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, imgW, imgH);
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.moveTo(points[0][0] * imgW, points[0][1] * imgH);
      for (let i = 0; i < points.length; i++) {
        const next = points[(i + 1) % points.length];
        const ctrl = controls[i];
        if (ctrl) {
          ctx.quadraticCurveTo(
            ctrl[0] * imgW,
            ctrl[1] * imgH,
            next[0] * imgW,
            next[1] * imgH
          );
        } else {
          ctx.lineTo(next[0] * imgW, next[1] * imgH);
        }
      }
      ctx.closePath();
      ctx.fill();
      const url = c.toDataURL("image/png");
      const newMask: AIMask = {
        id: `manual-${Date.now()}`,
        label: "Manual surface",
        url,
      };
      setMasks((prev) => [...prev, newMask]);
      return newMask;
    },
    []
  );

  const clear = useCallback(() => {
    abortRef.current?.abort();
    setMasks([]);
    setError(null);
    setLoading(false);
  }, []);

  /** Remove a single mask by id (used by edit-then-replace flow). */
  const removeMask = useCallback((id: string) => {
    setMasks((prev) => prev.filter((m) => m.id !== id));
  }, []);

  return {
    masks,
    loading,
    error,
    run,
    runPoint,
    addManualMask,
    removeMask,
    clear,
  } as const;
}

/**
 * Hook that fetches a depth map for an image via /api/depth (Depth
 * Anything V2 on Replicate). Returns the depth map as a data-URL PNG
 * plus its width and height. Used by the visualizer to estimate
 * surface plane orientation for perspective-correct slab rendering.
 */
export interface DepthMap {
  /** data-URL PNG of the grayscale depth map. Lighter = closer. */
  url: string;
  /** Width of the depth image in pixels. */
  width: number;
  /** Height of the depth image in pixels. */
  height: number;
}

export function useDepth() {
  const [depth, setDepth] = useState<DepthMap | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback(async (imageDataUrl: string) => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setLoading(true);
    setError(null);
    setDepth(null);

    try {
      const res = await fetch("/api/depth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageDataUrl }),
        signal: ac.signal,
      });

      if (!res.ok) {
        const err = await res
          .json()
          .catch(() => ({ error: "Depth fetch failed" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const data: { depthMap: string; width: number; height: number } =
        await res.json();
      setDepth({
        url: data.depthMap,
        width: data.width,
        height: data.height,
      });
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      const message =
        err instanceof Error ? err.message : "Depth estimation failed";
      setError(message);
    } finally {
      if (!ac.signal.aborted) setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    abortRef.current?.abort();
    setDepth(null);
    setError(null);
    setLoading(false);
  }, []);

  return { depth, loading, error, run, clear } as const;
}
