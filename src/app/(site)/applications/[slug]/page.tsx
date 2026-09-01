import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { SpaceFeatureSection } from "@/components/sections/SpaceFeatureSection";
import { BreadcrumbList } from "@/components/global/JsonLd";
import { APPLICATIONS, applicationBySlug } from "@/data/applications";

/**
 * /applications/<slug> — one page per Pacific Application.
 *
 * The Products mega lists fifteen applications; this is where each
 * one lands. Content comes from src/data/applications.ts, rendered
 * through the same PageHeader + SpaceFeatureSection pair the /spaces
 * pages use, so the two sit together visually.
 *
 * Statically generated — the content is in the repo, not Sanity, so
 * there is nothing to revalidate.
 */

export function generateStaticParams() {
  return APPLICATIONS.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const app = applicationBySlug(slug);
  if (!app) return {};
  return {
    title: `${app.name} — Pacific Surfaces`,
    description: app.description,
    alternates: { canonical: `/applications/${app.slug}` },
  };
}

export default async function ApplicationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const app = applicationBySlug(slug);
  if (!app) notFound();

  const related = app.related
    .map((s) => applicationBySlug(s))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));

  return (
    <>
      <BreadcrumbList
        items={[
          { name: "Home", url: "/" },
          { name: "Applications", url: "/applications" },
          { name: app.name, url: `/applications/${app.slug}` },
        ]}
      />

      <PageHeader
        badge={app.badge}
        title={app.title}
        description={app.description}
      />

      {app.sections.map((s, i) => (
        <SpaceFeatureSection
          key={s.eyebrow}
          eyebrow={s.eyebrow}
          headline={s.headline}
          body={s.body}
          imageLabel={s.imageLabel}
          imageUrl={s.imageUrl}
          ctaLabel={s.ctaLabel}
          ctaHref={s.ctaHref}
          imageOnLeft={i % 2 === 0}
          theme={i % 2 === 0 ? "light" : "dark"}
        />
      ))}

      {/* Where next — the room this belongs to, then the neighbouring
          applications, so the menu's fifteen entries stay connected
          rather than being fifteen dead ends. */}
      <section className="bg-pacific-light px-6 py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.25em] text-pacific-dark/50">
            Keep exploring
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href={app.space.href}
              className="group flex flex-col justify-between rounded-2xl border border-pacific-dark/10 bg-white p-6 transition-colors hover:border-pacific-dark/40"
            >
              <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-pacific-dark/45">
                The whole room
              </span>
              <span className="mt-6 inline-flex items-center gap-2 text-lg font-light text-pacific-dark">
                {app.space.name}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>

            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/applications/${r.slug}`}
                className="group flex flex-col justify-between rounded-2xl border border-pacific-dark/10 bg-white p-6 transition-colors hover:border-pacific-dark/40"
              >
                <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-pacific-dark/45">
                  Related application
                </span>
                <span className="mt-6 inline-flex items-center gap-2 text-lg font-light text-pacific-dark">
                  {r.name}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-10">
            <Link
              href="/applications"
              className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-pacific-dark hover:opacity-60"
            >
              All applications
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
