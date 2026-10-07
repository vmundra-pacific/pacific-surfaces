import type { Metadata } from "next";
import { ContactContent } from "@/components/sections/ContactContent";
import { freshClient } from "@/sanity/lib/client";
import { allDealersQuery } from "@/sanity/lib/queries";

export const metadata: Metadata = {
  title: "Contact Pacific Surfaces — Sales, Samples & Project Enquiries",
  description:
    "Quotes, samples and project enquiries for Pacific Surfaces. Visit the quartz factory and experience centre, Mon to Sat, 9 am to 8 pm, or call +91 98940 33566.",
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

  // No Suspense here: ContactContent keeps its one useSearchParams in a
  // boundary of its own, so the page's copy, H1 and factory address are
  // in the server HTML.
  return <ContactContent dealers={dealers} />;
}
