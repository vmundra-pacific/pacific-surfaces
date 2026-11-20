import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  AnimatedSection,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/animated-section";
import { TRANSLUCENT_COLOURS } from "@/data/translucent";

/**
 * "The collection" on /products/translucent: the five colours of the
 * Translucent Series with the catalogue's own description of each, and
 * a link to the colour's existing product page. Sits between the
 * catalogue grid and whatever follows it, in the same dark panel style
 * as LearnAboutCategory.
 */
export function TranslucentCollection() {
  return (
    <section className="relative py-12 md:py-16 px-6 bg-[#0d1f29]">
      {/* Grain overlay, as on every dark section. */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="relative max-w-[76rem] mx-auto">
        <AnimatedSection className="mb-10 md:mb-12 max-w-2xl">
          <p className="text-[10px] font-medium tracking-[0.3em] uppercase text-pacific-mid mb-3">
            Translucent Series
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight leading-[1.15] text-white">
            The collection.
          </h2>
        </AnimatedSection>
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
          {TRANSLUCENT_COLOURS.map((c) => (
            <StaggerItem key={c.slug} className="h-full">
              <Link
                href={`/products/${c.slug}`}
                className="group flex h-full flex-col rounded-none border border-white/10 bg-white/[0.02] p-6 lg:p-7 hover:bg-white/[0.05] hover:border-white/20 transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="text-xl lg:text-2xl font-light text-white tracking-tight leading-snug">
                    {c.name}
                  </h3>
                  <ArrowRight className="w-4 h-4 text-pacific-mid mt-1.5 shrink-0 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white" />
                </div>
                <p className="text-sm font-light text-pacific-mid leading-relaxed">
                  {c.description}
                </p>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
