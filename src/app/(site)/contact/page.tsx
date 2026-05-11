import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactContent } from "@/components/sections/ContactContent";

export const metadata: Metadata = {
  title: "Contact Pacific Surfaces — Sales, Samples & Project Enquiries",
  description:
    "Request a quote, order samples, or speak to our team. Pacific Surfaces ships premium quartz and granite to 45+ countries from our India facility.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  // Suspense boundary required for `useSearchParams` inside
  // ContactContent — Next.js 15 needs it so static rendering can
  // hydrate the URL params without blocking the rest of the page.
  return (
    <Suspense fallback={null}>
      <ContactContent />
    </Suspense>
  );
}
