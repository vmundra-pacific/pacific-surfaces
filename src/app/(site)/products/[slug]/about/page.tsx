import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { CATEGORY_PAGES } from "../../_lib/category";
import { PageHeader } from "@/components/ui/page-header";
import { PacificQuartz } from "@/components/sections/PacificQuartz";
import { BreadcrumbList } from "@/components/global/JsonLd";

/**
 * /products/[slug]/about — category overview / "ss2" page.
 *
 * Reached from the homepage Products mega-menu. Each card in that
 * mega-menu links here. From this page the user fans out into:
 *   - <Category> Colours    → /products/[slug]   (the existing catalogue)
 *   - What is <Category>    → /learn/what-is-<slug>   (stub)
 *   - Maintenance           → /learn/maintenance      (stub)
 *   (No Warranty card: quartz is the only line with a warranty, and
 *   /products/quartz/about is the Pacific Quartz page, not this one.
 *   The old card promised a "25-year warranty" on every category.)
 *   - Kitchen Countertops   → /learn/kitchen-countertops  (stub)
 *   - Kitchen Sinks         → /learn/kitchen-sinks    (stub)
 *
 * Same six sections render for every category right now (per editorial
 * direction "put same for all as of now, we'll change later"). When the
 * content team needs category-specific section lists, swap the SECTIONS
 * constant for a per-slug map.
 *
 * Quartz is the exception: /products/quartz/about is the Pacific Quartz
 * page (components/sections/PacificQuartz), with its own title and
 * description below.
 */

const PACIFIC_QUARTZ_METADATA: Metadata = {
  title: "Pacific Quartz | Engineered Quartz Slabs by Pacific Surfaces",
  description:
    "Pacific Quartz: engineered quartz slabs by Pacific Surfaces, made at a state-of-the-art Bretonstone plant in India. 12, 20 and 30 mm; up to 137 × 79 in (3,500 × 2,050 mm).",
  alternates: { canonical: "/products/quartz/about" },
};

interface Params {
  slug: string;
}

// Cached on first visit and rebuilt at most once a minute (2026-10-22:
// without these the route rendered afresh on every visit, ~1.3 s on a
// phone). No pages are listed up front; each is built when first asked for.
export const revalidate = 60;
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (slug === "quartz") return PACIFIC_QUARTZ_METADATA;
  const cfg = CATEGORY_PAGES[slug];
  if (!cfg) return { title: "Pacific Surfaces" };
  const display = cfg.displayName ?? slug;
  const pretty = display.charAt(0).toUpperCase() + display.slice(1);
  return {
    title: `${pretty} — Pacific Surfaces`,
    description: `Learn about Pacific Surfaces ${pretty.toLowerCase()} — colours, maintenance and applications.`,
    alternates: { canonical: `/products/${slug}/about` },
    // The same six placeholder cards for every category other than
    // quartz, most of them leading to "Coming soon" Learn pages: kept out
    // of the index (and the sitemap) until each has copy of its own.
    robots: { index: false, follow: true },
  };
}

const SECTIONS = (slug: string, label: string) => [
  {
    title: `${label} Colours`,
    blurb: `Browse every available ${label.toLowerCase()} colour and finish in our catalogue.`,
    href: `/products/${slug}`,
  },
  {
    title: `What is ${label}?`,
    blurb: `An introduction to the material, how it's made, and what makes Pacific's ${label.toLowerCase()} different.`,
    href: `/learn/what-is-${slug}`,
  },
  {
    title: "Maintenance",
    blurb:
      "Day-to-day care, what to clean with, and what to keep away from the surface.",
    href: "/learn/maintenance",
  },
  {
    title: "Kitchen Countertops",
    blurb:
      "Specifying Pacific surfaces for kitchen worktops — fabrication, edging, and install considerations.",
    href: "/learn/kitchen-countertops",
  },
  {
    title: "Kitchen Sinks",
    blurb:
      "Integra under-mount and surface-mount quartz sinks — sized to fuse with your worktop seamlessly.",
    href: "/learn/kitchen-sinks",
  },
];

export default async function CategoryAboutPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  if (slug === "quartz") return <PacificQuartz />;
  const cfg = CATEGORY_PAGES[slug];
  if (!cfg) notFound();

  const label =
    cfg.displayName ??
    slug
      .split("-")
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ");

  const sections = SECTIONS(slug, label);

  return (
    <>
      <BreadcrumbList
        items={[
          { name: "Home", url: "/" },
          { name: "Products", url: "/products" },
          { name: label, url: `/products/${slug}` },
          { name: label, url: `/products/${slug}/about` },
        ]}
      />
      <PageHeader
        badge={`Pacific Surfaces · ${label}`}
        title={label}
        description={
          cfg.hero?.description ??
          `Pacific Surfaces ${label} — engineered to anchor the spaces you live in.`
        }
      />

      <section className="py-12 md:py-16 px-6">
        <div className="mx-auto max-w-[76rem]">
          <div className="mb-10 sm:mb-14">
            <p className="text-[11px] font-medium tracking-[0.3em] uppercase text-pacific-dark/60">
              Explore {label}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {sections.map((s) => (
              <Link
                key={s.title}
                href={s.href}
                className="group relative flex flex-col justify-between rounded-2xl border border-pacific-mid/20 bg-white p-7 sm:p-8 min-h-[220px] hover:border-pacific-mid/30 hover:shadow-[0_8px_28px_rgba(0,0,0,0.06)] transition-all duration-300"
              >
                <div>
                  <h3 className="text-xl sm:text-2xl font-light tracking-tight text-pacific-dark mb-3">
                    {s.title}
                  </h3>
                  <p className="text-sm font-light text-pacific-dark/70 leading-relaxed">
                    {s.blurb}
                  </p>
                </div>
                <span className="mt-6 inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.2em] uppercase text-pacific-dark group-hover:gap-3 transition-all">
                  Read more
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
