"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import {
  Container,
  DarkButton,
  Heading,
  PANEL,
  SpaceCrumbs,
  SpaceFaqs,
  SpaceGallery,
  SpaceHero,
  SpaceOthers,
  SpaceTabs,
  Split,
  type SpaceShot,
} from "@/components/sections/spaces/SpaceBlocks";
import { SillProfileDrawing } from "@/components/sections/SillProfileDrawing";
import { TechSpecsButtons } from "@/components/sections/sills/TechSpecsDialog";
import {
  CARE,
  CERTIFICATES,
  CRATE_DRAWING,
  FINISHES,
  MATERIALS,
  MOQ,
  PACKING,
  PROFILES,
  PROFILE_GROUPS,
  SILLS_PAGE,
  SILL_PHOTOS,
  SILL_SIZES,
  THRESHOLD_SIZES,
  VARIATION,
  sizeGrid,
  type CrateRow,
  type SillProfile,
} from "@/data/thresholds-and-sills";
import { cn } from "@/lib/utils";

/**
 * /products/pacific-european-window-sill-threshold-collection, laid out
 * like "Kitchens by Pacific Surfaces" (owner, 2026-10-05) with the shared
 * blocks in SpaceBlocks: hero, reasons in tabs, the six profile drawings,
 * the sizes at a glance, colours and finishes, then the technical
 * specifications behind a button and a PDF (the full crate tables were too
 * much for the page, owner), planning, the gallery, care, FAQ and the
 * other spaces. Every figure is from the supplier's crate
 * sheet and brief (data/thresholds-and-sills).
 */

const GALLERY: SpaceShot[] = SILL_PHOTOS.map((p) => ({
  src: p.src,
  alt: p.alt,
  tags: ["All", p.kind === "fitted" ? "Fitted" : "Finished pieces"],
}));

export default function SillsPage() {
  const s = SILLS_PAGE;
  return (
    <>
      <SpaceHero {...s.hero} titleClassName="lg:text-[80px]" />
      <SpaceCrumbs label="Window Sills & Thresholds" parent={{ label: "Products", href: "/products" }} />
      <SpaceTabs tabs={s.tabs} label="Why Pacific granite sills and thresholds" idPrefix="sills" />
      <Profiles />
      <SizesAtAGlance />
      <ColoursAndFinishes />
      <Specifications />
      <Split {...s.plan} />
      <SpaceGallery heading={s.gallery.heading} tags={s.gallery.tags} shots={GALLERY} />
      <CareNotes />
      <SpaceFaqs heading="Frequently asked questions about sills and thresholds" faqs={s.faqs} />
      <SpaceOthers {...s.spaces} />
    </>
  );
}

/* The six sections as drawn, window sills first. */
function Profiles() {
  return (
    <section id="profiles" className="scroll-mt-28 bg-white py-20 lg:py-28">
      <Container>
        <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
          <Heading>Six profiles</Heading>
          <p className="text-base font-light leading-relaxed lg:col-span-2 lg:pt-2">
            The sections as the supplier draws them, not to a common scale. Every piece is finished, cut to size and
            edge-bevelled.
          </p>
        </div>
        {PROFILE_GROUPS.map((g) => (
          <div key={g.id} className="mt-14">
            <div className="flex flex-col gap-1 border-b border-[#14140f]/15 pb-3 sm:flex-row sm:items-baseline sm:justify-between">
              <h3 className="text-sm uppercase tracking-[0.12em]">{g.title}</h3>
              <p className="text-sm font-light opacity-70">{g.lead}</p>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {PROFILES.filter((p) => p.group === g.id).map((p) => (
                <ProfileCard key={p.slug} profile={p} />
              ))}
            </div>
          </div>
        ))}
      </Container>
    </section>
  );
}

