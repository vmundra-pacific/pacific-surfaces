"use client";

import Image from "next/image";
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
} from "@/components/sections/sills/SillsBlocks";
import { ProductLineUp } from "@/components/sections/sills/ProductLineUp";
import { SillCatalogue } from "@/components/sections/sills/SillCatalogue";
import { SizeChartButton } from "@/components/sections/sills/SizeChart";
import { TechSpecsButtons } from "@/components/sections/sills/TechSpecsDialog";
import {
  BARCODES,
  CARE,
  CERTIFICATES,
  CONTROL_PHOTOS,
  CRATE_DRAWING,
  FINISHES,
  HS_CODES,
  MATERIALS,
  MONTHLY_CAPACITY,
  MOQ,
  PACKING,
  PRIVATE_LABEL,
  QC_STEPS,
  SILLS_PAGE,
  SILL_COLOURS,
  SILL_PHOTOS,
  SILL_PRODUCTS,
  VARIATION,
  type SizeRow,
} from "@/data/thresholds-and-sills";
import { cn } from "@/lib/utils";

/**
 * /products/pacific-european-window-sill-threshold-collection, laid out
 * like "Kitchens by Pacific Surfaces" (owner, 2026-10-05) and kept in that
 * published layout (owner, 2026-10-06) with its own copy of the blocks in
 * sills/SillsBlocks: hero, reasons in tabs, the products of the team's
 * list (2026-10-06) as a line-up of 3D drawings, the popular sizes
 * (their chart behind a button), the collection piece by piece, colours
 * and finishes, then the technical
 * specifications behind a button and a PDF (the full crate tables were too
 * much for the page, owner), planning, the gallery, care, FAQ and the
 * other spaces. Every figure is from the supplier's crate sheet and brief
 * (data/thresholds-and-sills).
 */

const GALLERY: SpaceShot[] = SILL_PHOTOS.map((p) => ({ src: p.src, alt: p.alt, tags: ["All"] }));

export default function SillsPage() {
  const s = SILLS_PAGE;
  return (
    <>
      <SpaceHero {...s.hero} titleClassName="lg:text-[80px]" />
      <SpaceCrumbs label="Window Sills & Thresholds" parent={{ label: "Products", href: "/products" }} />
      <SpaceTabs tabs={s.tabs} label="Why Pacific granite sills and thresholds" idPrefix="sills" />
      <Products />
      <SizesAtAGlance />
      <Browse />
      <ColoursAndFinishes />
      <Specifications />
      <QuarryToCrate />
      <Split {...s.plan} />
      <SpaceGallery heading={s.gallery.heading} tags={s.gallery.tags} shots={GALLERY} />
      <CareNotes />
      <SpaceFaqs heading="Frequently asked questions about sills and thresholds" faqs={s.faqs} />
      <SpaceOthers {...s.spaces} />
    </>
  );
}

/* The products of the team's list (2026-10-06) as a line-up of small
   cards, each drawn in 3D and opening the piece in full (owner: "this is
   nice, use this layout"; drawings, not photographs, so a layman can read
   them). */
function Products() {
  return (
    <section id="products" className="scroll-mt-28 bg-white py-20 lg:py-28">
      <Container>
        <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
          <Heading>Products</Heading>
          <p className="text-base font-light leading-relaxed lg:col-span-2 lg:pt-2">
            For the window and the door line, finished and edge-bevelled, in popular sizes or custom sizes cut to your
            drawings. Open one to see it in 3D, its section and its sizes.
          </p>
        </div>
        <div className="mt-12">
          <ProductLineUp />
        </div>
      </Container>
    </section>
  );
}

/* The popular sizes in a line per product, the chart itself behind "View
   size chart" (owner, 2026-10-06: not shown on the page; in the chart, the
   units in the headings and length and width plain, the boss's note). */
const span = (v: number[]) => {
  const lo = Math.min(...v);
  const hi = Math.max(...v);
  return lo === hi ? `${lo}` : `${lo}–${hi}`;
};

