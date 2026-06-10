import { ImageResponse } from "next/og";

/**
 * Default OG / Twitter share image for the homepage and any route
 * that doesn't define its own opengraph-image.tsx. Renders a
 * branded 1200×630 card via next/og — runtime-generated on demand,
 * cached by Vercel's edge so subsequent shares hit the CDN.
 *
 * The image is intentionally type-only with a deep navy field and
 * the Pacific wordmark — matching the brand and giving social
 * unfurls (LinkedIn / Twitter / WhatsApp / iMessage) a clean,
 * recognizable thumbnail instead of whatever happens to be the
 * first <img> on the page.
 */

export const alt = "Pacific Surfaces — Premium Quartz & Granite";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "edge";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background:
            "linear-gradient(135deg, #0c1d27 0%, #112732 50%, #1a3548 100%)",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Top — wordmark + tagline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{
              fontSize: 18,
              letterSpacing: 7,
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.55)",
              fontWeight: 500,
            }}
          >
            Pacific · Surfaces
          </div>
          <div
            style={{
              fontSize: 18,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.4)",
              fontWeight: 400,
            }}
          >
            Est. 2000 · India
          </div>
        </div>

        {/* Center — headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            maxWidth: 880,
          }}
        >
          <div
            style={{
              fontSize: 88,
              fontWeight: 300,
              lineHeight: 1.05,
              letterSpacing: -2,
              color: "white",
            }}
          >
            Premium quartz
          </div>
          <div
            style={{
              fontSize: 88,
              fontWeight: 300,
              lineHeight: 1.05,
              letterSpacing: -2,
              fontStyle: "italic",
              color: "#9AA8B6",
            }}
          >
            & stone surfaces.
          </div>
        </div>

        {/* Bottom — URL + accent line */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div
            style={{
              fontSize: 22,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.7)",
              fontWeight: 500,
            }}
          >
            pacific-surfaces.com
          </div>
          <div
            style={{
              width: 240,
              height: 2,
              background: "rgba(255,255,255,0.3)",
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
