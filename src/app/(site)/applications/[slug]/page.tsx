import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { SpaceFeatureSection } from "@/components/sections/SpaceFeatureSection";
import { BreadcrumbList, FaqSchema } from "@/components/global/JsonLd";
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
    title: app.seo?.metaTitle ?? `${app.name} — Pacific Surfaces`,
    description: app.seo?.metaDescription ?? app.description,
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

      {/* Long-form intro. Only pages carrying an seo block get one: it is
          the substance a search result needs behind it, and writing it for
          every application would be filler. */}
      {app.seo && (
        <section className="bg-white px-6 pb-4 pt-12 md:pt-14">
          <div className="mx-auto max-w-3xl space-y-5">
            {app.seo.intro.map((para) => (
              <p
                key={para.slice(0, 32)}
                className="text-base font-light leading-relaxed text-pacific-dark/75"
              >
                {para}
              </p>
            ))}
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-pacific-dark px-6 py-3 text-sm font-light text-white transition-opacity hover:opacity-80"
              >
                Shop {app.name.toLowerCase()}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/samples"
                className="inline-flex items-center gap-2 rounded-full border border-pacific-dark/20 px-6 py-3 text-sm font-light text-pacific-dark transition-colors hover:border-pacific-dark"
              >
                Order a sample
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>
      )}

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

      {/* Specifications. The single most common reason someone lands on a
          page like this is to find a size, so the table sits above the
          collection links rather than below them. */}
      {app.seo && (
        <section className="bg-white px-6 py-14 md:py-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-[11px] font-medium uppercase tracking-[0.25em] text-pacific-dark/50">
              {app.name} specifications
            </h2>
            <dl className="mt-6 divide-y divide-pacific-dark/10 border-y border-pacific-dark/10">
              {app.seo.specs.map((row) => (
                <div
                  key={row.label}
                  className="flex flex-col gap-1 py-4 sm:flex-row sm:gap-8"
                >
                  <dt className="w-full text-sm font-light text-pacific-dark/55 sm:w-56 sm:shrink-0">
                    {row.label}
                  </dt>
                  <dd className="text-sm font-light text-pacific-dark">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      {/* FAQ. The questions are on the page as well as in the structured
          data — markup without visible answers is treated as a mismatch and
          earns nothing. */}
      {app.seo && (
        <>
          <FaqSchema faqs={app.seo.faqs} />
          <section className="bg-pacific-light px-6 py-16 md:py-20">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-3xl font-light text-pacific-dark md:text-4xl">
                Frequently asked
              </h2>
              <div className="mt-8 divide-y divide-pacific-dark/10 border-t border-pacific-dark/10">
                {app.seo.faqs.map((f) => (
                  <details key={f.question} className="group py-5">
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-lg font-light text-pacific-dark">
                      <h3 className="text-lg font-light">{f.question}</h3>
                      <span className="mt-1 shrink-0 text-pacific-dark/40 transition-transform group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="mt-3 max-w-2xl text-sm font-light leading-relaxed text-pacific-dark/70">
                      {f.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* Specify from — the collections cleared for this application,
          and only those. Engineered surfaces are absent from anything
          outdoors or underfoot; see lib/application-rules. */}
      <section className="bg-white px-6 py-14 md:py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.25em] text-pacific-dark/50">
            Specify {app.name.toLowerCase()} from
          </h2>
          <ul className="mt-5 flex flex-wrap gap-3">
            {app.collections.map((c) => (
              <li key={c.href}>
                <Link
                  href={c.href}
                  className="inline-flex items-center gap-2 rounded-full border border-pacific-dark/15 px-5 py-2.5 text-sm font-light text-pacific-dark transition-colors hover:border-pacific-dark hover:bg-pacific-dark hover:text-white"
                >
                  {c.name}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

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
