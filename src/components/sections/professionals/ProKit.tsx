import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { safeJsonLd } from "@/lib/escape";

/**
 * The blocks the four Professionals pages are built from (owner,
 * 2026-10-08: the section looked "very cheap and bad"; upgrade the
 * content, the visuals and the layout). The language is the Pacific
 * Quartz page's: light uppercase headings, hairline grids, real
 * photographs at full width, black bands for the opening and the close.
 *
 * Written for the live skin (app/bw-temp.css): the page's wrapper <div>
 * carries `data-light-page` (not a <main>: the site layout supplies the
 * one <main>); dark plates are divs with `data-over-media` (a dark
 * <section> is painted white); heading weights are set inline; links on
 * light grounds avoid `bg-[#1…` hover classes.
 *
 * Copy on these pages uses only facts on record (memory: pacific-site-facts,
 * pacific-seo-decisions). Figures nobody has confirmed (tolerances, lead
 * times, Greenguard, rebates) stay off the page.
 */

export const LIGHT = { fontVariationSettings: "'wght' 250, 'wdth' 100" };
export const LABEL = "text-[11px] uppercase tracking-[0.16em] opacity-60";
const H2 =
  "text-[30px] uppercase leading-[1.05] tracking-[-0.02em] sm:text-4xl lg:text-[48px]";

export function Container({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`mx-auto w-full max-w-[1760px] px-5 sm:px-8 lg:px-12 ${className}`}
    >
      {children}
    </div>
  );
}

type Cta = { label: string; href: string };

