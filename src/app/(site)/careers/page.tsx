import { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import { careersPageQuery, jobOpeningsQuery } from "@/sanity/lib/queries";
import { BreadcrumbList } from "@/components/global/JsonLd";
import { CareersContent } from "@/components/sections/CareersContent";

// Re-render at most every 60s so new job openings published in
// Sanity appear without a redeploy.
export const revalidate = 60;

// No JobPosting data here: Google wants it on each job's own page, never
// on a page that lists jobs. Give each role a page first.
export const metadata: Metadata = {
  title: "Careers at Pacific Surfaces | Open Roles",
  description:
    "Open roles at Pacific Surfaces in sales, marketing, HR and technology, in cities across India. Read each role, then apply online with your CV.",
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

  return (
    <>
      <BreadcrumbList
        items={[
          { name: "Home", url: "/" },
          { name: "Careers", url: "/careers" },
        ]}
      />
      <CareersContent pageData={pageData} openings={openings} />
    </>
  );
}
