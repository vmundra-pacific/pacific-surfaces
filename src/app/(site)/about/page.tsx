import type { Metadata } from "next";
import { AboutContent } from "@/components/sections/AboutContent";

export const metadata: Metadata = {
  title: "About — Pacific Surfaces",
  description:
    "Learn about Pacific Surfaces, India's premium quartz and granite surface manufacturer. Quality, innovation, and craftsmanship.",
};

export default function AboutPage() {
  return <AboutContent />;
}
