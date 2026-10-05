import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { groq } from "next-sanity";
import { client } from "@/sanity/lib/client";
import { sanityImg } from "@/lib/sanity-img";
import { PageHeader } from "@/components/ui/page-header";
import { BreadcrumbList } from "@/components/global/JsonLd";
import {
  CUT_PIECES,
  SILL_PHOTOS,
  inches,
  materialsFor,
  mm,
  storeSlug,
  type CutPiece,
  type SillPhoto,
} from "@/data/thresholds-and-sills";
import { CutPieceDrawing } from "@/components/sections/CutPieceDrawing";

/**
 * /products/pacific-european-window-sill-threshold-collection — thresholds, interior window
 * sills, shower jambs and the small bath pieces cut with them, from the
 * same quartz slabs as the worktops, and window sills in granite too.
 * Laid out after the owner's reference (Bauce Bruno's thresholds page):
 * each piece as a line drawing (plan and section) with its edge profile
 * and standard sizes, then photographs of finished sills, then the designs
 * a piece can be cut from, each linking to its own product page. Every
 * piece can be ordered in the store (/shop/<material>-<piece>).
 */

const PATH = "/products/pacific-european-window-sill-threshold-collection";
/** The collection's name, as the owner gave it (2026-10-05). */
const COLLECTION = "Pacific European Window Sill & Threshold Collection";
const TITLE = `${COLLECTION}: Quartz & Granite`;
const DESCRIPTION =
  "Window sills in quartz and granite, and quartz thresholds, shower jambs, corner shelves, corner seats and shower benches, cut from Pacific slabs. Standard sizes and edge profiles.";

export const metadata: Metadata = {
  title: `${TITLE} | Pacific Surfaces`,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: {
    title: `${TITLE} | Pacific Surfaces`,
    description: DESCRIPTION,
    url: PATH,
  },
};

// Designs come from Sanity: refresh the list at most hourly.
export const revalidate = 3600;

/** The quartz series a piece can be cut from (Sanity collection slugs). */
const QUARTZ_SERIES = ["chromia", "nebula", "kosmic", "aurora", "celestia", "luminara"];

type Design = { name: string; slug: string; image: string; series: string };

const designsQuery = groq`*[_type == "product" && visible != false && defined(mainImage.asset)
  && collection->slug.current in $series]{
    name, "slug": slug.current, "image": mainImage.asset->url, "series": collection->slug.current
  } | order(name asc)`;

const granitesQuery = groq`*[_type == "product" && visible != false && defined(mainImage.asset)
  && productType == "granite-slab"]{
    name, "slug": slug.current, "image": mainImage.asset->url, "series": "granite"
  } | order(name asc)`;

/** Twelve designs: the ones the drawings name first, then one from each
 *  series in turn, so the grid shows the range rather than one collection. */
function pickDesigns(all: Design[], count = 12): Design[] {
  const shown = new Set(CUT_PIECES.map((p) => p.shownIn.href.split("/").pop()));
  const first = all.filter((d) => shown.has(d.slug));
  const rest = all.filter((d) => !shown.has(d.slug));
  const bySeries = QUARTZ_SERIES.map((s) => rest.filter((d) => d.series === s));
  const out = [...first];
  for (let i = 0; out.length < count && bySeries.some((g) => g.length > i); i++) {
    for (const g of bySeries) if (g[i] && out.length < count) out.push(g[i]);
  }
  return out;
}

/** `count` designs spread evenly through an alphabetical list. */
function spread(all: Design[], count: number): Design[] {
  if (all.length <= count) return all;
  return Array.from({ length: count }, (_, i) => all[Math.floor((i * all.length) / count)]);
}

/** "Name (P28)" -> "Name": the code is on the product page. */
const designName = (name: string) => name.replace(/\s*\([^)]*\)\s*$/, "");

