import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/depth
 *
 * Runs monocular depth estimation on a room photo using Depth Anything V2
 * on Replicate. Returns a grayscale depth map as a base64 data-URL PNG.
 *
 * The depth map is used client-side (alongside SAM-2 masks) to:
 *   1. Detect plane boundaries within a single mask
 *   2. Auto-split masks into separate surfaces per plane
 *   3. Estimate surface normals for perspective-aware texture mapping
 *
 * Body:  { image: string (data-URL or public URL) }
 * Response: { depthMap: string (base64 data-URL PNG), width: number, height: number }
 */

const REPLICATE_API = "https://api.replicate.com/v1/predictions";

// Depth Anything V2 — monocular depth estimation (chenxwh/depth-anything-v2)
const DEPTH_VERSION =
  "b239ea33cff32bb7abb5db39ffe9a09c14cbc2894331d1ef66fe096eed88ebd4";

// Max image dimension — same as segment route
const MAX_DIM = 1280;

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
    console.log("[depth] Running Depth Anything V2…");

    const result = await runDepth(token, processedImage);

    if (result.status === "failed") {
      console.error(`[depth] Failed: ${result.error}`);
      return NextResponse.json(
        { error: result.error || "Depth estimation failed" },
        { status: 502 }
      );
    }

    console.log("[depth] Success");
    return NextResponse.json({
      depthMap: result.depthMap,
      width: result.width,
      height: result.height,
    });
  } catch (err) {
    console.error("Depth API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------------ *
 * Run Depth Anything V2 on Replicate                                  *
 * ------------------------------------------------------------------ */

interface DepthResult {
  status: "succeeded" | "failed";
  depthMap: string; // base64 data-URL
  width: number;
  height: number;
  error?: string;
}

async function runDepth(token: string, imageUrl: string): Promise<DepthResult> {
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
        version: DEPTH_VERSION,
        input: {
          image: imageUrl,
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
        `[depth] Rate limited (429), waiting ${wait / 1000}s before retry ${attempt + 1}/3`
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
      depthMap: "",
      width: 0,
      height: 0,
      error: `HTTP ${createRes?.status}: ${err}`,
    };
  }

  let prediction = await createRes.json();

  // Poll if sync mode didn't complete
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
      depthMap: "",
      width: 0,
      height: 0,
      error: prediction.error || `Status: ${prediction.status}`,
    };
  }

  // Depth Anything V2 output is a single URL to the depth map image
  const output = prediction.output;
  const depthUrl =
    typeof output === "string"
      ? output
      : output?.depth_map || output?.[0] || "";

  if (!depthUrl) {
    return {
      status: "failed",
      depthMap: "",
      width: 0,
      height: 0,
      error: "No depth map in output",
    };
  }

  // Fetch the depth map and convert to base64
  try {
    const depthRes = await fetch(depthUrl);
    if (!depthRes.ok) {
      return {
        status: "failed",
        depthMap: "",
        width: 0,
        height: 0,
        error: `Failed to fetch depth map: HTTP ${depthRes.status}`,
      };
    }
    const depthBuffer = await depthRes.arrayBuffer();
    const base64 = Buffer.from(depthBuffer).toString("base64");
    const ct = depthRes.headers.get("content-type") || "image/png";

    // Get dimensions from the image
    let width = 0,
      height = 0;
    try {
      const sharp = (await import("sharp")).default;
      const meta = await sharp(Buffer.from(depthBuffer)).metadata();
      width = meta.width || 0;
      height = meta.height || 0;
    } catch {
      // If sharp unavailable, dimensions will be determined client-side
    }

    return {
      status: "succeeded",
      depthMap: `data:${ct};base64,${base64}`,
      width,
      height,
    };
  } catch (err) {
    return {
      status: "failed",
      depthMap: "",
      width: 0,
      height: 0,
      error: `Fetch error: ${err}`,
    };
  }
}

/* ------------------------------------------------------------------ *
 * Resize data-URL images (reused from segment route)                 *
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
      `[depth] Resized ${w}×${h} → ${Math.min(w, maxDim)}×${Math.min(h, maxDim)}`
    );

    return `data:image/jpeg;base64,${resized.toString("base64")}`;
  } catch (err) {
    console.warn("[depth] Resize failed, using original:", err);
    return imageInput;
  }
}
