import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/segment
 *
 * Automatic mask generation using SAM-2 (Meta's Segment Anything Model 2)
 * on Replicate. Returns every distinct surface in the photo as a list of
 * masks the client can highlight + tap to select.
 *
 * Why SAM-2 AMG (not Grounded SAM)?
 *   - Grounded SAM's Replicate container has been broken (`pip install`
 *     fails on cold-start) so the previous text-prompt pipeline was
 *     returning empty masks.
 *   - SAM-2 is the same model `/api/segment-point` already uses, so we
 *     know it works reliably with this account.
 *   - AMG ("automatic mask generator") spits out every surface in one
 *     pass, no text prompts, no fallback ladder.
 *
 * Body:     { image: string (data-URL or public URL) }
 * Response: { masks: Array<{ url: string, label: string }>, warning?: string }
 *           or { error: string }
 */

const REPLICATE_API = "https://api.replicate.com/v1/predictions";

// SAM-2 — same model version as /api/segment-point. AMG mode is selected by
// omitting point prompts and supplying grid sampling parameters instead.
const SAM2_VERSION =
  "fe97b453a6455861e3bac769b441ca1f1086110da7466dbb65cf1eecfd60dc83";

const MAX_DIM = 1280;

// AMG tuning. We loosened pred_iou_thresh from 0.93 → 0.85 because the
// stricter setting was rejecting the largest, most-uniform surface in the
// frame (e.g. a dark stone countertop) on plenty of real photos — SAM-2's
// confidence on huge low-detail regions tends to fall just below 0.93. The
// missed surface is recoverable via the point-tap fallback, but we'd rather
// have it land in the auto pass when possible.
//   points_per_side    16   (256 candidate points; balances coverage / speed)
//   pred_iou_thresh    0.85 (let big-but-confident-enough masks through)
//   stability_thresh   0.92 (slightly looser too; prevents AMG dropping
//                            masks that don't survive the lowered IoU bar)
const AMG_INPUT = {
  points_per_side: 16,
  pred_iou_thresh: 0.85,
  stability_score_thresh: 0.92,
  use_m2m: true,
};

// Cap masks returned to the client — more than this clutters the UI.
const MAX_MASKS = 6;

export async function POST(req: NextRequest) {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "REPLICATE_API_TOKEN not configured" },
      { status: 500 }
    );
  }

  let body: { image: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { image } = body;
  if (!image) {
    return NextResponse.json({ error: "Missing image" }, { status: 400 });
  }

  try {
    const processedImage = await resizeIfNeeded(image, MAX_DIM);
    console.log("[segment] Running SAM-2 AMG…");

    const result = await runAutoSAM2(token, processedImage);

    if (result.status === "rate_limited") {
      // Surface a clear, user-friendly message instead of a generic 502.
      return NextResponse.json(
        {
          error:
            "Replicate rate-limited the request — your account has low credit, so the burst limit is 1/min. Top up at replicate.com/account/billing or wait ~1 minute and retry.",
        },
        { status: 429 }
      );
    }

    if (result.status === "failed") {
      console.error(`[segment] Failed: ${result.error}`);
      return NextResponse.json(
        { error: result.error || "Segmentation failed" },
        { status: 502 }
      );
    }

    if (result.masks.length === 0) {
      console.warn("[segment] SAM-2 returned 0 masks");
      return NextResponse.json({
        masks: [],
        warning: "No surfaces auto-detected. Tap to select manually.",
      });
    }

    const masks = result.masks.slice(0, MAX_MASKS).map((url, i) => ({
      url,
      label: `Surface ${i + 1}`,
    }));

    console.log(`[segment] Success — ${masks.length} mask(s)`);
    return NextResponse.json({ masks });
  } catch (err) {
    console.error("Segment API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------------ *
 * Run SAM-2 in automatic mask generation mode                         *
 * ------------------------------------------------------------------ */

interface AutoResult {
  status: "succeeded" | "failed" | "rate_limited";
  masks: string[]; // base64 data-URLs
  error?: string;
}

async function runAutoSAM2(
  token: string,
  imageUrl: string
): Promise<AutoResult> {
  let createRes: Response | null = null;

  // Up to 3 retries on 429 — but if every retry hits 429, surface
  // rate_limited so the client can tell the user to top up credit.
  let lastWasRateLimit = false;
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
          ...AMG_INPUT,
        },
      }),
    });

    if (createRes.status === 429) {
      lastWasRateLimit = true;
      const retryAfter = parseInt(
        createRes.headers.get("retry-after") || "12",
        10
      );
      const wait = Math.max(retryAfter, 10) * 1000;
      console.warn(
        `[segment] Rate limited (429), waiting ${wait / 1000}s before retry ${attempt + 1}/3`
      );
      await new Promise((r) => setTimeout(r, wait));
      continue;
    }
    lastWasRateLimit = false;
    break;
  }

  if (lastWasRateLimit && createRes && createRes.status === 429) {
    return { status: "rate_limited", masks: [] };
  }

  if (!createRes || !createRes.ok) {
    const err = createRes ? await createRes.text() : "No response";
    return {
      status: "failed",
      masks: [],
      error: `HTTP ${createRes?.status}: ${err}`,
    };
  }

  let prediction = await createRes.json();

  // Poll until done
  let attempts = 0;
  while (
    prediction.status !== "succeeded" &&
    prediction.status !== "failed" &&
    prediction.status !== "canceled" &&
    attempts < 90
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
      masks: [],
      error: prediction.error || `Status: ${prediction.status}`,
    };
  }

  // SAM-2 AMG output shape: { combined_mask, individual_masks: [url, …] }
  // We use individual_masks so each surface is selectable independently.
  const output = prediction.output;
  const urls: string[] =
    (Array.isArray(output?.individual_masks)
      ? output.individual_masks
      : null) ??
    (Array.isArray(output) ? output : null) ??
    (output?.combined_mask ? [output.combined_mask] : []);

  const validUrls = urls.filter(
    (url): url is string => typeof url === "string" && url.startsWith("http")
  );

  if (validUrls.length === 0) {
    return { status: "succeeded", masks: [] };
  }

  // Fetch each mask and convert to base64 data-URL so the client doesn't
  // need to deal with cross-origin image loading.
  const masks = await Promise.all(
    validUrls.map(async (maskUrl) => {
      try {
        const maskRes = await fetch(maskUrl);
        if (!maskRes.ok) return null;
        const maskBuffer = await maskRes.arrayBuffer();
        const base64 = Buffer.from(maskBuffer).toString("base64");
        const ct = maskRes.headers.get("content-type") || "image/png";
        return `data:${ct};base64,${base64}`;
      } catch {
        return null;
      }
    })
  );

  return {
    status: "succeeded",
    masks: masks.filter((m): m is string => m !== null),
  };
}

/* ------------------------------------------------------------------ *
 * Resize data-URL images to prevent OOM on Replicate                  *
 * ------------------------------------------------------------------ */

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

    console.log(
      `[segment] Resized ${w}×${h} → ${Math.min(w, maxDim)}×${Math.min(h, maxDim)}`
    );

    return `data:image/jpeg;base64,${resized.toString("base64")}`;
  } catch (err) {
    console.warn("[segment] Resize failed, using original:", err);
    return imageInput;
  }
}
