import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactContent } from "@/components/sections/ContactContent";
import { client } from "@/sanity/lib/client";
import { allDealersQuery } from "@/sanity/lib/queries";

export const metadata: Metadata = {
  title: "Contact Pacific Surfaces — Sales, Samples & Project Enquiries",
  description:
    "Request a quote, order samples, or speak to our team. Pacific Surfaces ships premium quartz and granite to 45+ countries from our India facility.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  // Fetch the full dealer roster server-side so the client component
  // can run the Find A Dealer pincode filter without an extra
  // network round trip from the browser. Empty array on error so the
  // section still renders (it'll just show "no dealers found").
  const dealers = await client
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
