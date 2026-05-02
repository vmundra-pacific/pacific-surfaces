import { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import { careersPageQuery, jobOpeningsQuery } from "@/sanity/lib/queries";
import { CareersContent } from "@/components/sections/CareersContent";

export const metadata: Metadata = {
  title: "Careers — Grow with Pacific | Pacific Surfaces",
  description:
    "Join our dynamic team and grow your career with Pacific Surfaces. Explore exciting opportunities across departments and locations.",
  alternates: { canonical: "/careers" },
};

/**
 * /careers — fetch editor-managed page copy + visible job openings
 * from Sanity, then hand off to the client component for rendering
 * + interaction (filter dropdowns, form state, submission).
 *
 * Both queries return null / empty when the corresponding documents
 * don't exist yet, so CareersContent always keeps a built-in
 * fallback for every value (legacy hero copy + the three brand
 * values + a blank job list). Editing or removing those fallbacks
 * is just a matter of editing the singleton or adding documents in
 * /studio — no code changes needed.
 */
export default async function CareersPage() {
  const [pageData, openings] = await Promise.all([
    client.fetch(careersPageQuery),
    client.fetch(jobOpeningsQuery),
  ]);

  return <CareersContent pageData={pageData} openings={openings} />;
}
