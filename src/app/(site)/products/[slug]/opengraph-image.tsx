import { ImageResponse } from "next/og";
import { client } from "@/sanity/lib/client";
import { productBySlugQuery } from "@/sanity/lib/queries";
import { sanityImg } from "@/lib/sanity-img";
import {
  CATEGORY_PAGES,
  isCategorySlug,
  resolveCategoryPage,
} from "../_lib/category";

/**
 * Per-product / per-category OG image. Generated on the edge from the
 * product's main image with a brand overlay (gradient scrim + product
 * name + Pacific wordmark). LinkedIn shares of /products/calacatta-
 * couture now show a real product photo with caption instead of the
 * generic homepage card.
 *
 * Falls back gracefully if the slug isn't a product or category —
 * Vercel will then serve the parent route's opengraph-image.tsx
 * (the homepage default).
 */

export const alt = "Pacific Surfaces";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "edge";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function Image({ params }: Props) {
  const { slug } = await params;

  // Branch 1: category page.
  if (isCategorySlug(slug)) {
    const data = await resolveCategoryPage(slug);
    const title = data?.collection?.name ?? "Surfaces";
    const heroImage = (
      data?.config?.hero as { image?: string } | undefined
    )?.image;
    return renderCard({
      title,
      eyebrow: "Pacific · Surfaces",
      bgImage: heroImage,
    });
  }

  // Branch 2: product detail.
  const product = await client.fetch(productBySlugQuery, { slug });
  if (!product) {
    return renderCard({
      title: "Pacific Surfaces",
      eyebrow: "Premium Stone & Quartz",
    });
  }
  const bgImage = product.mainImage
    ? sanityImg(product.mainImage, { w: 1200, h: 630, q: 80, fit: "crop" })
    : undefined;
  return renderCard({
    title: product.name,
    eyebrow: product.collection?.name ?? product.category?.name ?? "Surface",
    bgImage,
  });
}

/** Shared card layout — branded scrim + title block over an optional
 *  background image. */
function renderCard({
  title,
  eyebrow,
  bgImage,
}: {
  title: string;
  eyebrow: string;
  bgImage?: string;
}) {
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
        {/* Background image */}
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

        {/* Scrim — bottom-up dark gradient so text always reads */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(12,29,39,0.45) 0%, rgba(12,29,39,0.85) 70%, rgba(12,29,39,0.95) 100%)",
          }}
        />

        {/* Content */}
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
          {/* Top — eyebrow */}
          <div
            style={{
              fontSize: 18,
              letterSpacing: 7,
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.6)",
              fontWeight: 500,
            }}
          >
            {eyebrow}
          </div>

          {/* Bottom — title + brand */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 32,
            }}
          >
            <div
              style={{
                fontSize: 92,
                fontWeight: 300,
                lineHeight: 1.02,
                letterSpacing: -2,
                color: "white",
                maxWidth: 980,
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
