"use client";

import { motion } from "framer-motion";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/animated-section";
import { TextReveal } from "@/components/ui/text-reveal";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

interface SanityProject {
  _id: string;
  name: string;
  location: string;
  image: string | null;
  /**
   * Optional resolved video URL. The GROQ projection coalesces a
   * direct file upload with the manual URL field, so the component
   * sees one source regardless of how the editor supplied it.
   * When present, the project card plays this video instead of the
   * static image.
   */
  videoUrl: string | null;
  link: string | null;
  /**
   * Display Order, interpreted as an explicit 1-indexed card slot
   * (1–5) on the homepage grid:
   *   1 → row 1 left  (big card)
   *   2 → row 1 right
   *   3 → row 2 left
   *   4 → row 2 middle
   *   5 → row 2 right
   * Null/missing/out-of-range falls back to the first unclaimed
   * slot during assembly.
   */
  order: number | null;
}

const fallbackProjects = [
  {
    loc: "Villa · Mumbai",
    name: "Malabar Hill Residence",
    bg: "from-stone-200 to-stone-100",
  },
  {
    loc: "Hotel · Warsaw",
    name: "Polska Lounge",
    bg: "from-stone-600 to-stone-500",
  },
  {
    loc: "Retail · Dubai",
    name: "Alserkal Flagship",
    bg: "from-stone-700 to-stone-600",
  },
  {
    loc: "Residence · Bengaluru",
    name: "Koramangala House",
    bg: "from-stone-300 to-stone-200",
  },
  {
    loc: "Healthcare · London",
    name: "St. James Clinic",
    bg: "from-stone-400 to-stone-500",
  },
];

const gradientFallbacks = [
  "from-stone-200 to-stone-100",
  "from-stone-600 to-stone-500",
  "from-stone-700 to-stone-600",
  "from-stone-300 to-stone-200",
  "from-stone-400 to-stone-500",
];

