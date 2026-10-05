"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The building blocks of the "<Space> by Pacific Surfaces" pages
 * (/spaces/kitchens, /applications/flooring), laid out after
 * cosentino.com/kitchens: full-bleed hero, a tabbed strip of reasons, a
 * sliding row of cards, split panels, a tabbed gallery, colour tiles, an
 * FAQ and the other spaces. Each page passes its own copy and media.
 *
 * The site's black-on-white skin (app/bw-temp.css) pins heading weights
 * with an unlayered rule, so weights are set inline, and copy over a
 * photograph carries `data-over-media` to stay white.
 */

export const LIGHT = { fontVariationSettings: "'wght' 250, 'wdth' 100" };
export const PANEL = "bg-[#EFEDE9]";

export interface SpaceTab {
  label: string;
  heading: string;
  body: [string, string];
  image: string;
  alt: string;
  /** Show the whole image on white (a drawing) instead of filling the frame. */
  contain?: boolean;
}

export interface SpaceCard {
  title: string;
  href: string;
  image: string;
  alt: string;
}

export interface SpaceShot {
  src: string;
  alt: string;
  tags: string[];
}

export interface SpaceColour {
  name: string;
  slug: string;
  image: string | null;
}

export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-[1760px] px-5 sm:px-8 lg:px-12", className)}>{children}</div>;
}

export function Heading({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <h2 style={LIGHT} className={cn("text-pretty text-[26px] uppercase leading-[1.15] tracking-[-0.02em] sm:text-4xl lg:text-[42px]", className)}>
      {children}
    </h2>
  );
}

export function DarkButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex h-11 items-center gap-2 bg-[#1D1D1C] px-6 text-[13px] font-light text-white transition-opacity hover:opacity-85"
      data-over-media
    >
      {children}
      <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </Link>
  );
}

/** Full-bleed photograph with the page's one H1 over it. A long name can
 *  set a smaller title size with `titleClassName`. */
export function SpaceHero({
  title,
  lead,
  image,
  alt,
  titleClassName,
}: {
  title: string;
  lead: string;
  image: string;
  alt: string;
  titleClassName?: string;
}) {
  return (
    <section data-over-media className="relative isolate flex h-[78vh] min-h-[520px] items-end overflow-hidden bg-[#14140f] text-white">
      <Image src={image} alt={alt} fill priority sizes="100vw" className="-z-10 object-cover" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
      <Container className="pb-14 lg:pb-20">
        <h1 style={LIGHT} className={cn("text-5xl uppercase leading-none tracking-[-0.03em] sm:text-6xl lg:text-[96px]", titleClassName)}>
          {title}
        </h1>
        <p className="mt-5 max-w-xl text-lg font-light leading-snug lg:text-xl">{lead}</p>
      </Container>
    </section>
  );
}

export function SpaceCrumbs({
  label,
  parent = { label: "Spaces", href: "/spaces" },
}: {
  label: string;
  /** The section the page sits in; Spaces unless it says otherwise. */
  parent?: { label: string; href: string };
}) {
  return (
    <nav aria-label="Breadcrumb" className={PANEL}>
      <Container className="flex gap-2 py-4 text-xs font-light">
        <Link href="/" className="hover:opacity-70">Home</Link>
        <span aria-hidden="true">›</span>
        <Link href={parent.href} className="hover:opacity-70">{parent.label}</Link>
        <span aria-hidden="true">›</span>
        <span>{label}</span>
      </Container>
    </nav>
  );
}

