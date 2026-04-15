import type { Metadata } from "next";
import { SustainabilityContent } from "@/components/sections/SustainabilityContent";

export const metadata: Metadata = {
  title: "Sustainability — Pacific Surfaces",
  description:
    "Discover Pacific Surfaces' commitment to environmental sustainability. Powered by renewable energy, water conservation, and low-silica ecosurfaces.",
};

export default function SustainabilityPage() {
  return <SustainabilityContent />;
}