export function SignatureProjects({
  projects,
}: {
  projects?: SanityProject[];
}) {
  /**
   * Item assembly. The grid is always laid out as a 5-card layout
   * (2 in row 1, 3 in row 2) so a single real project doesn't
   * collapse the section visually.
   *
   * Slot semantics
   * --------------
   * Each Sanity project's Display Order field is treated as an
   * explicit 1-indexed slot binding (1–5):
   *   1 → row 1 left  (big card)
   *   2 → row 1 right
   *   3 → row 2 left
   *   4 → row 2 middle
   *   5 → row 2 right
   *
   * Assembly:
   *   1. Allocate 5 fallback slots (the original placeholder grid).
   *   2. Place every Sanity project with a valid order into its
   *      bound slot, overwriting that slot's fallback.
   *   3. Sanity projects without a valid order (missing / out of
   *      range / collision) take the first unclaimed slot from the
   *      top.
   *   4. If MORE than 5 Sanity projects exist, all extras are
   *      appended after slot 5 in declaration order so nothing is
   *      hidden.
   */
  const TARGET_SLOTS = 5;
  type Item = {
    name: string;
    loc: string;
    image: string | null;
    videoUrl: string | null;
    link: string | null;
    bg?: string;
  };

  const fallbackItems: Item[] = fallbackProjects.map((p) => ({
    name: p.name,
    loc: p.loc,
    image: null,
    videoUrl: null,
    link: null,
    bg: p.bg,
  }));

  const sanityProjects = projects ?? [];

  const toItem = (p: SanityProject): Item => ({
    name: p.name,
    loc: p.location,
    image: p.image,
    videoUrl: p.videoUrl,
    link: p.link,
  });

  // Start with fallback placeholders in all 5 slots.
  const slots: Item[] = fallbackItems.slice(0, TARGET_SLOTS).map((it) => ({
    ...it,
  }));
  const claimed = new Set<number>();

  // Pass 1 — place every Sanity project that has a valid 1-5 order
  // into its bound slot.
  const deferred: SanityProject[] = [];
  for (const p of sanityProjects) {
    const slotIdx = typeof p.order === "number" ? p.order - 1 : -1;
    if (slotIdx >= 0 && slotIdx < TARGET_SLOTS) {
      slots[slotIdx] = toItem(p);
      claimed.add(slotIdx);
    } else {
      deferred.push(p);
    }
  }

  // Pass 2 — place projects without an explicit slot into the
  // lowest unclaimed slot. Anything still unplaced after this is
  // overflow (more Sanity projects than slots).
  const overflow: Item[] = [];
  for (const p of deferred) {
    const free = slots.findIndex((_, i) => !claimed.has(i));
    if (free === -1) {
      overflow.push(toItem(p));
    } else {
      slots[free] = toItem(p);
      claimed.add(free);
    }
  }

  const items: Item[] = [...slots, ...overflow];

  const row1 = items.slice(0, 2);
  const row2 = items.slice(2);

  return (
    <section className="py-16 sm:py-20 md:py-28 px-6 bg-stone-950">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start justify-between gap-6 sm:gap-8 mb-10 sm:mb-16">
          <div className="lg:max-w-lg">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-xs font-medium tracking-[0.25em] uppercase text-stone-500 mb-4"
            >
              05 · Signature Projects
            </motion.div>
            <TextReveal
              as="h2"
              className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white leading-[1.08]"
            >
              Specified by architects on every continent.
            </TextReveal>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:max-w-md lg:pt-12"
          >
            <p className="text-base font-light text-stone-400 leading-relaxed">
              From residential villas in Mumbai to commercial towers in Warsaw
              and quick-service chains across North America — Pacific has
              shipped slabs into more than 30 countries.
            </p>
          </motion.div>
        </div>

        {/* Row 1 */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          {row1.map((p, i) => (
            <StaggerItem
              key={p.name}
              className={i === 0 ? "md:col-span-3" : "md:col-span-2"}
            >
              <ProjectCard
                item={p}
                aspect="aspect-[16/10]"
                fallbackBg={gradientFallbacks[i]}
              />
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Row 2 */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {row2.map((p, i) => (
            <StaggerItem key={p.name}>
              <ProjectCard
                item={p}
                aspect="aspect-[4/3]"
                fallbackBg={
                  gradientFallbacks[(i + 2) % gradientFallbacks.length]
                }
              />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

function ProjectCard({
  item,
  aspect,
  fallbackBg,
}: {
  item: {
    name: string;
    loc: string;
    image: string | null;
    videoUrl: string | null;
    link: string | null;
    bg?: string;
  };
  aspect: string;
  fallbackBg: string;
}) {
  const content = (
    <>
      {item.videoUrl ? (
        <ProjectVideo
          src={item.videoUrl}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : item.image ? (
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      ) : (
        <div
          className={`absolute inset-0 bg-gradient-to-br ${item.bg || fallbackBg}`}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
        <div className="text-sm font-medium text-white">{item.name}</div>
      </div>
    </>
  );

  const className = `group relative rounded-2xl overflow-hidden ${aspect} cursor-pointer block`;

  if (item.link) {
    return (
      <Link
        href={item.link}
        target={item.link.startsWith("http") ? "_blank" : undefined}
        className={className}
      >
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}

/**
 * Looping showcase video that only decodes while it's actually on
 * screen. Solves the "5 cards × concurrent video decoders" lag we
 * saw scrolling through the Signature Projects section.
 *
 * Difference from a naïve `<video autoPlay loop>`:
 *   - `preload="none"` so the browser doesn't fetch any video bytes
 *     until we deliberately call play(). Saves bandwidth + decode
 *     work for cards the user never reaches.
 *   - IntersectionObserver-driven play/pause. When the card scrolls
 *     into view (≥30% visible) the video plays; when it scrolls out
 *     it pauses. So at any moment only the cards actually in the
 *     viewport are doing video work — typically 2–3 of the 5 cards.
 *   - No autoplay attribute — play() is invoked manually after
 *     visibility, which most browsers honour for muted+playsInline
 *     video without any user-gesture requirement.
 *
 * The clip continues looping while visible (matching the moving-
 * photograph aesthetic of the existing showcase), then pauses
 * cleanly on exit so the GPU can rest.
 */
function ProjectVideo({ src, className }: { src: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            // play() returns a promise that rejects if autoplay is
            // blocked. Muted+playsInline rarely triggers that, but
            // swallow rejection so it doesn't surface as an
            // unhandled error during fast scrolls.
            el.play().catch(() => {});
          } else {
            el.pause();
          }
        }
      },
      // 30% visible before we start decoding — keeps cards just
      // entering the bottom of the viewport quiet until they're
      // committed to view, and also delays pause until a card is
      // mostly off-screen so a quick scroll-by doesn't flicker.
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      key={src}
      src={src}
      loop
      muted
      playsInline
      preload="none"
      aria-hidden="true"
      className={className}
    />
  );
}