export default async function ThresholdsAndSillsPage() {
  const [quartz, granite] = await Promise.all([
    client.fetch<Design[]>(designsQuery, { series: QUARTZ_SERIES }).catch(() => []),
    client.fetch<Design[]>(granitesQuery).catch(() => []),
  ]);
  const quartzDesigns = pickDesigns(quartz);
  const graniteDesigns = spread(granite, 6);

  return (
    <>
      <BreadcrumbList
        items={[
          { name: "Home", url: "/" },
          { name: "Products", url: "/products" },
          { name: COLLECTION, url: PATH },
        ]}
      />

      <PageHeader
        badge="Window sills, thresholds and shower jambs"
        title={COLLECTION}
        description="Cut from the same quartz slabs as our worktops, in any design in the range, so a threshold, a sill or a shower jamb matches the stone around it. Window sills come in granite too."
      />

      <section className="bg-white px-6 pb-6 pt-12 lg:px-8 lg:pt-16">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <p className="max-w-3xl text-base font-light leading-relaxed text-pacific-dark/75 lg:text-lg">
            Each piece is cut, shaped and finished from Pacific slabs in our own fabrication unit, its
            exposed edges polished or honed to the profile shown. The sizes below are standard and can be
            ordered in the store; other lengths and widths are cut to order through Fab Creations, our
            cut-to-size service.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-full bg-pacific-dark px-6 py-3 text-sm font-light text-white transition-opacity hover:opacity-80"
            >
              Order in the store
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/contact#enquiry"
              className="inline-flex items-center gap-2 rounded-full border border-pacific-dark/20 px-6 py-3 text-sm font-light text-pacific-dark transition-colors hover:border-pacific-dark"
            >
              Ask for a quote
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="pieces-heading" className="bg-white px-6 pb-20 pt-10 lg:px-8 lg:pb-28">
        <div className="mx-auto max-w-7xl">
          <h2 id="pieces-heading" className="sr-only">
            Pieces and standard sizes
          </h2>
          <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {CUT_PIECES.map((piece) => (
              <PieceCard key={piece.slug} piece={piece} />
            ))}
          </div>
          <p className="mt-12 text-sm font-light text-pacific-dark/60">
            Sizes in inches, with millimetres alongside. Length × width × thickness; the corner pieces
            give the length of their two sides.
          </p>
        </div>
      </section>

      <section aria-labelledby="photos-heading" className="bg-white px-6 pb-20 lg:px-8 lg:pb-28">
        <div className="mx-auto max-w-7xl border-t border-pacific-dark/10 pt-16">
          <h2 id="photos-heading" className="text-3xl font-light tracking-tight text-pacific-dark lg:text-4xl">
            Window sills in quartz and granite
          </h2>
          <p className="mt-3 max-w-2xl text-base font-light leading-relaxed text-pacific-dark/70">
            Fitted in homes, and cut and finished before they leave the unit.
          </p>
          <PhotoGrid label="Fitted" photos={SILL_PHOTOS.filter((p) => p.kind === "fitted")} />
          <PhotoGrid label="Cut and finished" photos={SILL_PHOTOS.filter((p) => p.kind === "cut")} />
        </div>
      </section>

      {quartzDesigns.length > 0 && (
        <section aria-labelledby="designs-heading" className="bg-[#F4F3F0] px-6 py-20 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <DesignRow
              id="designs-heading"
              title="Cut from any Pacific quartz design"
              lead="A few from the range. Every piece above can be cut from any of them: open a design to see the full slab."
              all={{ label: "All quartz designs", href: "/products/quartz" }}
              designs={quartzDesigns}
              material="quartz"
            />
            {graniteDesigns.length > 0 && (
              <div className="mt-16">
                <DesignRow
                  title="Window sills in Pacific granite"
                  lead="Sills are cut from our granites too."
                  all={{ label: "All granite designs", href: "/products/granites" }}
                  designs={graniteDesigns}
                  material="granite"
                />
              </div>
            )}
          </div>
        </section>
      )}

      <section className="bg-white px-6 py-20 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 border-t border-pacific-dark/10 pt-12 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-light tracking-tight text-pacific-dark lg:text-3xl">
              Tell us the pieces, the sizes and the design
            </h2>
            <p className="mt-2 text-base font-light text-pacific-dark/70">
              Our team replies with a quote, and cuts to size where the standard lengths don&apos;t fit.
            </p>
          </div>
          <Link
            href="/contact#enquiry"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-pacific-dark px-6 py-3 text-sm font-light text-white transition-opacity hover:opacity-80"
          >
            Ask for a quote
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </>
  );
}

