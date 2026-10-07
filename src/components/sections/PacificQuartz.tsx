import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, MapPin, Phone } from "lucide-react";
import { BreadcrumbList } from "@/components/global/JsonLd";
import { FACTORY, FACTORY_ADDRESS } from "@/data/business";

/**
 * /products/quartz/about: Pacific Quartz, as the site's one page for it
 * (SEO brief, steps 7 to 11). The brand is Pacific Surfaces and Pacific
 * Quartz the name it is also searched under; the slabs are made by the
 * registered company, Pacific Engineered Surfaces Pvt. Ltd. (owner,
 * 2026-10-07). The homepage hero links here. It replaces the generic
 * category overview for quartz only; the other categories keep that page.
 *
 * Every figure is from the site's safe list: the plant wording (a
 * state-of-the-art Bretonstone plant, fully automated manufacturing), the
 * superjumbo size, the three thicknesses, the yearly capacity, 45+
 * countries and the five certificates on file. The process is the site's
 * own account from learn/what-is-quartz. Nothing about silica here.
 *
 * Server-rendered, no motion. The skin (app/bw-temp.css) pins heading
 * weights, so they are set inline; the two black bands are divs marked
 * `data-over-media` so they stay black with white copy under either skin.
 * Links avoid `bg-[#1...` hover classes: the live skin whitens the text
 * of any link whose class contains that string.
 */

const LIGHT = { fontVariationSettings: "'wght' 250, 'wdth' 100" };
const LABEL = "text-[11px] uppercase tracking-[0.16em] opacity-60";

const SPECS = [
  { label: "Slab format, mm", value: "3,480 × 2,007", note: "Superjumbo, 137 × 79 in" },
  { label: "Thickness, mm", value: "12, 20 and 30", note: "Three thicknesses" },
  { label: "Capacity", value: "12 million sq ft", note: "Of quartz a year" },
  { label: "Reach", value: "45+ countries", note: "Shipped from India" },
];

const STEPS = [
  { title: "Mixed", body: "Quartz is blended with resin and pigment." },
  {
    title: "Vibro-compacted under vacuum",
    body: "Bretonstone® vacuum vibro-compaction presses the mix into a slab and draws out the air.",
  },
  { title: "Cured", body: "The slab is cured at high temperature." },
  { title: "Calibrated and polished", body: "Ground to an even thickness across the slab, then polished." },
];

const SERIES = [
  { name: "Eclipse", href: "/products/quartz/chromia" },
  { name: "Aurora", href: "/products/quartz/aurora" },
  { name: "Celestia", href: "/products/quartz/celestia" },
  { name: "Kosmic", href: "/products/quartz/kosmic" },
  { name: "Luminara", href: "/products/quartz/luminara" },
  { name: "Nebula", href: "/products/quartz/nebula" },
];

const CERTIFICATES = ["NSF/ANSI 51", "CE", "ISO 9001:2015", "Kosher", "EPD"];

function Container({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`mx-auto w-full max-w-[1760px] px-5 sm:px-8 lg:px-12 ${className}`}>{children}</div>;
}

