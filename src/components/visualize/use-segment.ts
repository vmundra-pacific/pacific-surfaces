"use client";

import { useCallback, useRef, useState } from "react";

export interface AIMask {
  /** Unique id (index-based) */
  id: string;
  /** Label derived from the prompt token */
  label: string;
  /** data-URL of the mask PNG (white = surface, black = bg) */
  url: string;
}

const DEFAULT_PROMPT = "countertop, kitchen island, backsplash, floor";

/**
 * Hook that calls /api/segment to detect surfaces in a room photo.
 *
 * Returns `{ masks, loading, error, run }`.
 *   - `run(imageDataUrl)` triggers the segmentation.
 *   - `masks` is the result array once completed.
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
          prompt: prompt || DEFAULT_PROMPT,
        }),
        signal: ac.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Server error" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const data: { masks: { url: string }[] } = await res.json();
      const labels = (prompt || DEFAULT_PROMPT).split(",").map((s) => s.trim());

      const aiMasks: AIMask[] = data.masks.map((m, i) => ({
        id: `ai-mask-${i}`,
        label: labels[i] || `Surface ${i + 1}`,
        url: m.url,
      }));

      setMasks(aiMasks);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      const message = err instanceof Error ? err.message : "Segmentation failed";
      setError(message);
    } finally {
      if (!ac.signal.aborted) setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    abortRef.current?.abort();
    setMasks([]);
    setError(null);
    setLoading(false);
  }, []);

  return { masks, loading, error, run, clear } as const;
}