/** Reasons, one tab at a time. */
export function SpaceTabs({ tabs, label, idPrefix }: { tabs: SpaceTab[]; label: string; idPrefix: string }) {
  const [active, setActive] = useState(0);
  const t = tabs[active];
  return (
    <section className="bg-white pt-12 lg:pt-16">
      <Container>
        <div role="tablist" aria-label={label} className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {tabs.map((tab, i) => (
            <button
              key={tab.label}
              type="button"
              role="tab"
              id={`${idPrefix}-tab-${i}`}
              aria-selected={i === active}
              aria-controls={`${idPrefix}-tab-panel`}
              onClick={() => setActive(i)}
              className={cn(
                "flex min-h-[96px] flex-col justify-between border px-5 py-4 text-left transition-colors",
                i === active ? cn(PANEL, "border-transparent") : "border-[#14140f]/10 hover:border-[#14140f]/30"
              )}
            >
              <span className="text-xs font-light">{String(i + 1).padStart(2, "0")}</span>
              <span className="mt-3 text-sm uppercase leading-snug tracking-[0.04em]">{tab.label}</span>
            </button>
          ))}
        </div>
      </Container>
      <div className={cn(PANEL, "mt-2")}>
        <Container>
          <div
            id={`${idPrefix}-tab-panel`}
            role="tabpanel"
            aria-labelledby={`${idPrefix}-tab-${active}`}
            className="grid items-center gap-10 py-12 md:grid-cols-2 lg:gap-16 lg:py-16"
          >
            <div>
              <Heading>{t.heading}</Heading>
              <div className="mt-10 grid gap-6 sm:grid-cols-2">
                {t.body.map((para) => (
                  <p key={para.slice(0, 24)} className="text-base font-light leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>
            </div>
            <div className={cn("relative aspect-[4/3] w-full overflow-hidden", t.contain && "bg-white")}>
              <Image
                key={t.image}
                src={t.image}
                alt={t.alt}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className={t.contain ? "object-contain p-4" : "object-cover"}
              />
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}

/** A sliding row of photograph cards. */
export function CardRow({ cards, tall = false }: { cards: SpaceCard[]; tall?: boolean }) {
  const row = useRef<HTMLDivElement>(null);
  const nudge = (dir: 1 | -1) => {
    const el = row.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    el.scrollBy({ left: dir * ((card?.offsetWidth ?? 320) + 16), behavior: "smooth" });
  };
  return (
    <>
      <div className="mb-4 flex justify-end gap-2">
        <button type="button" onClick={() => nudge(-1)} aria-label="Previous" className="p-2 hover:opacity-60">
          <ArrowLeft className="h-5 w-5" strokeWidth={1.25} />
        </button>
        <button type="button" onClick={() => nudge(1)} aria-label="Next" className="p-2 hover:opacity-60">
          <ArrowRight className="h-5 w-5" strokeWidth={1.25} />
        </button>
      </div>
      <div ref={row} className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {cards.map((card) => (
          <Link
            key={`${card.href} ${card.title}`}
            href={card.href}
            className={cn(
              "group relative block w-[80%] shrink-0 snap-start overflow-hidden sm:w-[45%] lg:w-[calc((100%-2rem)/3)]",
              tall ? "aspect-[3/4]" : "aspect-[4/5]"
            )}
          >
            <Image src={card.image} alt={card.alt} fill sizes="(min-width: 1024px) 33vw, 80vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
            <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/45" />
            <span data-over-media className="absolute left-6 top-6 text-lg font-light text-white">{card.title}</span>
            <ArrowRight data-over-media className="absolute bottom-6 left-6 h-5 w-5 text-white" strokeWidth={1.25} aria-hidden="true" />
          </Link>
        ))}
      </div>
    </>
  );
}

export function SpaceDesign({ heading, body, cards }: { heading: string; body: string[]; cards: SpaceCard[] }) {
  return (
    <section className="bg-white py-20 lg:py-28">
      <Container>
        <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
          <Heading>{heading}</Heading>
          {body.map((para) => (
            <p key={para.slice(0, 24)} className="text-base font-light leading-relaxed lg:pt-2">
              {para}
            </p>
          ))}
        </div>
        <div className="mt-12">
          <CardRow cards={cards} />
        </div>
      </Container>
    </section>
  );
}

/** A panel of copy beside a photograph. */
export function Split({
  heading,
  body,
  cta,
  image,
  alt,
}: {
  heading: string;
  body: string;
  cta: { label: string; href: string };
  image: string;
  alt: string;
}) {
  return (
    <section className="bg-white pb-20 lg:pb-28">
      <Container>
        <div className="grid md:grid-cols-2">
          <div className={cn(PANEL, "flex flex-col justify-between gap-10 p-8 lg:p-12")}>
            <Heading className="lg:text-[36px]">{heading}</Heading>
            <div>
              <p className="max-w-md text-base font-light leading-relaxed">{body}</p>
              <div className="mt-6">
                <DarkButton href={cta.href}>{cta.label}</DarkButton>
              </div>
            </div>
          </div>
          <div className="relative aspect-[4/3] w-full overflow-hidden md:aspect-auto md:min-h-[420px]">
            <Image src={image} alt={alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
        </div>
      </Container>
    </section>
  );
}

/** Photographs, filtered by tag. */
export function SpaceGallery({ heading, tags, shots }: { heading: string; tags: string[]; shots: SpaceShot[] }) {
  const [tag, setTag] = useState(tags[0]);
  const shown = shots.filter((s) => s.tags.includes(tag));
  return (
    <section className="bg-white pb-20 lg:pb-28">
      <Container>
        <Heading>{heading}</Heading>
        <div role="tablist" aria-label="Filter the gallery" className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
          {tags.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={t === tag}
              onClick={() => setTag(t)}
              className={cn(
                "border-b pb-1 text-sm font-light transition-colors",
                t === tag ? "border-[#14140f]" : "border-transparent hover:border-[#14140f]/30"
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {shown.map((s) => (
            <div key={s.src} className="relative aspect-square overflow-hidden">
              <Image src={s.src} alt={s.alt} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

/** Popular colours, as tall slab tiles. */
export function SpaceColours({
  heading,
  cta,
  colours,
}: {
  heading: string;
  cta: { label: string; href: string };
  colours: SpaceColour[];
}) {
  if (colours.length === 0) return null;
  return (
    <section className="bg-white pb-20 lg:pb-28">
      <Container>
        <div className="text-center">
          <Heading className="mx-auto max-w-3xl">{heading}</Heading>
          <Link
            href={cta.href}
            className="mt-6 inline-flex h-10 items-center gap-2 border border-[#14140f] px-5 text-[13px] font-light transition-colors hover:bg-[#ECECE8]"
          >
            {cta.label}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className={cn("mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3", colours.length > 4 ? "lg:grid-cols-6" : "lg:grid-cols-4")}>
          {colours.map((col) => (
            <div key={col.slug}>
              <p className="text-sm font-light">{col.name}</p>
              <div className="relative mt-2 aspect-[1/2] w-full overflow-hidden bg-[#EFEDE9]">
                {col.image ? (
                  <Image src={col.image} alt={`${col.name} slab`} fill sizes="(min-width: 1024px) 16vw, 50vw" quality={90} className="object-cover" />
                ) : null}
              </div>
              <Link href={`/products/${col.slug}`} className="mt-3 inline-flex items-center gap-1.5 border-b border-[#14140f] pb-0.5 text-xs font-light">
                Colour details
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function SpaceFaqs({ heading, faqs }: { heading: string; faqs: { question: string; answer: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="bg-white pb-20 lg:pb-28">
      <Container>
        <Heading className="max-w-xl">{heading}</Heading>
        <ul className="mt-10 border-t border-[#14140f]/15">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <li key={f.question} className="border-b border-[#14140f]/15">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center gap-6 py-5 text-left"
                >
                  <span className="w-6 shrink-0 text-xs font-light">{String(i + 1).padStart(2, "0")}</span>
                  <span className="flex-1 text-base font-light">{f.question}</span>
                  <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", isOpen && "rotate-180")} strokeWidth={1.25} aria-hidden="true" />
                </button>
                {isOpen && <p className="max-w-3xl pb-6 pl-12 text-base font-light leading-relaxed">{f.answer}</p>}
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}

/** The other spaces, as tall cards. */
export function SpaceOthers({ heading, cards }: { heading: string; cards: SpaceCard[] }) {
  return (
    <section className="bg-white pb-24 lg:pb-32">
      <Container>
        <Heading>{heading}</Heading>
        <div className="mt-8">
          <CardRow cards={cards} tall />
        </div>
      </Container>
    </section>
  );
}
