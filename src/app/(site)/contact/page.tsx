import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactContent } from "@/components/sections/ContactContent";
import { freshClient } from "@/sanity/lib/client";
import { allDealersQuery } from "@/sanity/lib/queries";

export const metadata: Metadata = {
  title: "Contact Pacific Surfaces — Sales, Samples & Project Enquiries",
  description:
    "Request a quote, order samples, or speak to our team. Pacific Surfaces ships premium quartz and granite to 45+ countries from our India facility.",
  alternates: { canonical: "/contact" },
};

// Revalidate the dealer list every 60 seconds. Without this, the
// page is statically generated at build time and editors adding
// dealers in Sanity Studio wouldn't see them on /contact until the
// next deploy. 60s is a sensible balance: dealer data changes
// rarely, and 60s of staleness on a freshly-added dealer is
// acceptable for the use case.
export const revalidate = 60;

export default async function ContactPage() {
  // Fetch the full dealer roster server-side so the client component
  // can run the Find A Dealer pincode filter without an extra
  // network round trip from the browser. We use `freshClient`
  // (useCdn: false) rather than the default `client` so editor
  // additions in Sanity Studio reach the page on the next
  // revalidation cycle instead of waiting for Sanity's CDN cache
  // to expire. Empty array on error so the section still renders.
  const dealers = await freshClient
    .fetch(allDealersQuery)
    .catch(() => [] as never[]);

  // Suspense boundary required for `useSearchParams` inside
  // ContactContent — Next.js 15 needs it so static rendering can
  // hydrate the URL params without blocking the rest of the page.
  return (
    <Suspense fallback={null}>
      <ContactContent dealers={dealers} />
    </Suspense>
  );
}
