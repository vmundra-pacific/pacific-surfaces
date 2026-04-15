import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/segment
 *
 * Uses Grounded SAM (GroundingDINO + SAM) on Replicate to detect and segment
 * surfaces in a room photo by text prompt.
 *
 * Body:
 *   {
 *     image: string (data-URL or public URL),
 *     prompt?: string (default "countertop, kitchen island, backsplash, floor")
 *   }
 *
 * Response:
 *   {
 *     masks: Array<{ url: string (data-URL of mask PNG) }>
 *   }
 *
 * Each mask is a black-and-white PNG where white = detected surface.
 * The order matches the order of labels in the prompt.
 */

const REPLICATE_API = "https://api.replicate.com/v1/predictions";

const GROUNDED_SAM_VERSION =
  "ee871c19efb1941f55f66a3d7d960428c8a5afcb77449547fe8e5a3ab9ebc21c";

const DEFAULT_PROMPT = "countertop, kitchen island, backsplash, floor";

export async function POST(req: NextRequest) {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "REPLICATE_API_TOKEN not configured" },
      { status: 500 },
    );
  }

  let body: { image: string; prompt?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { image, prompt } = body;
  if (!image) {
    return NextResponse.json({ error: "Missing image" }, { status: 400 });
  }

  const maskPrompt = prompt || DEFAULT_PROMPT;

  try {
    // ---- 1. Create prediction ----
    const createRes = await fetch(REPLICATE_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Prefer: "wait", // Replicate sync mode — blocks up to 60s
      },
      body: JSON.stringify({
        version: GROUNDED_SAM_VERSION,
        input: {
          image,
          mask_prompt: maskPrompt,
          adjustment_factor: 0,
        },
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.text();
      console.error("Replicate create error:", err);
      return NextResponse.json(
        { error: "Replicate API error", detail: err },
        { status: 502 },
      );
    }

    let prediction = await createRes.json();

    // ---- 2. Poll until succeeded (if Prefer:wait didn't finish) ----
    let attempts = 0;
    while (
      prediction.status !== "succeeded" &&
      prediction.status !== "failed" &&
      prediction.status !== "canceled" &&
      attempts < 90
    ) {
      await new Promise((r) => setTimeout(r, 1000));
      const pollRes = await fetch(
        `${REPLICATE_API}/${prediction.id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      prediction = await pollRes.json();
      attempts++;
    }

    if (prediction.status !== "succeeded") {
      console.error("Replicate prediction failed:", prediction);
      return NextResponse.json(
        {
          error: "Segmentation failed",
          status: prediction.status,
          detail: prediction.error,
        },
        { status: 502 },
      );
    }

    // ---- 3. Fetch each mask image and return as base64 ----
    // Grounded SAM outputs an array of mask image URLs (one per detected label)
    const output: string[] = Array.isArray(prediction.output)
      ? prediction.output
      : [prediction.output];

    const masks = await Promise.all(
      output
        .filter((url: unknown): url is string => typeof url === "string")
        .map(async (maskUrl: string) => {
          const maskRes = await fetch(maskUrl);
          const maskBuffer = await maskRes.arrayBuffer();
          const base64 = Buffer.from(maskBuffer).toString("base64");
          const ct = maskRes.headers.get("content-type") || "image/png";
          return { url: `data:${ct};base64,${base64}` };
        }),
    );

    return NextResponse.json({ masks });
  } catch (err) {
    console.error("Segment API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
