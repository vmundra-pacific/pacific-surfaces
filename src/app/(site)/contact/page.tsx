import type { Metadata } from "next";
import { ContactContent } from "@/components/sections/ContactContent";

export const metadata: Metadata = {
  title: "Contact Pacific Surfaces — Sales, Samples & Project Enquiries",
  description:
    "Request a quote, order samples, or speak to our team. Pacific Surfaces ships premium quartz and granite to 45+ countries from our India facility.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return <ContactContent />;
}
