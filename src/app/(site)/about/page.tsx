import type { Metadata } from "next";
import { AboutContent } from "@/components/sections/AboutContent";

import { FAQ } from "@/components/sections/FAQ";
import { getFaqs } from "@/lib/faqs";
export const metadata: Metadata = {
  title: "About — Pacific Surfaces",
  description:
    "Learn about Pacific Surfaces, India's premium quartz and granite surface manufacturer. Quality, innovation, and craftsmanship.",
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