function ProfileCard({ profile }: { profile: SillProfile }) {
  return (
    // A div, not an article: the site skin gives `main article:has(img)`
    // the catalogue's card shadow.
    <div id={profile.slug} className={cn(PANEL, "flex scroll-mt-28 flex-col p-5 lg:p-6")}>
      <div className="flex aspect-[3/2] items-center bg-white px-3">
        <SillProfileDrawing profile={profile} className="h-auto max-h-full w-full" />
      </div>
      <h4 className="mt-5 text-lg font-light">{profile.name}</h4>
      <p className="mt-2 flex-1 text-sm font-light leading-relaxed opacity-75">{profile.description}</p>
      <a href="#sizes" className="mt-4 inline-flex w-fit items-center gap-1.5 border-b border-[#14140f] pb-0.5 text-xs font-light">
        {profile.sizes === "sills" ? "Window sill sizes" : "Threshold and door sill sizes"}
        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </a>
    </div>
  );
}

/* Length by width, the thickness in each cell: the short sizes table the
   brief asked for. The crate figures are in the specifications. */
function SizesAtAGlance() {
  return (
    <section id="sizes" className={cn(PANEL, "scroll-mt-28 py-16 lg:py-24")}>
      <Container>
        <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
          <Heading>Standard sizes</Heading>
          <p className="text-base font-light leading-relaxed lg:col-span-2 lg:pt-2">
            Length down the side and width across the top, in centimetres; each cell gives the thickness in centimetres.
            Other lengths are cut to size.
          </p>
        </div>
        <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:gap-16">
          <SizeGrid title="Window sills" rows={SILL_SIZES} />
          <SizeGrid title="Thresholds and door sills" rows={THRESHOLD_SIZES} />
        </div>
      </Container>
    </section>
  );
}

