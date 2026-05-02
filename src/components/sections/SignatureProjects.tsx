"use client";

import { motion } from "framer-motion";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/animated-section";
import { TextReveal } from "@/components/ui/text-reveal";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface SanityProject {
  _id: string;
  name: string;
  location: string;
  image: string | null;
  // Sanity-generated low-quality (~20-byte base64) blur placeholder.
  // Painted instantly as a blurDataURL while the real poster loads —
  // gives the user a soft preview rather than a black tile during
  // the network round-trip on slow connections.
  imageLqip: string | null;
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
  // Phone detection — phones don't load project videos (see
  // ProjectVideo's `skipVideo` gate). If a Sanity project has a
  // `videoUrl` but no `image`, the card renders empty on phone
  // because there's nothing to paint. We filter those cards out
  // entirely at this level so phones never see a blank tile.
  const [isPhone, setIsPhone] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      setIsPhone(
        window.matchMedia("(pointer: coarse)").matches &&
          window.innerWidth < 1024
      );
    } catch {
      /* ignore */
    }
  }, []);

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
    imageLqip: string | null;
    videoUrl: string | null;
    link: string | null;
    bg?: string;
  };

  const fallbackItems: Item[] = fallbackProjects.map((p) => ({
    name: p.name,
    loc: p.loc,
    image: null,
    imageLqip: null,
    videoUrl: null,
    link: null,
    bg: p.bg,
  }));

  const sanityProjects = projects ?? [];

  const toItem = (p: SanityProject): Item => ({
    name: p.name,
    loc: p.location,
    image: p.image,
    imageLqip: p.imageLqip,
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

  const rawItems: Item[] = [...slots, ...overflow];

  // On phone: drop cards that would render empty (videoUrl-only,
  // no image to fall back to). Keep everything else, including
  // fallback placeholders (which have neither video nor image but
  // do have a `bg` gradient).
  const items: Item[] = isPhone
    ? rawItems.filter((it) => !(it.videoUrl && !it.image))
    : rawItems;

  // Recompute row split after filtering. row1 still gets up to 2
  // cards; row2 takes the rest. On phone the grid reflows to a
  // single column so a missing card just shrinks the section.
  const row1 = items.slice(0, 2);
  const row2 = items.slice(2);

  return (
    <section
      id="sec-architects"
      className="py-16 sm:py-20 md:py-28 px-6 bg-stone-950 scroll-mt-20"
    >
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
              04 · Architects
            </motion.div>
            <TextReveal
              as="h2"
              className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white leading-[1.08]"
            >
              Specified by leading architects.
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
              shipped slabs into more than 45 countries.
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
    imageLqip: string | null;
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
          poster={item.image ? thumbUrl(item.image) : undefined}
          posterLqip={item.imageLqip ?? undefined}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : item.image ? (
        <Image
          src={item.image}
          alt={item.name}
          fill
          {...(item.imageLqip
            ? {
                placeholder: "blur" as const,
                blurDataURL: item.imageLqip,
              }
            : {})}
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      ) : (
        <div
          className={`absolute inset-0 bg-gradient-to-br ${item.bg || fallbackBg}`}
        />
      )}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      {/* Caption + bottom scrim removed per editorial direction —
          cards now read as pure imagery without the project name
          band underneath. */}
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
// Sanity image CDN tweak: shrink mainImage to ~800px for use as a
// video poster. Saves bytes (multi-MB master -> ~30 KB AVIF/WebP)
// without losing visible quality for the time it's on screen before
// the video plays.
function thumbUrl(src: string): string {
  if (!src.includes("cdn.sanity.io")) return src;
  const sep = src.includes("?") ? "&" : "?";
  return `${src}${sep}w=800&fit=max&q=70&auto=format`;
}

function ProjectVideo({
  src,
  className,
  poster,
  posterLqip,
}: {
  src: string;
  className?: string;
  poster?: string;
  posterLqip?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  // The poster image is mounted for every card from page load with
  // priority/eager loading, so by the time any card scrolls into
  // view its still frame is already painted. The <video> only fades
  // in once it can actually play frames; until then the poster
  // covers it.
  const [canPlay, setCanPlay] = useState(false);
  // Slow-network / low-RAM gate. We snapshot once at mount and
  // never reload — flapping between cellular and Wi-Fi mid-page
  // would flicker the layout otherwise. When `skipVideo` is true the
  // <video> element is never rendered and we deliver only the
  // poster image.
  const [skipVideo, setSkipVideo] = useState(false);

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    type NavConnection = {
      effectiveType?: string;
      saveData?: boolean;
    };
    const conn = (
      navigator as unknown as { connection?: NavConnection }
    ).connection;
    const memGB = (navigator as unknown as { deviceMemory?: number })
      .deviceMemory;
    const slowNet =
      conn?.saveData === true ||
      (conn?.effectiveType !== undefined &&
        ["slow-2g", "2g", "3g"].includes(conn.effectiveType));
    const lowMem = typeof memGB === "number" && memGB <= 2;
    // Phone gate: any touch device with a narrow viewport gets the
    // poster-only treatment regardless of network. Architects-section
    // videos on phone were costing too much for too little — first
    // and last cards in particular were stuttering on entry. Posters
    // already convey the editorial feel; videos are a desktop
    // augmentation.
    let isPhone = false;
    try {
      isPhone =
        window.matchMedia("(pointer: coarse)").matches &&
        window.innerWidth < 1024;
    } catch {
      /* ignore — older browsers */
    }
    if (slowNet || lowMem || isPhone) setSkipVideo(true);
  }, []);

  useEffect(() => {
    if (skipVideo) return;
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
  }, [skipVideo]);

  // Resolve a poster URL identically to the old video poster prop
  // logic, so the eager <Image> matches what the <video> would have
  // shown otherwise.
  const posterSrc =
    poster ??
    (src.startsWith("/videos/")
      ? src.replace(/\.mp4$/, "-poster.jpg")
      : undefined);

  return (
    <>
      {posterSrc && (
        <Image
          src={posterSrc}
          alt=""
          aria-hidden="true"
          fill
          // Sanity LQIP gives an instant (sub-50 ms) blur placeholder
          // while the real poster streams in. Without this, slow
          // cellular shows a black tile for 1-3 s.
          {...(posterLqip
            ? {
                placeholder: "blur" as const,
                blurDataURL: posterLqip,
              }
            : {})}
          sizes="(max-width: 768px) 100vw, 33vw"
          className={`object-cover transition-opacity duration-500 ${
            !skipVideo && canPlay ? "opacity-0" : "opacity-100"
          }`}
        />
      )}
      {!skipVideo && (
        <video
          ref={ref}
          key={src}
          src={src}
          poster={posterSrc}
          loop
          muted
          playsInline
          preload="none"
          onCanPlay={() => setCanPlay(true)}
          aria-hidden="true"
          className={`${className ?? ""} transition-opacity duration-500 ${
            canPlay ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </>
  );
}