/** A dark-ground button pair: the first solid white, the second outlined. */
function DarkCtas({ ctas }: { ctas: Cta[] }) {
  return (
    <div className="flex flex-wrap gap-3">
      {ctas.map((c, i) => (
        <Link
          key={c.href + c.label}
          href={c.href}
          className={
            i === 0
              ? "inline-flex h-[52px] items-center gap-2 bg-white px-8 text-sm uppercase tracking-[0.14em] text-[#14140f] transition-opacity hover:opacity-90"
              : "inline-flex h-[52px] items-center gap-2 border border-white px-8 text-sm uppercase tracking-[0.14em] text-white hover:bg-white/15"
          }
        >
          {c.label}
          {i === 0 && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
        </Link>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Opening                                                             */
/* ------------------------------------------------------------------ */

export function ProHero({
  eyebrow,
  title,
  lead,
  image,
  alt,
  video,
  ctas,
  facts = [],
}: {
  eyebrow: string;
  title: string;
  lead: string;
  /** Full-bleed photograph; also the still under `video` until it plays. */
  image: string;
  alt: string;
  /**
   * A muted loop over the photograph, from md up (phones keep the still).
   * The source carries the md media query, so phones never fetch the clip
   * (CSS hiding alone does not stop an autoplay download). No poster: the
   * <Image> beneath already paints the still, and a poster would fetch it
   * a second time at a different URL.
   */
  video?: string;
  ctas: Cta[];
  /** Up to four verified figures along the foot of the hero. */
  facts?: { value: string; label: string }[];
}) {
  return (
    <div
      data-over-media
      className="relative isolate flex min-h-[92svh] flex-col justify-end overflow-hidden bg-[#14140f]"
    >
      <Image
        src={image}
        alt={alt}
        fill
        priority
        fetchPriority="high"
        sizes="100vw"
        className="-z-20 object-cover"
      />
      {video && (
        <video
          className="absolute inset-0 -z-20 hidden h-full w-full object-cover md:block"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        >
          <source src={video} type="video/mp4" media="(min-width: 768px)" />
        </video>
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-b from-black/55 via-black/20 to-black/80"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-black/55 via-black/15 to-transparent"
      />
      <Container className="pb-10 pt-40 lg:pb-14">
        <p className={LABEL}>{eyebrow}</p>
        <h1
          style={LIGHT}
          className="mt-5 max-w-5xl text-[42px] uppercase leading-[0.98] tracking-[-0.03em] sm:text-6xl lg:text-[88px]"
        >
          {title}
        </h1>
        <p className="mt-6 max-w-2xl text-lg font-light leading-snug lg:text-xl">
          {lead}
        </p>
        <div className="mt-9">
          <DarkCtas ctas={ctas} />
        </div>
        {/* Paragraphs, not dt/dd: the live skin whitens p and div on a
            dark plate but leaves definition terms dark. */}
        {facts.length > 0 && (
          <div className="mt-14 grid grid-cols-2 border-t border-white/25 lg:grid-cols-4">
            {facts.map((f) => (
              <div
                key={f.label}
                className="border-white/25 py-5 pr-4 [&:nth-child(n+3)]:border-t lg:border-l lg:pl-6 lg:[&:first-child]:border-l-0 lg:[&:first-child]:pl-0 lg:[&:nth-child(n+3)]:border-t-0"
              >
                <p
                  style={LIGHT}
                  className="text-[20px] leading-tight tracking-[-0.01em] sm:text-[24px] lg:text-[32px]"
                >
                  {f.value}
                </p>
                <p className="mt-1 text-[13px] font-light text-white/75">
                  {f.label}
                </p>
              </div>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}

const PAGES = [
  {
    slug: "services",
    label: "Fabrication services",
    href: "/professionals/services",
  },
  {
    slug: "collaboration",
    label: "Working with us",
    href: "/professionals/collaboration",
  },
  {
    slug: "applications",
    label: "Applications",
    href: "/professionals/applications",
  },
  {
    slug: "programs",
    label: "Trade programs",
    href: "/professionals/programs",
  },
] as const;

export type ProSlug = (typeof PAGES)[number]["slug"];

/** A row of sibling pages under a hero, the current one underlined. */
export function SectionNav({
  label,
  pages,
  current,
}: {
  label: string;
  pages: readonly { slug: string; label: string; href: string }[];
  current: string;
}) {
  return (
    <nav aria-label={label} className="border-b border-[#14140f]/10 bg-white">
      <Container>
        <ul className="-mb-px flex gap-6 overflow-x-auto sm:gap-10">
          {pages.map((p) => {
            const on = p.slug === current;
            return (
              <li key={p.slug} className="shrink-0">
                <Link
                  href={p.href}
                  aria-current={on ? "page" : undefined}
                  className={`block border-b-2 py-5 text-[12px] uppercase tracking-[0.14em] ${on ? "border-[#14140f]" : "border-transparent opacity-60 hover:opacity-100"}`}
                >
                  {p.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </nav>
  );
}

/** The four Professionals pages, one after another, under each hero. */
export function ProNav({ current }: { current: ProSlug }) {
  return <SectionNav label="Professionals" pages={PAGES} current={current} />;
}

const COMPANY = [
  { slug: "about", label: "Our story", href: "/about" },
  { slug: "sustainability", label: "Sustainability", href: "/sustainability" },
  { slug: "careers", label: "Work with us", href: "/careers" },
  { slug: "blog", label: "News", href: "/blog" },
] as const;

/** Our Story and the Corporate pages, one after another. */
export function CompanyNav({
  current,
}: {
  current: (typeof COMPANY)[number]["slug"];
}) {
  return <SectionNav label="Company" pages={COMPANY} current={current} />;
}

/* ------------------------------------------------------------------ */
/* Body                                                                */
/* ------------------------------------------------------------------ */

/** The page's argument in a few paragraphs, with a column of key facts. */
export function ProIntro({
  eyebrow,
  title,
  body,
  specs = [],
}: {
  eyebrow: string;
  title: string;
  body: string[];
  specs?: { label: string; value: string }[];
}) {
  return (
    <section className="bg-white">
      <Container className="grid gap-10 py-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16 lg:py-16">
        <div>
          <p className={LABEL}>{eyebrow}</p>
          <h2 style={LIGHT} className={`mt-4 ${H2}`}>
            {title}
          </h2>
          <div className="mt-8 max-w-3xl space-y-5 text-[17px] font-light leading-relaxed lg:text-lg">
            {body.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </div>
        </div>
        {specs.length > 0 && (
          <dl className="self-end border-t border-[#14140f]/15">
            {specs.map((s) => (
              <div
                key={s.label}
                className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 border-b border-[#14140f]/15 py-4"
              >
                <dt className="text-[12px] uppercase tracking-[0.12em] opacity-60">
                  {s.label}
                </dt>
                <dd className="text-[16px] font-light">{s.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </Container>
    </section>
  );
}

export type ProCard = {
  title: string;
  body: string;
  image: string;
  alt: string;
  href?: string;
  linkLabel?: string;
};

/** Photograph cards, each with a line or two and a way on. */
export function ProCards({
  eyebrow,
  title,
  lead,
  items,
  columns = 3,
  tone = "white",
  id,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  items: ProCard[];
  columns?: 2 | 3 | 4;
  tone?: "white" | "stone";
  id?: string;
}) {
  const grid = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  }[columns];
  return (
    <section id={id} className={tone === "stone" ? "bg-[#EFEDE9]" : "bg-white"}>
      <Container className="py-12 lg:py-16">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end">
          <div>
            {eyebrow && <p className={LABEL}>{eyebrow}</p>}
            <h2 style={LIGHT} className={`mt-4 ${H2}`}>
              {title}
            </h2>
          </div>
          {lead && (
            <p className="max-w-xl text-[17px] font-light leading-relaxed">
              {lead}
            </p>
          )}
        </div>
        <ul className={`mt-12 grid gap-x-6 gap-y-12 ${grid}`}>
          {items.map((c) => {
            const body = (
              <>
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#E4E1DB]">
                  <Image
                    src={c.image}
                    alt={c.alt}
                    fill
                    sizes={`(min-width: 1024px) ${Math.round(100 / columns)}vw, (min-width: 640px) 50vw, 100vw`}
                    className="object-cover transition-transform duration-700 group-hover/card:scale-[1.03]"
                  />
                </div>
                <h3 className="mt-5 text-[15px] uppercase tracking-[0.1em]">
                  {c.title}
                </h3>
                <p className="mt-2 text-[15px] font-light leading-relaxed opacity-80">
                  {c.body}
                </p>
                {c.href && (
                  <span className="mt-4 inline-flex items-center gap-2 border-b border-[#14140f] pb-0.5 text-[12px] uppercase tracking-[0.12em]">
                    {c.linkLabel ?? "Learn more"}
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                )}
              </>
            );
            return (
              <li key={c.title}>
                {c.href ? (
                  <Link href={c.href} className="group/card block">
                    {body}
                  </Link>
                ) : (
                  <div className="group/card">{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}

/** A photograph beside a block of text; `reverse` puts the picture right. */
export function ProSplit({
  eyebrow,
  title,
  body,
  points = [],
  image,
  alt,
  reverse = false,
  cta,
  tone = "white",
}: {
  eyebrow: string;
  title: string;
  body: string[];
  points?: string[];
  image: string;
  alt: string;
  reverse?: boolean;
  cta?: Cta;
  tone?: "white" | "stone";
}) {
  return (
    <section className={tone === "stone" ? "bg-[#EFEDE9]" : "bg-white"}>
      <Container className="grid items-center gap-10 py-12 lg:grid-cols-2 lg:gap-16 lg:py-16">
        <div
          className={`relative aspect-[4/3] w-full overflow-hidden bg-[#E4E1DB] ${reverse ? "lg:order-2" : ""}`}
        >
          <Image
            src={image}
            alt={alt}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div>
          <p className={LABEL}>{eyebrow}</p>
          <h2 style={LIGHT} className={`mt-4 ${H2}`}>
            {title}
          </h2>
          <div className="mt-7 space-y-4 text-[17px] font-light leading-relaxed">
            {body.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </div>
          {points.length > 0 && (
            <ul className="mt-7 border-t border-[#14140f]/15">
              {points.map((p) => (
                <li
                  key={p}
                  className="flex gap-4 border-b border-[#14140f]/15 py-3.5 text-[15px] font-light"
                >
                  <span
                    aria-hidden="true"
                    className="mt-[9px] h-px w-4 shrink-0 bg-[#14140f]"
                  />
                  {p}
                </li>
              ))}
            </ul>
          )}
          {cta && (
            <Link
              href={cta.href}
              className="mt-9 inline-flex h-12 items-center gap-2 border border-[#14140f] px-7 text-[13px] uppercase tracking-[0.12em] hover:bg-black/5"
            >
              {cta.label}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          )}
        </div>
      </Container>
    </section>
  );
}

/** A numbered run of steps on a hairline grid. */
export function ProSteps({
  eyebrow,
  title,
  lead,
  steps,
  tone = "stone",
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  steps: { title: string; body: string }[];
  tone?: "white" | "stone";
}) {
  const cols = steps.length % 3 === 0 ? "lg:grid-cols-3" : "lg:grid-cols-4";
  return (
    <section className={tone === "stone" ? "bg-[#EFEDE9]" : "bg-white"}>
      <Container className="py-12 lg:py-16">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end">
          <div>
            <p className={LABEL}>{eyebrow}</p>
            <h2 style={LIGHT} className={`mt-4 ${H2}`}>
              {title}
            </h2>
          </div>
          {lead && (
            <p className="max-w-xl text-[17px] font-light leading-relaxed">
              {lead}
            </p>
          )}
        </div>
        <ol
          className={`mt-12 grid gap-px border border-[#14140f]/10 bg-[#14140f]/10 sm:grid-cols-2 ${cols}`}
        >
          {steps.map((s, i) => (
            <li key={s.title} className="bg-white p-6 lg:p-8">
              <span
                style={LIGHT}
                className="text-[34px] leading-none tabular-nums"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-6 text-[15px] uppercase tracking-[0.1em]">
                {s.title}
              </h3>
              <p className="mt-3 text-[15px] font-light leading-relaxed opacity-80">
                {s.body}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

/** Every page of a kind, grouped, as plain links with a line each. */
export function ProIndex({
  eyebrow,
  title,
  groups,
  tone = "white",
}: {
  eyebrow: string;
  title: string;
  groups: {
    title: string;
    links: { label: string; href: string; note?: string }[];
  }[];
  tone?: "white" | "stone";
}) {
  return (
    <section className={tone === "stone" ? "bg-[#EFEDE9]" : "bg-white"}>
      <Container className="py-12 lg:py-16">
        <p className={LABEL}>{eyebrow}</p>
        <h2 style={LIGHT} className={`mt-4 ${H2}`}>
          {title}
        </h2>
        <div className="mt-12 grid gap-x-12 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((g) => (
            <div key={g.title}>
              <h3 className="border-b border-[#14140f] pb-3 text-[13px] uppercase tracking-[0.14em]">
                {g.title}
              </h3>
              <ul>
                {g.links.map((l) => (
                  <li key={l.href} className="border-b border-[#14140f]/12">
                    <Link
                      href={l.href}
                      className="group/link flex items-start justify-between gap-4 py-4"
                    >
                      <span>
                        <span className="block text-[16px] group-hover/link:underline group-hover/link:underline-offset-4">
                          {l.label}
                        </span>
                        {l.note && (
                          <span className="mt-1 block text-[14px] font-light leading-snug opacity-70">
                            {l.note}
                          </span>
                        )}
                      </span>
                      <ArrowRight
                        className="mt-1 h-4 w-4 shrink-0"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

/** A comparison table on hairlines; on phones each row reads as a card. */
export function ProTable({
  eyebrow,
  title,
  lead,
  columns,
  rows,
  tone = "white",
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  columns: string[];
  rows: { cells: string[]; href?: string }[];
  tone?: "white" | "stone";
}) {
  return (
    <section className={tone === "stone" ? "bg-[#EFEDE9]" : "bg-white"}>
      <Container className="py-12 lg:py-16">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end">
          <div>
            <p className={LABEL}>{eyebrow}</p>
            <h2 style={LIGHT} className={`mt-4 ${H2}`}>
              {title}
            </h2>
          </div>
          {lead && (
            <p className="max-w-xl text-[17px] font-light leading-relaxed">
              {lead}
            </p>
          )}
        </div>
        <table className="mt-12 w-full border-collapse text-left">
          <thead className="hidden md:table-header-group">
            <tr className="border-b border-[#14140f]">
              {columns.map((c) => (
                <th
                  key={c}
                  scope="col"
                  className="pb-3 pr-6 text-[12px] font-normal uppercase tracking-[0.12em]"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.cells[0]}
                className="block border-b border-[#14140f]/15 py-4 md:table-row md:py-0"
              >
                {r.cells.map((cell, i) => (
                  <td
                    key={columns[i]}
                    className={`block py-1 md:table-cell md:py-5 md:pr-6 md:align-top ${i === 0 ? "text-[17px]" : "text-[15px] font-light"}`}
                  >
                    <span className="mr-2 text-[11px] uppercase tracking-[0.12em] opacity-60 md:hidden">
                      {i > 0 ? columns[i] : ""}
                    </span>
                    {i === 0 && r.href ? (
                      <Link
                        href={r.href}
                        className="underline-offset-4 hover:underline"
                      >
                        {cell}
                      </Link>
                    ) : (
                      cell
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Container>
    </section>
  );
}

/** Dated milestones on a hairline row; a column on phones. */
export function ProTimeline({
  eyebrow,
  title,
  items,
  tone = "white",
}: {
  eyebrow: string;
  title: string;
  items: { year: string; title: string; body: string }[];
  tone?: "white" | "stone";
}) {
  return (
    <section className={tone === "stone" ? "bg-[#EFEDE9]" : "bg-white"}>
      <Container className="py-12 lg:py-16">
        <p className={LABEL}>{eyebrow}</p>
        <h2 style={LIGHT} className={`mt-4 ${H2}`}>
          {title}
        </h2>
        <ol className="mt-12 grid border-t border-[#14140f] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {items.map((m) => (
            <li
              key={m.year + m.title}
              className="relative border-b border-[#14140f]/15 py-7 pr-6 xl:border-b-0"
            >
              <span
                aria-hidden="true"
                className="absolute -top-[5px] left-0 h-[9px] w-[9px] rounded-full bg-[#14140f]"
              />
              <p
                style={LIGHT}
                className="text-[40px] leading-none tracking-[-0.02em] lg:text-[48px]"
              >
                {m.year}
              </p>
              <h3 className="mt-5 text-[14px] uppercase tracking-[0.1em]">
                {m.title}
              </h3>
              <p className="mt-3 text-[15px] font-light leading-relaxed opacity-80">
                {m.body}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

/** Portraits with names and roles; a LinkedIn link where one is known. */
export function ProTeam({
  eyebrow,
  title,
  lead,
  people,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  people: { name: string; role: string; photo: string; linkedin?: string }[];
}) {
  return (
    <section className="bg-white">
      <Container className="py-12 lg:py-16">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end">
          <div>
            <p className={LABEL}>{eyebrow}</p>
            <h2 style={LIGHT} className={`mt-4 ${H2}`}>
              {title}
            </h2>
          </div>
          {lead && (
            <p className="max-w-xl text-[17px] font-light leading-relaxed">
              {lead}
            </p>
          )}
        </div>
        <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-6">
          {people.map((p) => {
            const body = (
              <>
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#E4E1DB]">
                  <Image
                    src={p.photo}
                    alt={p.name}
                    fill
                    sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                    className="object-cover grayscale transition duration-500 group-hover/person:grayscale-0"
                  />
                </div>
                <p className="mt-4 text-[15px] uppercase tracking-[0.08em]">
                  {p.name}
                </p>
                <p className="mt-1 text-[14px] font-light leading-snug opacity-70">
                  {p.role}
                </p>
              </>
            );
            return (
              <li key={p.name}>
                {p.linkedin ? (
                  // No aria-label: the card's own text names the link, so
                  // voice control can use what is on screen (WCAG 2.5.3).
                  <a
                    href={p.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/person block"
                  >
                    {body}
                    <span className="sr-only">
                      {" "}
                      (LinkedIn profile, opens in a new tab)
                    </span>
                  </a>
                ) : (
                  <div className="group/person">{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}

/** Big figures on a black band: the facts a page rests on. */
export function ProFigures({
  eyebrow,
  title,
  items,
}: {
  eyebrow: string;
  title: string;
  items: { value: string; label: string; note?: string }[];
}) {
  return (
    <div data-over-media className="bg-[#14140f]">
      <Container className="py-12 lg:py-16">
        <p className={LABEL}>{eyebrow}</p>
        <h2 style={LIGHT} className={`mt-4 max-w-4xl ${H2}`}>
          {title}
        </h2>
        <div
          className={`mt-12 grid border-t border-white/25 sm:grid-cols-2 ${items.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}
        >
          {items.map((f) => (
            <div
              key={f.label}
              className="border-b border-white/15 py-8 pr-6 lg:border-b-0 lg:border-r lg:pl-6 lg:[&:first-child]:pl-0 lg:[&:last-child]:border-r-0"
            >
              <p
                style={LIGHT}
                className="text-[48px] leading-none tracking-[-0.03em] lg:text-[64px]"
              >
                {f.value}
              </p>
              <p className="mt-4 text-[14px] uppercase tracking-[0.1em]">
                {f.label}
              </p>
              {f.note && (
                <p className="mt-2 text-[15px] font-light leading-relaxed text-white/75">
                  {f.note}
                </p>
              )}
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}

/** Questions and answers, open without JavaScript, with FAQPage data. */
export function ProFaq({
  title = "Questions",
  items,
}: {
  title?: string;
  items: { q: string; a: string }[];
}) {
  return (
    <section className="bg-white">
      <Container className="grid gap-10 py-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16 lg:py-16">
        <div>
          <p className={LABEL}>FAQ</p>
          <h2 style={LIGHT} className={`mt-4 ${H2}`}>
            {title}
          </h2>
        </div>
        <div className="border-t border-[#14140f]/15">
          {items.map((f, i) => (
            <details
              key={f.q}
              open={i === 0}
              className="group border-b border-[#14140f]/15"
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6 text-[17px] [&::-webkit-details-marker]:hidden">
                <span>{f.q}</span>
                <span
                  aria-hidden="true"
                  className="mt-1 text-xl leading-none transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="max-w-3xl pb-7 text-[16px] font-light leading-relaxed opacity-80">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </Container>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: items.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />
    </section>
  );
}

/** The closing band: a photograph under a dark wash, a line, two ways on. */
export function ProClose({
  title,
  body,
  ctas,
  image,
}: {
  title: string;
  body: string;
  ctas: Cta[];
  image: string;
}) {
  return (
    <div
      data-over-media
      className="relative isolate overflow-hidden bg-[#14140f]"
    >
      <Image
        src={image}
        alt=""
        fill
        sizes="100vw"
        className="-z-20 object-cover"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/65" />
      <Container className="py-12 lg:py-20">
        <h2
          style={LIGHT}
          className="max-w-4xl text-[34px] uppercase leading-[1.02] tracking-[-0.03em] sm:text-5xl lg:text-[68px]"
        >
          {title}
        </h2>
        <p className="mt-6 max-w-2xl text-lg font-light leading-snug">{body}</p>
        <div className="mt-10">
          <DarkCtas ctas={ctas} />
        </div>
      </Container>
    </div>
  );
}
