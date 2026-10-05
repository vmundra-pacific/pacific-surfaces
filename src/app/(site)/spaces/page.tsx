import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { ArrowRight } from "lucide-react";

/**
 * /spaces: the six space pages, each a card with a photograph from the
 * project library (the same photographs the Spaces menu uses where they
 * overlap).
 */
export const metadata: Metadata = {
  title: "Spaces — Pacific Surfaces",
  description:
    "Where Pacific surfaces live: kitchens, bathrooms, architecture, commercial, hospitality and outdoor spaces around the world.",
  alternates: { canonical: "/spaces" },
};

const SPACES = [
  {
    title: "Kitchens by Pacific Surfaces",
    blurb:
      "Quartz worktops, islands and backsplashes engineered for everyday cooking, spills and wine, and a lifetime of weeknight dinners.",
    href: "/spaces/kitchens",
    image: "/projects/islands/orenda-application.webp",
    alt: "A kitchen island and worktop in Orenda",
  },
  {
    title: "Bathrooms by Pacific Surfaces",
    blurb:
      "Vanity tops, shower walls and integrated basins with tight joints, finished edges and a non-porous face that keeps water on top.",
    href: "/spaces/bathrooms",
    image: "/projects/bathrooms/bathtub.webp",
    alt: "A freestanding bath beside a stone-clad shower",
  },
  {
    title: "Architecture by Pacific Surfaces",
    blurb:
      "Superjumbo slabs for facades, cladding and feature walls: large-format surfaces that read as one uninterrupted plane.",
    href: "/spaces/architecture",
    image: "/projects/cladding/horizon-veil.webp",
    alt: "A living-room wall clad in large-format stone",
  },
  {
    title: "Commercial by Pacific Surfaces",
    blurb:
      "Retail, workspace and public interiors. Surfaces specified for high-traffic rooms where appearance and durability both have to last.",
    href: "/spaces/commercial",
    image: "/projects/cladding/ruskin.webp",
    alt: "A stone-clad interior wall in Ruskin",
  },
  {
    title: "Hospitality by Pacific Surfaces",
    blurb:
      "Hotels, restaurants and bars: feature walls, counters and vanities matched slab to slab across every room of a project.",
    href: "/spaces/hospitality",
    image: "/projects/cladding/tiffany.webp",
    alt: "A restaurant booth against a green stone wall",
  },
  {
    title: "Outdoor by Pacific Surfaces",
    blurb:
      "Granite and stone for terraces, outdoor kitchens and garden counters, chosen for sun, rain and the grill.",
    href: "/spaces/outdoor",
    image: "/projects/islands/almond-mist-application.webp",
    alt: "An outdoor kitchen island in Almond Mist",
  },
];

export default function SpacesPage() {
  return (
    <>
      <PageHeader
        badge="Spaces"
        title="Where stone belongs."
        description="Pacific surfaces are designed for the rooms people actually live in: kitchens that get cooked in, bathrooms that get used, public spaces that move."
      />

      <section className="py-20 md:py-28 px-6">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
          {SPACES.map((s) => (
            <Link
              key={s.title}
              href={s.href}
              className="group relative block rounded-2xl border border-pacific-mid/20 bg-white p-6 sm:p-8 hover:border-pacific-mid/30 hover:shadow-[0_8px_28px_rgba(0,0,0,0.06)] transition-all duration-300"
            >
              <div className="mb-7 overflow-hidden rounded-xl">
                <div className="relative aspect-[16/10] w-full">
                  <Image
                    src={s.image}
                    alt={s.alt}
                    fill
                    sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-pacific-dark mb-3">
                {s.title}
              </h2>
              <p className="text-sm font-light text-pacific-dark/70 leading-relaxed mb-6">
                {s.blurb}
              </p>
              <span className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.2em] uppercase text-pacific-dark group-hover:gap-3 transition-all">
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
