import type { Metadata } from "next";
import { BreadcrumbList } from "@/components/global/JsonLd";
import { WhereToBuy } from "@/components/where-to-buy/WhereToBuy";
import { ORG_ID, SITE_URL } from "@/data/business";
import { safeJsonLd } from "@/lib/escape";
import { DEALERS } from "@/lib/where-to-buy";

/**
 * Where to Buy: dealers, distributors and studios that show Pacific
 * Surfaces. Pilot: Bengaluru, from src/data/dealers-bangalore.json
 * (regenerate with scripts/build-dealers-bangalore.py).
 */

const TITLE =
  "Where to Buy Pacific Surfaces Quartz & Granite | Dealers in Bengaluru";
const DESCRIPTION = `Find Pacific Surfaces dealers, distributors and kitchen and interior studios in Bengaluru: ${DEALERS.length} outlets by area and PIN code, with directions, phone numbers and what is on display.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/where-to-buy" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/where-to-buy",
  },
};

/** The outlets as an ItemList of Stores, so search can read the directory. */
function DealerListSchema() {
  const json = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Where to buy Pacific Surfaces in Bengaluru",
    url: `${SITE_URL}/where-to-buy`,
    numberOfItems: DEALERS.length,
    itemListElement: DEALERS.map((d, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Store",
        name: d.name,
        address: {
          "@type": "PostalAddress",
          ...(d.address ? { streetAddress: d.address } : {}),
          addressLocality:
            d.area === "Bengaluru" ? "Bengaluru" : `${d.area}, Bengaluru`,
          addressRegion: "Karnataka",
          ...(d.pin ? { postalCode: d.pin } : {}),
          addressCountry: "IN",
        },
        geo: { "@type": "GeoCoordinates", latitude: d.lat, longitude: d.lng },
        ...(d.phone ? { telephone: d.phone.href.replace("tel:", "") } : {}),
        brand: { "@id": ORG_ID },
      },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(json) }}
    />
  );
}

export default function WhereToBuyPage() {
  return (
    <>
      <BreadcrumbList
        items={[
          { name: "Home", url: "/" },
          { name: "Where to buy", url: "/where-to-buy" },
        ]}
      />
      <DealerListSchema />
      <WhereToBuy />
    </>
  );
}