function SizeGrid({ title, rows }: { title: string; rows: CrateRow[] }) {
  const { lengths, widths, has } = sizeGrid(rows);
  return (
    <div>
      <h3 className="text-sm uppercase tracking-[0.12em]">{title}</h3>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-max border-collapse text-center text-sm tabular-nums">
          <caption className="sr-only">{title}: lengths by widths in centimetres, thickness in each cell</caption>
          <thead>
            <tr className="border-b border-[#14140f]/25">
              <th scope="col" className="py-2 pr-3 text-left text-[10px] font-normal uppercase tracking-[0.15em] opacity-60">
                L \ W
              </th>
              {widths.map((w) => (
                <th key={w} scope="col" className="px-2 py-2 font-light opacity-70">
                  {w}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lengths.map((l) => (
              <tr key={l} className="border-b border-[#14140f]/10">
                <th scope="row" className="py-2.5 pr-3 text-left font-light">
                  {l}
                </th>
                {widths.map((w) => {
                  const r = has(l, w);
                  return (
                    <td key={w} className="px-2 py-2.5">
                      {r ? (
                        <span className="inline-flex h-7 min-w-7 items-center justify-center bg-white px-1.5 font-light">{r.thickness}</span>
                      ) : (
                        <span className="opacity-25">·</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* Granite or quartz in any colour (no colour list, owner), and the
   finishes, beside the owner's photograph of both. */
function ColoursAndFinishes() {
  const ph = SILLS_PAGE.materials;
  return (
    <section id="colours" className="scroll-mt-28 bg-white py-20 lg:py-28">
      <Container>
        <div className="grid md:grid-cols-2">
          <div className={cn(PANEL, "flex flex-col gap-10 p-8 lg:p-12")}>
            <Heading className="lg:text-[36px]">Materials and finishes</Heading>
            <div>
              <p className="text-[11px] uppercase tracking-[0.15em] opacity-60">Materials</p>
              <ul className="mt-3 border-t border-[#14140f]/15">
                {MATERIALS.map((m) => (
                  <li key={m.name} className="grid gap-1 border-b border-[#14140f]/15 py-3.5 sm:grid-cols-[7rem_1fr_auto] sm:items-baseline sm:gap-6">
                    <span className="text-lg font-light">{m.name}</span>
                    <span className="text-sm font-light leading-relaxed opacity-75">{m.note}</span>
                    <a href={m.href} className="inline-flex w-fit items-center gap-1 border-b border-[#14140f] pb-0.5 text-xs font-light">
                      Colours
                      <ArrowRight className="h-3 w-3" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-8 text-[11px] uppercase tracking-[0.15em] opacity-60">Finishes</p>
              <ul className="mt-3 border-t border-[#14140f]/15">
                {FINISHES.map((f) => (
                  <li key={f.name} className="grid gap-1 border-b border-[#14140f]/15 py-3.5 sm:grid-cols-[7rem_1fr] sm:gap-6">
                    <span className="text-lg font-light">{f.name}</span>
                    <span className="text-sm font-light leading-relaxed opacity-75 sm:pt-1">{f.note}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 max-w-md text-sm font-light leading-relaxed opacity-75">
                Approve a physical sample of the colour and finish before ordering.
              </p>
              <div className="mt-6">
                <DarkButton href="/contact#enquiry">Ask for a sample</DarkButton>
              </div>
            </div>
          </div>
          <figure className="relative aspect-[4/3] w-full overflow-hidden md:aspect-auto md:min-h-[480px]">
            <Image src={ph.src} alt={ph.alt} fill unoptimized sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
            <figcaption data-on-light className="absolute bottom-4 left-4 bg-white px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-[#14140f]">
              Granite and quartz
            </figcaption>
          </figure>
        </div>
      </Container>
    </section>
  );
}

/* Packing and the way to the full specifications: a dialog and a PDF,
   rather than the crate tables on the page. */
function Specifications() {
  return (
    <section id="specifications" className="scroll-mt-28 bg-white pb-20 lg:pb-28">
      <Container>
        <div className="grid md:grid-cols-2">
          <div className="relative aspect-[3/2] w-full overflow-hidden border border-[#14140f]/10 bg-white md:aspect-auto md:min-h-[440px]">
            <Image
              src={CRATE_DRAWING.src}
              alt="Drawing of the wooden export crate: isometric, front, side and top views, with the corner, brace, skid and slat details"
              fill
              unoptimized
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-contain p-4"
            />
          </div>
          <div className={cn(PANEL, "flex flex-col justify-between gap-10 p-8 lg:p-12")}>
            <Heading className="lg:text-[36px]">Technical specifications</Heading>
            <div>
              <p className="max-w-md text-base font-light leading-relaxed">
                Every size with its thickness, the pieces in a crate and the crate&apos;s approximate weight and area, with
                packing, MOQ and HS codes.
              </p>
              <dl className="mt-6 border-t border-[#14140f]/15">
                <Fact label="Packing">{PACKING}</Fact>
                <Fact label="Minimum order">{MOQ}</Fact>
              </dl>
              <div className="mt-8">
                <TechSpecsButtons />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-[#14140f]/15 py-3.5 sm:grid-cols-[8.5rem_1fr] sm:gap-6">
      <dt className="text-[11px] uppercase tracking-[0.15em] opacity-60 sm:pt-0.5">{label}</dt>
      <dd className="text-sm font-light leading-relaxed">{children}</dd>
    </div>
  );
}

/* Care, the variation note and the certificates on file. */
function CareNotes() {
  const blocks = [
    { title: "Care and installation", body: CARE },
    { title: "Natural variation", body: VARIATION },
    {
      title: "Certificates",
      body: `Pacific's certificates on file: ${CERTIFICATES.join(", ")}. Ask which apply to your order and we will send copies.`,
    },
  ];
  return (
    <section id="care" className="scroll-mt-28 bg-white pb-20 lg:pb-28">
      <Container>
        <div className="grid gap-10 border-t border-[#14140f]/15 pt-12 md:grid-cols-3 lg:gap-16">
          {blocks.map((b) => (
            <div key={b.title}>
              <h2 className="text-sm uppercase tracking-[0.12em]">{b.title}</h2>
              <p className="mt-4 text-sm font-light leading-relaxed opacity-80">{b.body}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