export function PacificQuartz() {
  return (
    <>
      <BreadcrumbList
        items={[
          { name: "Home", url: "/" },
          { name: "Products", url: "/products" },
          { name: "Quartz", url: "/products/quartz" },
          { name: "Pacific Quartz", url: "/products/quartz/about" },
        ]}
      />

      {/* Opening: black band, the plant photograph beside the copy. A div,
          not a section: the live skin turns any dark <section> white. */}
      <div data-over-media className="bg-[#14140f] pb-14 pt-32 lg:pb-20 lg:pt-40">
        <Container className="grid items-end gap-10 lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)] lg:gap-16">
          <div>
            <p className={LABEL}>Pacific Surfaces · Quartz</p>
            <h1 style={LIGHT} className="mt-4 text-[48px] uppercase leading-none tracking-[-0.03em] sm:text-7xl lg:text-[96px]">
              Pacific Quartz
            </h1>
            <p className="mt-6 max-w-xl text-lg font-light leading-snug lg:text-xl">
              The engineered quartz slabs of Pacific Surfaces, made at a state-of-the-art Bretonstone plant with
              fully automated manufacturing.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/products/quartz"
                className="inline-flex h-[52px] items-center gap-2 bg-white px-8 text-sm uppercase tracking-[0.14em] transition-opacity hover:opacity-90"
              >
                Browse the designs
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/contact#factory"
                className="inline-flex h-[52px] items-center gap-2 border border-white px-8 text-sm uppercase tracking-[0.14em] hover:bg-white/10"
              >
                Visit the factory
              </Link>
            </div>
          </div>
          <figure>
            <div className="relative aspect-[3/2] w-full overflow-hidden">
              <Image
                src="/images/india-home/bretonstone-robot.webp"
                alt="A Breton robot over the quartz mix on the Bretonstone line"
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-3 text-[12px] font-light opacity-70">The Bretonstone line</figcaption>
          </figure>
        </Container>
      </div>

      {/* The numbers. */}
      <section className="border-b border-[#14140f]/10 bg-white">
        <Container>
          <dl className="grid gap-px py-4 sm:grid-cols-2 lg:grid-cols-4">
            {SPECS.map((s) => (
              <div key={s.label} className="px-2 py-7 lg:px-6">
                <dt className={LABEL}>{s.label}</dt>
                <dd style={LIGHT} className="mt-2 text-[30px] leading-tight tracking-[-0.02em] lg:text-[36px]">
                  {s.value}
                </dd>
                <dd className="mt-1 text-[14px] font-light opacity-70">{s.note}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* How it is made. */}
      <section className="bg-white">
        <Container className="py-14 lg:py-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 style={LIGHT} className="text-[28px] uppercase leading-tight tracking-[-0.02em] sm:text-4xl lg:text-[42px]">
              How a slab is made
            </h2>
            <Link href="/learn/what-is-quartz" className="inline-flex items-center gap-2 text-[13px] uppercase tracking-[0.12em] underline-offset-4 hover:underline">
              What is quartz?
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <ol className="mt-10 grid gap-px border border-[#14140f]/10 bg-[#14140f]/10 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <li key={step.title} className="bg-white p-6 lg:p-8">
                <span className="text-[13px] tabular-nums opacity-50">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-6 text-[15px] uppercase tracking-[0.1em]">{step.title}</h3>
                <p className="mt-3 text-[15px] font-light leading-relaxed opacity-80">{step.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* The series. */}
      <section className="bg-[#EFEDE9]">
        <Container className="py-14 lg:py-24">
          <h2 style={LIGHT} className="text-[28px] uppercase leading-tight tracking-[-0.02em] sm:text-4xl lg:text-[42px]">
            The quartz series
          </h2>
          <ul className="mt-10 grid gap-px border border-[#14140f]/10 bg-[#14140f]/10 sm:grid-cols-2 lg:grid-cols-3">
            {SERIES.map((s) => (
              <li key={s.href} className="bg-white">
                <Link href={s.href} className="flex items-center justify-between gap-4 p-6 transition-colors hover:bg-black/[0.03] lg:p-8">
                  <span style={LIGHT} className="text-[26px] uppercase tracking-[-0.01em] lg:text-[30px]">
                    {s.name}
                  </span>
                  <ArrowRight className="h-5 w-5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/products/quartz" className="mt-8 inline-flex items-center gap-2 text-[13px] uppercase tracking-[0.12em] underline-offset-4 hover:underline">
            Every quartz design
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Container>
      </section>

      {/* The plant: the same name, address and phones as everywhere else. */}
      <section className="bg-white">
        <Container className="grid gap-10 py-14 lg:grid-cols-2 lg:gap-16 lg:py-24">
          <div>
            <p className={LABEL}>Where it is made</p>
            <h2 style={LIGHT} className="mt-3 text-[28px] uppercase leading-tight tracking-[-0.02em] sm:text-4xl lg:text-[42px]">
              The plant and experience centre
            </h2>
            <p className="mt-6 max-w-xl text-[17px] font-light leading-relaxed">
              Pacific Quartz is made by {FACTORY.name}. Slabs can be seen in the experience centre at the plant.
            </p>
          </div>
          <div className="lg:pt-10">
            <address className="flex gap-3 text-[17px] font-light not-italic leading-relaxed">
              <MapPin className="mt-1 h-5 w-5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
              <span>
                <span className="block font-normal">{FACTORY.name}</span>
                {FACTORY_ADDRESS}, India
              </span>
            </address>
            <ul className="mt-5 space-y-2 text-[17px] font-light">
              {FACTORY.phones.map((phone) => (
                <li key={phone.href}>
                  <a href={phone.href} className="inline-flex items-center gap-3 underline-offset-4 hover:underline">
                    <Phone className="h-5 w-5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                    {phone.display}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/contact#factory"
                data-over-media
                className="inline-flex h-12 items-center gap-2 bg-[#1D1D1C] px-7 text-[13px] uppercase tracking-[0.12em] text-white hover:opacity-85"
              >
                Map and directions
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a
                href={FACTORY.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center gap-2 border border-[#14140f] px-7 text-[13px] uppercase tracking-[0.12em] hover:bg-black/5"
              >
                Open in Google Maps
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
            <div className="mt-10 border-t border-[#14140f]/10 pt-6">
              <p className={LABEL}>Certificates on file</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {CERTIFICATES.map((c) => (
                  <li key={c} className="border border-[#14140f]/15 px-3 py-1.5 text-[13px]">
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* Closing, a div for the same reason as the opening band. */}
      <div data-over-media className="bg-[#14140f]">
        <Container className="flex flex-wrap items-end justify-between gap-8 py-16 lg:py-24">
          <h2 style={LIGHT} className="max-w-3xl text-[32px] uppercase leading-[1.05] tracking-[-0.03em] sm:text-5xl lg:text-[60px]">
            Samples, quotes and project enquiries
          </h2>
          <Link
            href="/contact#enquiry"
            className="inline-flex h-[52px] items-center gap-2 bg-white px-8 text-sm uppercase tracking-[0.14em] transition-opacity hover:opacity-90"
          >
            Get in touch
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Container>
      </div>
    </>
  );
}