function DesignRow({
  id,
  title,
  lead,
  all,
  designs,
  material,
}: {
  id?: string;
  title: string;
  lead: string;
  all: { label: string; href: string };
  designs: Design[];
  material: string;
}) {
  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id={id} className="text-3xl font-light tracking-tight text-pacific-dark lg:text-4xl">
            {title}
          </h2>
          <p className="mt-3 max-w-2xl text-base font-light leading-relaxed text-pacific-dark/70">{lead}</p>
        </div>
        <Link
          href={all.href}
          className="inline-flex shrink-0 items-center gap-2 text-sm font-medium uppercase tracking-[0.15em] text-pacific-dark"
        >
          {all.label}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {designs.map((d) => (
          <li key={d.slug}>
            <Link href={`/products/${d.slug}`} className="group block">
              <div className="relative aspect-square overflow-hidden bg-[#e7e5e1]">
                <Image
                  src={sanityImg(d.image, { w: 600 }) ?? d.image}
                  alt={`${designName(d.name)} ${material}`}
                  fill
                  sizes="(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <span className="mt-2 block text-sm font-light text-pacific-dark">{designName(d.name)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

/**
 * Photographs in a dense grid: landscape shots take one cell, portrait
 * ones two rows, so nothing is cropped to a strip. Each sits one wrapper
 * deep with its caption on a white plate (`data-on-light`), so the skin's
 * text-on-photo inversion leaves the caption dark.
 */
function PhotoGrid({ label, photos }: { label: string; photos: SillPhoto[] }) {
  if (photos.length === 0) return null;
  return (
    <div className="mt-10">
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-pacific-dark/55">{label}</p>
      <ul className="mt-4 grid grid-flow-row-dense grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
        {photos.map((p) => {
          const portrait = p.height > p.width * 1.1;
          return (
            <li key={p.src} className={portrait ? "row-span-2" : ""}>
              <div className={`relative h-full overflow-hidden bg-[#e7e5e1] ${portrait ? "min-h-full" : "aspect-[4/3]"}`}>
                <div className="absolute inset-0">
                  <Image
                    src={p.src}
                    alt={p.alt}
                    fill
                    unoptimized
                    sizes="(min-width: 1024px) 33vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <span
                  data-on-light
                  className="absolute bottom-3 left-3 bg-white px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] text-[#14140f]"
                >
                  {p.material}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SizeRow({ label, values }: { label: string; values: string[] }) {
  return (
    <div className="flex gap-4 py-2.5">
      <dt className="w-24 shrink-0 text-sm font-light text-pacific-dark/60">{label}</dt>
      <dd className="text-sm font-light text-pacific-dark">{values.join(" · ")}</dd>
    </div>
  );
}

function PieceCard({ piece }: { piece: CutPiece }) {
  const fmt = (v: number) => `${inches(v)} (${mm(v)})`;
  const width = piece.widthRange
    ? [`${inches(piece.widthRange[0])} to ${inches(piece.widthRange[1])} (${mm(piece.widthRange[0])} to ${mm(piece.widthRange[1])})`]
    : piece.width?.map(fmt);
  const materials = materialsFor(piece);
  return (
    // A div, not an article: the site skin gives `main article:has(img)`
    // the catalogue's card shadow.
    <div id={piece.slug} className="scroll-mt-28">
      <div className="aspect-[4/3] border border-pacific-dark/15 bg-white p-2">
        <CutPieceDrawing piece={piece} />
      </div>
      <h3 className="mt-5 text-xl font-light tracking-tight text-pacific-dark">{piece.name}</h3>
      <p className="mt-2 text-sm font-light leading-relaxed text-pacific-dark/70">{piece.profile}</p>
      <dl className="mt-4 divide-y divide-pacific-dark/10 border-y border-pacific-dark/10">
        <SizeRow label={piece.width || piece.widthRange ? "Length" : "Sides"} values={piece.length.map(fmt)} />
        {width && <SizeRow label="Width" values={width} />}
        <SizeRow label="Thickness" values={piece.thickness.map(fmt)} />
      </dl>
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
        {materials.map((m) => (
          <Link
            key={m}
            href={`/shop/${storeSlug(piece, m)}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-pacific-dark underline-offset-4 hover:underline"
          >
            {materials.length > 1 ? `Order in ${m.toLowerCase()}` : "Order in the store"}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ))}
      </div>
      <p className="mt-3 text-xs font-light text-pacific-dark/55">
        Shown in{" "}
        <Link href={piece.shownIn.href} className="underline decoration-1 underline-offset-2 hover:text-pacific-dark">
          {piece.shownIn.name}
        </Link>
      </p>
    </div>
  );
}