function SizesAtAGlance() {
  return (
    <section id="sizes" className={cn(PANEL, "scroll-mt-28 py-16 lg:py-24")}>
      <Container>
        <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
          <Heading>Popular sizes</Heading>
          <div className="lg:col-span-2 lg:pt-2">
            <p className="text-base font-light leading-relaxed">
              Each product in the sizes it is made in, crated for export, and in custom sizes cut to your drawings. Open a
              product above for its own size table; the size chart lists the crate sizes of sills and thresholds.
            </p>
            <dl className="mt-6 border-t border-[#14140f]/15">
              {SILL_PRODUCTS.map((p) => (
                <SizeRange key={p.slug} title={p.name} rows={p.sizes} />
              ))}
            </dl>
            <div className="mt-8">
              <SizeChartButton />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function SizeRange({ title, rows }: { title: string; rows?: SizeRow[] }) {
  const front = rows?.find((r) => r.front)?.front;
  return (
    <div className="grid gap-1 border-b border-[#14140f]/15 py-3.5 sm:grid-cols-[13rem_1fr] sm:items-baseline sm:gap-6">
      <dt className="text-sm uppercase tracking-[0.12em]">{title}</dt>
      <dd className="text-sm font-light">
        {rows ? (
          <>
            Length {span(rows.map((r) => r.length))} cm · Width {span(rows.map((r) => r.width))} cm ·{" "}
            {front
              ? `Height ${span(rows.map((r) => r.thickness))} cm at the back, ${front} cm at the front`
              : `Thickness ${span(rows.map((r) => r.thickness))} cm`}
          </>
        ) : (
          <span className="opacity-70">Made to order, cut to your drawings</span>
        )}
      </dd>
    </div>
  );
}

/* Every piece, laid out like the dealer catalogue the owner liked
   (kerasom.nl): filters down the side, the pieces as rows, in
   sills/SillCatalogue. */
function Browse() {
  return (
    <section id="browse" className="scroll-mt-28 bg-white py-20 lg:py-28">
      <Container>
        <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
          <Heading>Browse the collection</Heading>
          <p className="text-base font-light leading-relaxed lg:col-span-2 lg:pt-2">
            Every product in its sizes and every colour, the profiled thresholds and the door sill included. Use the
            filters to narrow the list, and open a piece for its figures. Custom sizes are cut to your drawings.
          </p>
        </div>
        <SillCatalogue />
      </Container>
    </section>
  );
}

/* The two materials, their colours and finishes: the palette of the
   European Program catalogue (owner, 2026-10-06; Viscon White and the
   suede finish added 2026-10-10: four granites and four quartz), its swatches beside the list. */
function ColoursAndFinishes() {
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
                  <li key={m.name} className="grid gap-1 border-b border-[#14140f]/15 py-3.5 sm:grid-cols-[7rem_1fr] sm:items-baseline sm:gap-6">
                    <span className="text-lg font-light">{m.name}</span>
                    <span className="text-sm font-light leading-relaxed opacity-75">{m.note}</span>
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
          <div className="flex flex-col gap-10 border border-[#14140f]/10 p-8 lg:p-12">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-[11px] uppercase tracking-[0.15em]">Colour palette</p>
              <p className="text-xs font-light opacity-60">Indicative colours</p>
            </div>
            {SILL_COLOURS.map((g) => (
              <div key={g.material}>
                <p className="text-sm">
                  {g.material}
                  <span className="ml-2 font-light opacity-60">{g.finishes.join(" · ")}</span>
                </p>
                <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-4">
                  {g.colours.map((c) => (
                    <li key={c.name}>
                      <div className="relative aspect-[4/3] w-full overflow-hidden border border-[#14140f]/10">
                        <Image
                          src={c.image}
                          alt={`${c.name} ${g.material.toLowerCase()}`}
                          fill
                          unoptimized
                          sizes="(min-width: 768px) 12vw, 50vw"
                          className="object-cover"
                        />
                      </div>
                      <p className="mt-2 text-sm font-light">{c.name}</p>
                    </li>
                  ))}
                  {g.note && <li className={cn(PANEL, "p-3 text-xs font-light leading-relaxed")}>{g.note}</li>}
                </ul>
              </div>
            ))}
          </div>
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
                The test results for quartz and Warangal Black granite, every size with its thickness, the pieces in a crate
                and the crate&apos;s approximate weight and area, with packing, MOQ and HS codes.
              </p>
              <dl className="mt-6 border-t border-[#14140f]/15">
                <Fact label="Packing">{PACKING}</Fact>
                <Fact label="Minimum order">{MOQ}</Fact>
                <Fact label="Monthly capacity">{MONTHLY_CAPACITY}</Fact>
                <Fact label="Private label">{PRIVATE_LABEL}</Fact>
                <Fact label="HS codes">
                  {HS_CODES.map((h) => (
                    <span key={h.code} className="block">
                      {h.code} · {h.material}
                    </span>
                  ))}
                </Fact>
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

/* From the updated catalogue (2026-10-10, owner: "include the crate data
   and the quality steps"): the twelve quality control steps, the four
   photographs from quarry to crate, ending in the crates in the container,
   and the barcodes every crate and piece carries. */
function QuarryToCrate() {
  return (
    <section id="quality" className={cn(PANEL, "scroll-mt-28 py-20 lg:py-28")}>
      <Container>
        <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
          <Heading>Quarry to crate</Heading>
          <p className="text-base font-light leading-relaxed lg:col-span-2 lg:pt-2">
            Every piece passes twelve checks between the raw block and the container: its size, thickness, finish, edges,
            squareness and flatness, then the count, the barcode and the crate.
          </p>
        </div>

        <ol className="mt-12 grid grid-cols-2 gap-px border border-[#14140f]/15 bg-[#14140f]/15 sm:grid-cols-3 lg:grid-cols-6">
          {QC_STEPS.map((step, i) => (
            <li key={step} className="flex flex-col gap-3 bg-white p-4 lg:p-5">
              <span className="text-[11px] tabular-nums tracking-[0.15em] opacity-50">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-sm font-light leading-snug">{step}</span>
            </li>
          ))}
        </ol>

        <ul className="mt-12 grid gap-3 sm:grid-cols-2">
          {CONTROL_PHOTOS.map((p) => (
            <li key={p.src}>
              <div className="relative aspect-[2.2/1] w-full overflow-hidden bg-white">
                <Image src={p.src} alt={p.alt} fill unoptimized sizes="(min-width: 640px) 50vw, 100vw" className="object-cover" />
              </div>
              <p className="mt-2 text-[11px] uppercase tracking-[0.15em] opacity-60">{p.caption}</p>
            </li>
          ))}
        </ul>

        <div className="mt-12 grid items-center gap-8 bg-white md:grid-cols-2">
          <div className="relative aspect-[6400/3550] w-full">
            <Image
              src={BARCODES.image.src}
              alt="A labelled export crate and a labelled stone piece, each with its barcode"
              fill
              unoptimized
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-contain"
            />
          </div>
          <div className="p-8 md:pl-0 lg:p-12 lg:pl-0">
            <h3 className="text-sm uppercase tracking-[0.12em]">Barcodes for traceability</h3>
            <dl className="mt-4 border-t border-[#14140f]/15">
              <Fact label="Each crate">{BARCODES.crate.join(", ")}</Fact>
              <Fact label="Each piece">{BARCODES.piece.join(", ")}</Fact>
            </dl>
          </div>
        </div>
      </Container>
    </section>
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
