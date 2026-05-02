import { ImageResponse } from "next/og";
// rawClient bypasses the cdn.sanity.io → /api/cdn/* rewrite so the
// edge runtime baking this PNG can fetch the hero image directly
// from Sanity's CDN. The proxy is for browser requests; OG generation
// is server-to-server and doesn't carry cookies anyway.
import { rawClient as client } from "@/sanity/lib/client";
import { blogPostBySlugQuery } from "@/sanity/lib/queries";
import { sanityImg } from "@/lib/sanity-img";

/**
 * Per-blog-post OG image. Renders the post's hero image as background,
 * with the post title and "Field Notes" eyebrow on a dark scrim.
 * Cached by Vercel after first render so subsequent unfurls are
 * served from CDN.
 */

export const alt = "Pacific Surfaces — Field Notes";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "edge";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const post = await client.fetch(blogPostBySlugQuery, { slug });

  const title = post?.title ?? "Field Notes";
  const eyebrow = "Field Notes · The Pacific Journal";
  const bgImage = post?.mainImage
    ? sanityImg(post.mainImage, { w: 1200, h: 630, q: 80, fit: "crop" })
    : undefined;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          position: "relative",
          background:
            "linear-gradient(135deg, #0c1d27 0%, #112732 50%, #1a3548 100%)",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {bgImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bgImage}
            alt=""
            width={1200}
            height={630}
            style={{
              position: "absolute",
              inset: 0,
              objectFit: "cover",
              width: "100%",
              height: "100%",
            }}
          />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(12,29,39,0.45) 0%, rgba(12,29,39,0.85) 65%, rgba(12,29,39,0.95) 100%)",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "72px 80px",
            width: "100%",
            height: "100%",
          }}
        >
          <div
            style={{
              fontSize: 18,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.6)",
              fontWeight: 500,
            }}
          >
            {eyebrow}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 32,
            }}
          >
            <div
              style={{
                fontSize: 76,
                fontWeight: 300,
                lineHeight: 1.1,
                letterSpacing: -1,
                color: "white",
                maxWidth: 1000,
              }}
            >
              {title}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
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
                  width: 220,
                  height: 2,
                  background: "rgba(255,255,255,0.35)",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
