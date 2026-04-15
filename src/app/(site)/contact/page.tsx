import type { Metadata } from "next";
import { ContactContent } from "@/components/sections/ContactContent";

export const metadata: Metadata = {
  title: "Contact — Pacific Surfaces",
  description:
    "Get in touch with Pacific Surfaces for quotes, samples, and project inquiries.",
};

export default function ContactPage() {
  return <ContactContent />;
}
