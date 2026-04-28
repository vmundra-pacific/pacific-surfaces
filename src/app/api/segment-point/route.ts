import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/segment-point
 *
 * Point-prompted segmentation: the user taps a location where no surface
 * was auto-detected, and we run SAM-2 with that specific point to detect
 * the surface under their finger/cursor.
 *
 * This is the fallback for surfaces that automatic mask generation misses
 * (e.g. dark countertops, subtle floors).
 *
 * Body:  { image: string, x: number, y: number }
 *   - x, y are normalized coordinates (0–1) relative to image dimensions
 * Response: { mask: { url: string, label: string } } or { error: string }
 */

const REPLICATE_API = "https://api.replicate.com/v1/predictions";

// SAM-2 point-prompted segmentation
const SAM2_VERSION =
  "fe97b453a6455861e3bac769b441ca1f1086110da7466dbb65cf1eecfd60dc83";

const MAX_DIM = 1280;

export async function POST(req: NextRequest) {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
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

    // Get image dimensions for converting normalized coords to pixels
    const dims = await getImageDims(processedImage);
    const px = Math.round(x * dims.w);
    const py = Math.round(y * dims.h);

    console.log(
      `[segment-point] Input: normalized x=${x.toFixed(4)} y=${y.toFixed(4)} → pixel (${px}, ${py}) within resized image ${dims.w}×${dims.h}`
    );

    const result = await runPointSAM2(
      token,
      processedImage,
      px,
      py,
      dims.w,
      dims.h
    );

    if (result.status === "succeeded" && result.mask) {
      // Log the centroid of the returned mask so we can compare it with
      // where the user actually clicked (px, py). If they're far apart,
      // the model is mis-segmenting, not a coord-mapping bug.
      console.log(
        `[segment-point] SAM-2 returned mask. Tap was at (${px}, ${py}) — confirm in browser whether highlighted region overlaps that pixel.`
      );
    }

    if (result.status === "failed") {
      console.error(`[segment-point] Failed: ${result.error}`);
      return NextResponse.json(
        { error: result.error || "Segmentation failed" },
        { status: 502 }
      );
    }

    if (!result.mask) {
      return NextResponse.json({
        mask: null,
        warning: "No surface detected at this location.",
      });
    }

    console.log("[segment-point] Success — mask detected");
    return NextResponse.json({
      mask: { url: result.mask, label: "Tapped Surface" },
    });
  } catch (err) {
    console.error("Segment-point API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------------ */

interface PointResult {
  status: "succeeded" | "failed";
  mask: string | null; // base64 data-URL
  error?: string;
}

async function runPointSAM2(
  token: string,
  imageUrl: string,
  px: number,
  py: number,
  inputW: number,
  inputH: number
): Promise<PointResult> {
  let createRes: Response | null = null;
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
          // Point prompt: single foreground point.
          point_coords: `[[${px}, ${py}]]`,
          point_labels: "[1]",
          // use_m2m (mask-to-mask refinement) hurts accuracy without an
          // input mask — disable so the model is a clean "what's under
          // this pixel" segmenter.
          use_m2m: false,
          // Force single-mask output. With multimask=true the model
          // returns 3 candidate interpretations of the point and our
          // post-processing has to guess; forcing 1 mask makes the model
          // pick its best guess deterministically.
          multimask_output: false,
        },
      }),
    });

    if (createRes.status === 429) {
      const retryAfter = parseInt(
        createRes.headers.get("retry-after") || "12",
        10
      );
      const wait = Math.max(retryAfter, 10) * 1000;
      console.warn(
        `[segment-point] Rate limited, waiting ${wait / 1000}s (attempt ${attempt + 1}/3)`
      );
      await new Promise((r) => setTimeout(r, wait));
      continue;
    }
    break;
  }

  if (!createRes || !createRes.ok) {
    const err = createRes ? await createRes.text() : "No response";
    return {
      status: "failed",
      mask: null,
      error: `HTTP ${createRes?.status}: ${err}`,
    };
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
    return {
      status: "failed",
      mask: null,
      error: prediction.error || `Status: ${prediction.status}`,
    };
  }

  // SAM-2 point-prompt output shape:
  //   { combined_mask: <url>, individual_masks: [<url>, <url>, ...] }
  // The wrapper ignores `multimask_output: false` and consistently returns
  // multiple masks (~9). They're NOT cleanly ordered — picking [0] gave
  // wildly wrong surfaces because [0] is often the largest "contains
  // everything similar" interpretation. So we download every candidate,
  // check which ones actually contain the user's tap pixel, and pick the
  // SMALLEST among those — that's the most specific surface at the click.
  const output = prediction.output;
  const candidates: string[] = [];
  if (Array.isArray(output?.individual_masks)) {
    for (const u of output.individual_masks) {
      if (typeof u === "string" && u.startsWith("http")) candidates.push(u);
    }
  } else if (output?.combined_mask) {
    candidates.push(output.combined_mask);
  } else if (typeof output === "string") {
    candidates.push(output);
  }

  console.log(
    `[segment-point] ${candidates.length} candidate mask(s) returned`
  );

  if (candidates.length === 0) {
    return { status: "succeeded", mask: null };
  }

  const best = await pickSmallestContainingMask(
    candidates,
    px,
    py,
    inputW,
    inputH
  );
  if (!best) return { status: "succeeded", mask: null };

  try {
    const maskRes = await fetch(best);
    if (!maskRes.ok) return { status: "succeeded", mask: null };
    const maskBuffer = await maskRes.arrayBuffer();
    const base64 = Buffer.from(maskBuffer).toString("base64");
    const ct = maskRes.headers.get("content-type") || "image/png";
    return { status: "succeeded", mask: `data:${ct};base64,${base64}` };
  } catch {
    return { status: "succeeded", mask: null };
  }
}

