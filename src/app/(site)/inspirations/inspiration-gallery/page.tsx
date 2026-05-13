import type { Metadata } from "next";
import { InspirationGallery } from "@/components/sections/InspirationGallery";

export const metadata: Metadata = {
  title: "Inspiration Gallery — Pacific Surfaces",
  description:
    "Project photography, room by room — Pacific surfaces in kitchens, bathrooms, living spaces, commercial interiors, and outdoor settings.",
  alternates: { canonical: "/inspirations/inspiration-gallery" },
};

/**
 * /inspirations/inspiration-gallery
 *
 * Editorial photography landing for installed Pacific projects. The
 * page shell is a server component so metadata is statically rendered;
 * the actual filter + grid runs client-side via InspirationGallery.
 *
 * Currently sourced from a static project list inside the gallery
 * component — easily swappable to a Sanity fetch later without
 * touching this route.
 */
export default function InspirationGalleryPage() {
  return <InspirationGallery />;
}
