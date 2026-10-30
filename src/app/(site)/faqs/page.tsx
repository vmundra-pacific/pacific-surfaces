import type { Metadata } from "next";
import { BreadcrumbList, FaqSchema } from "@/components/global/JsonLd";
import { FaqsContent, type FaqGroup } from "@/components/sections/FaqsContent";
import { getFaqs, type FaqPageKey } from "@/lib/faqs";

export const metadata: Metadata = {
  title: "FAQs: Quartz, Granite, Vanity and More | Pacific Surfaces",
  description:
    "Answers to the questions we are asked most about Pacific Surfaces quartz, granite, semi-precious stones, sinks, vanities and facades: sizes, care, heat, sealing and sourcing.",
  alternates: { canonical: "/faqs" },
};

// Rebuilt at most once a minute, like /resources, so a Sanity faqPage edit
// shows here as it does on the product page it belongs to.
export const revalidate = 60;

/** The sets the product pages already show (lib/faqs, Sanity first), in the
 *  order the header lists the products. */
const GROUPS: { key: FaqPageKey; id: string; label: string }[] = [
  { key: "quartz", id: "quartz", label: "Quartz" },
  { key: "granites", id: "granite", label: "Granite" },
  { key: "semi-precious", id: "semi-precious", label: "Semi-precious stones" },
  { key: "exotic", id: "exotic", label: "Exotic" },
  { key: "integra", id: "sinks", label: "Integra sinks" },
  {
    key: "centrepiece-couture",
    id: "centrepiece-couture",
    label: "Centrepiece Couture",
  },
  {
    key: "facades-and-finishes",
    id: "facades-and-finishes",
    label: "Facades and finishes",
  },
  { key: "vanity", id: "vanity", label: "Vanity" },
];

export default async function FaqsPage() {
  const sets = await Promise.all(GROUPS.map((g) => getFaqs(g.key)));
  const groups: FaqGroup[] = GROUPS.map((g, i) => ({
    id: g.id,
    label: g.label,
    questions: sets[i],
  })).filter((g) => g.questions.length > 0);

  return (
    <>
      <BreadcrumbList
        items={[
          { name: "Home", url: "/" },
          { name: "FAQs", url: "/faqs" },
        ]}
      />
      <FaqSchema
        faqs={groups.flatMap((g) =>
          g.questions.map((f) => ({ question: f.q, answer: f.a }))
        )}
      />
      <FaqsContent groups={groups} />
    </>
  );
}
