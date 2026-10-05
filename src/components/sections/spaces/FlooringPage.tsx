"use client";

import Image from "next/image";
import { FLOORING_PAGE } from "@/data/flooring-page";
import {
  Container,
  Heading,
  LIGHT,
  PANEL,
  SpaceColours,
  SpaceCrumbs,
  SpaceDesign,
  SpaceFaqs,
  SpaceGallery,
  SpaceOthers,
  SpaceTabs,
  Split,
  type SpaceColour,
} from "@/components/sections/spaces/SpaceBlocks";
import { cn } from "@/lib/utils";

/**
 * /applications/flooring, "Flooring by Pacific Surfaces", laid out like the
 * kitchens page (shared blocks in SpaceBlocks) with three sections of its
 * own: the finishes, the paver formats and the technical data. Copy, media
 * and figures are in data/flooring-page.ts, all from the Landscape Edition
 * catalogue. Granite colours arrive from Sanity through the page.
 */

export default function FlooringPage({ colours }: { colours: SpaceColour[] }) {
  const f = FLOORING_PAGE;
  return (
    <>
      <Hero />
      <SpaceCrumbs label="Flooring" />
      <SpaceTabs tabs={f.tabs} label="Why Pacific granite for floors" idPrefix="flooring" />
      <Finishes />
      <SpaceDesign {...f.design} />
      <Formats />
      <SpaceGallery heading={f.gallery.heading} tags={f.gallery.tags} shots={f.gallery.shots} />
      <SpaceColours heading={f.colours.heading} cta={f.colours.cta} colours={colours} />
      <Technical />
      <Split {...f.plan} />
      <SpaceFaqs heading="Frequently asked questions about granite floors" faqs={f.faqs} />
      <SpaceOthers {...f.spaces} />
    </>
  );
}

/* The hero: three of the catalogue's photographs side by side, each shown
   no wider than the PDF holds it, under the page's one H1. */
function Hero() {
  const c = FLOORING_PAGE.hero;
  return (
    <section data-over-media className="relative isolate flex h-[78vh] min-h-[520px] items-end overflow-hidden bg-[#14140f] text-white">
      <div className="absolute inset-0 -z-10 grid grid-cols-1 gap-1 md:grid-cols-3">
        {c.images.map((im, i) => (
          <div key={im.src} className={cn("relative h-full overflow-hidden", i > 0 && "hidden md:block")}>
            <Image src={im.src} alt={im.alt} fill priority sizes="(min-width: 768px) 34vw, 100vw" className="object-cover" />
          </div>
        ))}
      </div>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />
      <Container className="pb-14 lg:pb-20">
        <h1 style={LIGHT} className="text-5xl uppercase leading-none tracking-[-0.03em] sm:text-6xl lg:text-[96px]">
          {c.title}
        </h1>
        <p className="mt-5 max-w-xl text-lg font-light leading-snug lg:text-xl">{c.lead}</p>
      </Container>
    </section>
  );
}

function Finishes() {
  return (
    <section className="bg-white py-20 lg:py-28">
      <Container>
        <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
          <Heading>Six finishes</Heading>
          <p className="text-base font-light leading-relaxed lg:col-span-2 lg:pt-2">
            Every granite in the Landscape Edition comes in Polished, Leather, Lapotura, River, Antik, and Flamed &amp;
            Waterjet. The samples are from the catalogue, on the granite named under each.
          </p>
        </div>
        <ul className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {FLOORING_PAGE.finishes.map((fin) => (
            <li key={fin.image}>
              <div className="relative aspect-[1/3] w-full overflow-hidden bg-[#EFEDE9]">
                <Image src={fin.image} alt={`${fin.name} finish on ${fin.shownOn}`} fill unoptimized sizes="(min-width: 1024px) 16vw, 50vw" className="object-cover" />
              </div>
              <p className="mt-3 text-sm">{fin.name}</p>
              <p className="text-xs font-light opacity-60">On {fin.shownOn}</p>
              <p className="mt-2 text-sm font-light leading-relaxed opacity-80">{fin.note}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

function Formats() {
  const f = FLOORING_PAGE.formats;
  return (
    <section className={cn(PANEL, "mb-20 lg:mb-28")}>
      <Container className="grid items-center gap-10 py-14 md:grid-cols-2 lg:gap-16 lg:py-20">
        <div>
          <Heading>Paver formats</Heading>
          <p className="mt-6 max-w-md text-base font-light leading-relaxed">
            Nine formats, each in 3 cm and 5 cm thicknesses. Larger floors and steps are cut to your plan.
          </p>
          <div className="relative mt-8 aspect-[925/226] w-full max-w-lg">
            <Image src="/images/flooring/paver-5cm.webp" alt="A 20 × 10 × 5 cm paver" fill unoptimized sizes="512px" className="object-contain" />
          </div>
        </div>
        <table className="w-full border-collapse text-left text-[15px]">
          <thead>
            <tr className="border-b border-[#14140f]/20 text-xs uppercase tracking-[0.12em]">
              <th className="py-3 font-normal">Format, cm</th>
              <th className="py-3 font-normal">3 cm</th>
              <th className="py-3 font-normal">5 cm</th>
            </tr>
          </thead>
          <tbody>
            {f.map((size) => (
              <tr key={size} className="border-b border-[#14140f]/10">
                <td className="py-2.5 font-light">{size}</td>
                <td className="py-2.5 font-light">Yes</td>
                <td className="py-2.5 font-light">Yes</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Container>
    </section>
  );
}

function Technical() {
  const rows = FLOORING_PAGE.technical;
  const cols: [keyof (typeof rows)[number], string][] = [
    ["density", "Apparent density, kg/m³"],
    ["porosity", "Open porosity, % vol."],
    ["flexural", "Flexural strength, MPa"],
    ["compressive", "Compressive strength, MPa"],
    ["absorption", "Water absorption, % wt."],
  ];
  return (
    <section className="bg-white pb-20 lg:pb-28">
      <Container>
        <Heading>Technical data</Heading>
        <p className="mt-4 max-w-2xl text-base font-light leading-relaxed">
          From the Landscape Edition technical sheets. Country of origin for every granite: India.
        </p>
        <div className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-[15px]">
            <thead>
              <tr className="border-b border-[#14140f]/20 text-xs uppercase tracking-[0.1em]">
                <th className="py-3 pr-6 font-normal">Granite</th>
                {cols.map(([, label]) => (
                  <th key={label} className="py-3 pr-6 font-normal">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.name} className="border-b border-[#14140f]/10">
                  <td className="py-3 pr-6">{r.name}</td>
                  {cols.map(([key]) => (
                    <td key={key} className="py-3 pr-6 font-light">
                      {r[key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </section>
  );
}
