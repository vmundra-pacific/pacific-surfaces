import type { Metadata } from "next";
import SillsPage from "@/components/sections/spaces/SillsPage";
import { BreadcrumbList, FaqSchema } from "@/components/global/JsonLd";
import { SILLS_PAGE } from "@/data/thresholds-and-sills";

/**
 * /products/pacific-european-window-sill-threshold-collection: window
 * sills, door sills and thresholds, a category of its own under Products
 * (owner, 2026-10-05; they are not sold through the store), laid out like
 * the kitchens page, in granite and quartz. Copy, figures and
 * media are in data/thresholds-and-sills.ts; the layout is
 * components/sections/spaces/SillsPage.tsx.
 */

const PATH = "/products/pacific-european-window-sill-threshold-collection";
const COLLECTION = SILLS_PAGE.hero.title;
const DESCRIPTION =
  "Granite and quartz window sills, window thresholds and door thresholds, cut to size and edge-bevelled. Popular sizes, crate weights and areas, colours, finishes, packing, MOQ and HS codes.";

export const metadata: Metadata = {
  // The collection's name less its leading "Pacific", so the search
  // result fits without cutting the brand; the page's H1 is unchanged.
  title: `${COLLECTION.replace(/^Pacific /, "")} | Pacific Surfaces`,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  // A page-level openGraph replaces the root layout's wholesale, so the
  // type, site name and locale set there are repeated here.
  openGraph: {
    type: "website",
    siteName: "Pacific Surfaces",
    locale: "en_IN",
    title: `${COLLECTION} | Pacific Surfaces`,
    description: DESCRIPTION,
    url: PATH,
    images: [
      {
        url: SILLS_PAGE.hero.image,
        width: 1536,
        height: 1024,
        alt: SILLS_PAGE.hero.alt,
      },
    ],
  },
};

export default function WindowSillThresholdCollectionPage() {
  return (
    <>
      <BreadcrumbList
        items={[
          { name: "Home", url: "/" },
          { name: "Products", url: "/products" },
          { name: COLLECTION, url: PATH },
        ]}
      />
      <FaqSchema faqs={SILLS_PAGE.faqs} />
      <SillsPage />
    </>
  );
}
