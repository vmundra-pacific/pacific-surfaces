import type { Metadata } from "next";
import { HeroTerminal } from "@/components/sections/HeroTerminal";
import { HeroTerminalIndustries } from "@/components/sections/HeroTerminalIndustries";
import { BrandMarquee } from "@/components/sections/FeaturesMarquee";
import { OriginSection } from "@/components/sections/OriginSection";
import { StatementSection } from "@/components/sections/StatementSection";
import { HorizontalShowcase } from "@/components/sections/HorizontalShowcase";
import { BenefitsSection } from "@/components/sections/BenefitsSection";
import { EcosurfacesBanner } from "@/components/sections/EcosurfacesBanner";
import { FabCreations } from "@/components/sections/FabCreations";
import { ApplicationShowcase } from "@/components/sections/ApplicationShowcase";
import { TestimonialSection } from "@/components/sections/TestimonialSection";
import { FeaturesSection } from "@/components/sections/FeaturesMarquee";
import { PartnerWithUs } from "@/components/sections/PartnerWithUs";
import { CTASection } from "@/components/sections/CTASection";

export const metadata: Metadata = {
  title: "Pacific Surfaces — Premium Quartz & Granite Surfaces",
  description:
    "Discover premium quartz slabs, granite surfaces, and semi-precious stones for countertops, vanities, flooring, and wall cladding. Engineered for beauty and durability.",
  keywords: [
    "quartz slabs",
    "granite surfaces",
    "kitchen countertops",
    "bathroom vanities",
    "premium surfaces",
    "Pacific Surfaces",
  ],
};

export default function HomePage() {
  return (
    <>
      <HeroTerminalIndustries />
      <BrandMarquee />
      <OriginSection />
      <StatementSection
        statement="Imagine surfaces as an intelligent bridge seamlessly connecting artistry to architecture."
        theme="light"
      />
      <HorizontalShowcase />
      <BenefitsSection />
      <EcosurfacesBanner />
      <FabCreations />
      <StatementSection
        statement="Our journey begins where conventionality ends. Challenges are our guiding stars, and innovation is our trusted compass."
        theme="dark"
      />
      <ApplicationShowcase />
      <TestimonialSection />
      <FeaturesSection />
      <PartnerWithUs />
      <CTASection />
    </>
  );
}
