import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/process-surface
 *
 * SAM-2 only. Two outcomes:
 *   - SAM-2 returns a mask containing the tap pixel → return it.
 *   - SAM-2 misses → return { manual_required: true } so the front
 *     end opens the manual draggable polygon editor.
 *
 * No Claude, no Grounded SAM, no fallbacks beyond the manual editor.
 *
 * Body:
 *   { image: string (data-URL or URL), x: number (0-1), y: number (0-1) }
 *
 * Response (success):
 *   { mask: { url, label }, source: "sam2" }
 *
 * Response (SAM-2 missed):
 *   { manual_required: true, tap: { x, y }, image_dims: { w, h } }
 */

const REPLICATE_API = "https://api.replicate.com/v1/predictions";
const SAM2_VERSION =
  "fe97b453a6455861e3bac769b441ca1f1086110da7466dbb65cf1eecfd60dc83";
const MAX_DIM = 1280;

export async function POST(req: NextRequest) {
  const replicateToken = process.env.REPLICATE_API_TOKEN;
  if (!replicateToken) {
    return NextResponse.json(
      { error: "REPLICATE_API_TOKEN not configured" },
      { status: 500 }
    );
  }

  let body: { image: string; x: number; y: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { image, x, y } = body;
  if (!image || x == null || y == null) {
    return NextResponse.json(
      { error: "Missing image, x, or y" },
      { status: 400 }
    );
  }

  try {
    const processedImage = await resizeIfNeeded(image, MAX_DIM);
    const dims = await getImageDims(processedImage);
    const px = Math.round(x * dims.w);
    const py = Math.round(y * dims.h);

    console.log(
      `[process-surface] SAM-2 @ pixel (${px}, ${py}) on ${dims.w}×${dims.h}`
    );

    const samMask = await runPointSAM2(
      replicateToken,
      processedImage,
      px,
      py,
      dims.w,
      dims.h
    );

    if (!samMask) {
      console.log(
        "[process-surface] SAM-2 missed — signalling frontend to show manual frame"
      );
      return NextResponse.json({
        manual_required: true,
        tap: { x, y },
        image_dims: dims,
      });
    }

    return NextResponse.json({
      mask: { url: samMask, label: "Tapped surface" },
      source: "sam2",
    });
  } catch (err) {
    console.error("[process-surface] Error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/* ================================================================== *
 * SAM-2 point-prompted segmentation                                  *
 * ================================================================== */

async function runPointSAM2(
  token: string,
  imageUrl: string,
  px: number,
  py: number,
  inputW: number,
  inputH: number
): Promise<string | null> {
  let createRes: Response | null = null;
  let lastRateLimit = false;
  for (let attempt = 0; attempt < 3; attempt++) {
    createRes = await fetch(REPLICATE_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Prefer: "wait=60",
      },
      body: JSON.stringify({
        version: SAM2_VERSION,
        input: {
          image: imageUrl,
          point_coords: `[[${px}, ${py}]]`,
          point_labels: "[1]",
          use_m2m: false,
          multimask_output: false,
        },
      }),
    });

    if (createRes.status === 429) {
      lastRateLimit = true;
      const retryAfter = parseInt(
        createRes.headers.get("retry-after") || "12",
        10
      );
      await new Promise((r) => setTimeout(r, Math.max(retryAfter, 10) * 1000));
      continue;
    }
    lastRateLimit = false;
    break;
  }

  if (lastRateLimit && createRes && createRes.status === 429) {
    throw new Error(
      "Replicate rate-limited — top up credit or wait a minute and retry."
    );
  }
  if (!createRes || !createRes.ok) {
    throw new Error(
      `SAM-2 HTTP ${createRes?.status}: ${createRes ? await createRes.text() : "no response"}`
    );
  }

  let prediction = await createRes.json();
  let attempts = 0;
  while (
    prediction.status !== "succeeded" &&
    prediction.status !== "failed" &&
    prediction.status !== "canceled" &&
    attempts < 60
  ) {
    await new Promise((r) => setTimeout(r, 2000));
    const pollRes = await fetch(`${REPLICATE_API}/${prediction.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    prediction = await pollRes.json();
    attempts++;
  }

  if (prediction.status !== "succeeded") {
    throw new Error(`SAM-2 failed: ${prediction.error || prediction.status}`);
  }

  // Pick smallest individual mask containing the tap pixel.
  const output = prediction.output;
  const candidates: string[] = Array.isArray(output?.individual_masks)
    ? output.individual_masks.filter(
        (u: unknown): u is string =>
          typeof u === "string" && u.startsWith("http")
      )
    : output?.combined_mask
      ? [output.combined_mask]
      : [];

  if (candidates.length === 0) return null;

  const best = await pickSmallestContainingMask(
    candidates,
    px,
    py,
    inputW,
    inputH
  );
  if (!best) return null;

  // Convert to base64 data-URL so the client doesn't deal with CORS.
  const maskRes = await fetch(best);
  if (!maskRes.ok) return null;
  const maskBuf = await maskRes.arrayBuffer();
  const ct = maskRes.headers.get("content-type") || "image/png";
  return `data:${ct};base64,${Buffer.from(maskBuf).toString("base64")}`;
}

/**
 * Of the N candidate masks SAM-2 returned, pick the smallest one
 * that actually contains the tap pixel — that's the most specific
 * surface at the click point. Returns null if none contain the tap
 * (which is the signal to fall back to the manual frame editor).
 */
async function pickSmallestContainingMask(
  urls: string[],
  px: number,
  py: number,
  inputW: number,
  inputH: number
): Promise<string | null> {
  if (urls.length === 1) return urls[0];

  let sharp: typeof import("sharp");
  try {
    sharp = (await import("sharp")).default;
  } catch {
    return urls[0];
  }

  type M = { url: string; area: number; contains: boolean };
  const masks = await Promise.all(
    urls.map(async (url): Promise<M | null> => {
      try {
        const res = await fetch(url);
        if (!res.ok) return null;
        const buf = Buffer.from(await res.arrayBuffer());
        const meta = await sharp(buf).metadata();
        const w = meta.width || 0;
        const h = meta.height || 0;
        if (!w || !h) return null;
        const raw = await sharp(buf)
          .greyscale()
          .raw()
          .toBuffer({ resolveWithObject: true });
        const data = raw.data;
        const mx = Math.round((px / inputW) * w);
        const my = Math.round((py / inputH) * h);
        const idx = my * w + mx;
        const contains = idx >= 0 && idx < data.length && data[idx] > 128;
        let area = 0;
        for (let i = 0; i < data.length; i++) if (data[i] > 128) area++;
        return { url, area, contains };
      } catch {
        return null;
      }
    })
  );

  const valid = masks.filter((m): m is M => m !== null);
  if (valid.length === 0) return null;
  const containing = valid.filter((m) => m.contains);
  // STRICT: only return a mask that actually contains the tap pixel.
  // If none do, return null so the caller signals manual mode.
  if (containing.length === 0) return null;
  containing.sort((a, b) => a.area - b.area);
  return containing[0].url;
}

/* ================================================================== *
 * Image utilities (resize + dims)                                    *
 * ================================================================== */

async function getImageDims(
  imageInput: string
): Promise<{ w: number; h: number }> {
  try {
    if (imageInput.startsWith("data:")) {
      const i = imageInput.indexOf(",");
      if (i === -1) return { w: 1280, h: 720 };
      const buf = Buffer.from(imageInput.substring(i + 1), "base64");
      const sharp = (await import("sharp")).default;
      const meta = await sharp(buf).metadata();
      return { w: meta.width || 1280, h: meta.height || 720 };
    }
  } catch {}
  return { w: 1280, h: 720 };
}

async function resizeIfNeeded(
  imageInput: string,
  maxDim: number
): Promise<string> {
  if (!imageInput.startsWith("data:")) return imageInput;
  try {
    const i = imageInput.indexOf(",");
    if (i === -1) return imageInput;
    const header = imageInput.substring(0, i);
    if (!header.includes(";base64")) return imageInput;
    const buf = Buffer.from(imageInput.substring(i + 1), "base64");
    let sharp: typeof import("sharp");
    try {
      sharp = (await import("sharp")).default;
    } catch {
      return imageInput;
    }
    const img = sharp(buf);
    const meta = await img.metadata();
    const w = meta.width || 0;
    const h = meta.height || 0;
    if (w <= maxDim && h <= maxDim) return imageInput;
    const resized = await img
      .resize(maxDim, maxDim, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();
    return `data:image/jpeg;base64,${resized.toString("base64")}`;
  } catch {
    return imageInput;
  }
}
