import type { Metadata } from "next";
import { AboutContent } from "@/components/sections/AboutContent";

import { FAQ } from "@/components/sections/FAQ";
import { getFaqs } from "@/lib/faqs";
export const metadata: Metadata = {
  title: "About Pacific Surfaces — Engineered Stone Manufacturer",
  description:
    "Pacific Surfaces engineers premium quartz and granite slabs from a 378,000 sq ft facility in India, shipping to 45+ countries since 2011. Discover the team and process.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const faqs = await getFaqs("about");
  return (
    <>
      <AboutContent />
      <FAQ questions={faqs} theme="light" />
    </>
  );
}