/**
 * Pick the smallest mask that actually contains the user's tap pixel.
 *
 * SAM-2 returns ~9 candidate masks per point. We want the one most
 * specific to the click — that's the smallest by white-pixel area
 * AMONG masks that include the click point (i.e. the pixel at the click
 * position is "on" in the mask). Masks that don't contain the click are
 * discarded outright; if none contain it (model misfired), we fall back
 * to the smallest overall as a least-bad guess.
 *
 * Mask images may not match the input image dimensions exactly — they're
 * scaled to the mask's own width/height before checking.
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

  type Inspected = { url: string; area: number; contains: boolean };
  const inspected = await Promise.all(
    urls.map(async (url): Promise<Inspected | null> => {
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

        // Map tap (px, py) from input image coords to this mask's coords
        const mx = Math.round((px / inputW) * w);
        const my = Math.round((py / inputH) * h);
        const idx = my * w + mx;
        const contains = idx >= 0 && idx < data.length && data[idx] > 128;

        let area = 0;
        for (let i = 0; i < data.length; i++) {
          if (data[i] > 128) area++;
        }
        return { url, area, contains };
      } catch {
        return null;
      }
    })
  );

  const valid = inspected.filter((m): m is Inspected => m !== null);
  if (valid.length === 0) return urls[0];

  const containing = valid.filter((m) => m.contains);
  const pool = containing.length > 0 ? containing : valid;
  pool.sort((a, b) => a.area - b.area);

  console.log(
    `[segment-point] Picked mask area=${pool[0].area} (${containing.length}/${valid.length} contained the tap pixel)`
  );
  return pool[0].url;
}

/* ------------------------------------------------------------------ */

async function getImageDims(
  imageInput: string
): Promise<{ w: number; h: number }> {
  try {
    if (imageInput.startsWith("data:")) {
      const commaIdx = imageInput.indexOf(",");
      if (commaIdx === -1) return { w: 1280, h: 720 };
      const b64 = imageInput.substring(commaIdx + 1);
      const buffer = Buffer.from(b64, "base64");
      const sharp = (await import("sharp")).default;
      const meta = await sharp(buffer).metadata();
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
    const commaIdx = imageInput.indexOf(",");
    if (commaIdx === -1) return imageInput;
    const header = imageInput.substring(0, commaIdx);
    if (!header.includes(";base64")) return imageInput;
    const b64 = imageInput.substring(commaIdx + 1);
    const buffer = Buffer.from(b64, "base64");
    let sharp: typeof import("sharp");
    try {
      sharp = (await import("sharp")).default;
    } catch {
      return imageInput;
    }
    const img = sharp(buffer);
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
