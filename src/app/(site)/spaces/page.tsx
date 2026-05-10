import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { ArrowRight } from "lucide-react";

/**
 * /spaces — top-level nav target introduced per the Sidharth UI/UX deck.
 * Editorial overview of the rooms / environments where Pacific surfaces
 * live: kitchens, baths, facades, commercial. This is currently a stub
 * scaffolded with placeholder copy and tile cards that link into the
 * matching ApplicationsScrollSections card targets. Editorial team can
 * fill in real imagery + long-form copy as content lands.
 */
export const metadata: Metadata = {
  title: "Spaces — Pacific Surfaces",
  description:
    "Where Pacific surfaces live — kitchens, bathrooms, architecture, and commercial environments around the world.",
  alternates: { canonical: "/spaces" },
};

const SPACES = [
  {
    title: "Kitchens",
    blurb:
      "Quartz worktops engineered to take heat, knives, wine, and twenty-five years of weeknight cooking without flinching.",
    href: "/spaces/kitchens",
  },
  {
    title: "Bathrooms",
    blurb:
      "Vanity tops and wall surfaces with seamless joints, hand-finished edges, and stain resistance you don't have to think about.",
    href: "/spaces/bathrooms",
  },
  {
    title: "Architecture",
    blurb:
      "Super-jumbo slabs for facades, cladding, and feature walls — large-format surfaces that read as a single uninterrupted plane.",
    href: "/spaces/architecture",
  },
  {
    title: "Commercial",
    blurb:
      "Hospitality, retail, workspace. Surfaces specified for high-traffic environments where appearance and durability both have to last.",
    href: "/spaces/commercial",
  },
];

export default function SpacesPage() {
  return (
    <>
      <PageHeader
        badge="Spaces"
        title="Where stone belongs."
        description="Pacific surfaces are designed for the rooms people actually live in — kitchens that get cooked in, bathrooms that get used, public spaces that move."
      />

      <section className="py-20 md:py-28 px-6">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {SPACES.map((s) => (
            <Link
              key={s.title}
              href={s.href}
              className="group relative block rounded-2xl border border-stone-200 bg-white p-8 sm:p-10 hover:border-stone-300 hover:shadow-[0_8px_28px_rgba(0,0,0,0.06)] transition-all duration-300"
            >
              <div className="aspect-[16/9] w-full mb-8 rounded-xl bg-gradient-to-br from-stone-100 via-stone-50 to-stone-200 flex items-center justify-center text-stone-400">
                <span className="text-[10px] font-medium tracking-[0.3em] uppercase">
                  [ {s.title.toLowerCase()} placeholder ]
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-stone-900 mb-3">
                {s.title}
              </h2>
              <p className="text-sm font-light text-stone-600 leading-relaxed mb-6">
                {s.blurb}
              </p>
              <span className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.2em] uppercase text-stone-900 group-hover:gap-3 transition-all">
                Explore
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
