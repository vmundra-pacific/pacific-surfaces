"use client";

/**
 * ApplicationsScrollSections — replaces the old 4-card "Applications"
 * grid with four full-viewport scroll sections, each with its own
 * scroll-driven transition treatment.
 *
 * Layout
 * ------
 * Each section is a `min-h-[200vh]` outer container with an inner
 * `sticky top-0 h-screen` content block. As the user scrolls, the
 * section pins for ~one viewport's worth of scroll, the inner
 * content animates against `scrollYProgress`, then unpins so the
 * next section can take over.
 *
 * The four treatments
 * -------------------
 *   01 · Kitchen      — Slab Sweep (image dollies in from right,
 *                        text reveals up from left).
 *   02 · Bath         — Liquid Reveal (clip-path inset wipes from
 *                        bottom, text floats in with blur→focus).
 *   03 · Architecture — Tile Build (3×3 grid of tiles starts
 *                        exploded/rotated, snaps into place).
 *   04 · Commercial   — Crossfade Cycle (sticky text panel; image
 *                        area cycles through 4 frames).
 *
 * Imagery / video
 * ---------------
 * Each section pulls media from the matching Sanity `applicationCard`
 * document (matched by a substring of its label). The card supports
 * EITHER a static image (`image` field) or a video URL (`videoUrl`
 * field) — when both are set, video wins. If neither is present,
 * the section renders a tasteful CSS-only placeholder so the page
 * never looks broken; the placeholders are intentionally muted so
 * they read as "design choice" rather than "asset failed to load".
 *
 * Architecture and Commercial use image-specific transition tricks
 * (the 3×3 tile build / the 4-frame crossfade cycle), so when a
 * video is supplied for those sections the sub-effect is bypassed
 * and the video plays full-frame. Section pin + text scroll-in
 * still happens; you just get a single playing clip instead of the
 * still-image gimmick.
 */

import { useEffect, useRef } from "react";
import Image from "next/image";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";

/* ------------------------------------------------------------------ *
 * Sanity data shape                                                   *
 * ------------------------------------------------------------------ */
/**
 * One frame in a multi-frame slideshow. Comes back from the GROQ
 * projection per item in the `frames` array, with video URL already
 * coalesced from upload/string.
 */
interface SanityFrame {
  label: string | null;
  videoUrl: string | null;
  image: string | null;
}

interface SanityApplicationCard {
  _id: string;
  label: string;
  /**
   * Explicit homepage-section binding from Sanity Studio. When an
   * editor picks one of "kitchen" | "bath" | "architecture" |
   * "commercial" via the radio, this is the unambiguous mapping
   * used by the component. Optional — falls back to label
   * substring + order-based matching when missing.
   */
  section: "kitchen" | "bath" | "architecture" | "commercial" | null;
  order: number | null;
  title: string;
  description: string;
  image: string | null;
  /**
   * Resolved video URL. The GROQ projection coalesces an uploaded
   * file's URL with the manual `videoUrl` string field, so the
   * component sees a single source regardless of how the editor
   * supplied it.
   */
  videoUrl: string | null;
  link: string | null;
  /**
   * Multi-frame slideshow content. Currently only consumed by the
   * Commercial section, which crossfades through the frames on
   * scroll. Null/empty means "use the single source above instead".
   */
  frames: SanityFrame[] | null;
}

/**
 * One frame in a Commercial section's slideshow, normalised to
 * match the rest of the component's media-resolution shape.
 */
interface FrameMedia {
  label?: string;
  videoUrl?: string;
  imageUrl?: string;
}

/**
 * Resolved media for a single section. At most one of `videoUrl` or
 * `imageUrl` will be set on the single-source path, with video
 * winning when both are populated. `frames` is the multi-source
 * path — when present and non-empty, the section crossfades through
 * the frames in order as the user scrolls.
 */
interface SectionMedia {
  videoUrl?: string;
  imageUrl?: string;
  frames?: FrameMedia[];
}

/* ------------------------------------------------------------------ *
 * Editorial copy — kept in code so we control typography precisely.   *
 * Image URLs flow through from Sanity; copy is locked here.           *
 * ------------------------------------------------------------------ */
type SectionKey = "kitchen" | "bath" | "architecture" | "commercial";

interface SectionCopy {
  label: string;
  title: string;
  titleAccent: string;
  description: string;
  /** Substring used to look up the matching Sanity applicationCard. */
  match: string;
  /**
   * Tasteful per-section placeholder gradient, used when no Sanity
   * image is present. Tuned so each section reads visually distinct
   * even before real photography lands.
   */
  placeholderGradient: string;
}

const SECTION_COPY: Record<SectionKey, SectionCopy> = {
  kitchen: {
    label: "01 · Kitchen",
    title: "Countertops",
    titleAccent: "& Islands",
    description:
      'Heat-, stain-, and scratch-resistant. Seamless 137" slabs reduce the need for joints on large islands.',
    match: "kitchen",
    // Light marble: warm cream → soft white with a faint vein wash.
    placeholderGradient:
      "linear-gradient(135deg, #efe9dc 0%, #f7f3ea 40%, #eae2ce 100%)",
  },
  bath: {
    label: "02 · Bath",
    title: "Vanities",
    titleAccent: "& Shower Walls",
    description:
      "Non-porous. Will not harbour bacteria or absorb water. Greenguard Gold certified for indoor air quality.",
    match: "bath",
    // Cool tonal — porcelain white with a hint of glacial blue.
    placeholderGradient:
      "linear-gradient(160deg, #f4f6f8 0%, #e2e8ec 50%, #c8d3da 100%)",
  },
  architecture: {
    label: "03 · Architecture",
    title: "Wall Cladding",
    titleAccent: "& Façades",
    description:
      'Never tile a wall again. At 137" × 79", our slabs are the largest format made — clad an entire wall in a single continuous piece.',
    match: "architecture",
    // Dark architectural stone — graphite to deep slate.
    placeholderGradient:
      "linear-gradient(135deg, #3a4148 0%, #2a3036 50%, #1a1f24 100%)",
  },
  commercial: {
    label: "04 · Commercial",
    title: "Hospitality",
    titleAccent: "& Healthcare",
    description:
      "NSF/ANSI 51 food-contact safe. Used across QSR chains, luxury hotels, and hospital clean surfaces.",
    match: "commercial",
    // Warm bronze — hospitality-leaning, gold-amber.
    placeholderGradient:
      "linear-gradient(135deg, #5a4a35 0%, #6e5a3e 50%, #4a3c2a 100%)",
  },
};

/* ------------------------------------------------------------------ *
 * Helpers                                                             *
 * ------------------------------------------------------------------ */
/**
 * Section-key ordering. Used both to drive iteration in the public
 * composer and to fall back to order-based matching when neither the
 * explicit `section` field nor a label substring lines up.
 */
const SECTION_ORDER: SectionKey[] = [
  "kitchen",
  "bath",
  "architecture",
  "commercial",
];

/**
 * Resolve which Sanity applicationCard belongs to a given section,
 * trying three strategies in priority order:
 *
 *   1. EXPLICIT  — card's `section` field exactly equals the key.
 *      The unambiguous editor-controlled binding. Always wins.
 *   2. LABEL     — card's label contains the section key as a
 *      substring (case-insensitive). The legacy heuristic, kept so
 *      pre-existing data ("01 · Kitchen", etc.) still maps.
 *   3. ORDER     — card sits at the index this section occupies in
 *      SECTION_ORDER (kitchen=0, bath=1, architecture=2,
 *      commercial=3) within the order-sorted applications array.
 *      Last-resort fallback for editors who only set Display Order.
 *
 * Cards already claimed by a higher-priority strategy are removed
 * from the pool so we don't double-assign a single card to two
 * sections.
 *
 * Video wins over image when both are populated on the matched card.
 */
function buildMediaResolver(applications?: SanityApplicationCard[]) {
  const claimed = new Set<string>();
  const pool = applications ?? [];

  return (sectionKey: SectionKey): SectionMedia => {
    const sectionIndex = SECTION_ORDER.indexOf(sectionKey);

    // 1. Explicit section field match.
    let card = pool.find(
      (a) => !claimed.has(a._id) && a.section === sectionKey
    );

    // 2. Label substring match.
    if (!card) {
      card = pool.find(
        (a) =>
          !claimed.has(a._id) && a.label?.toLowerCase().includes(sectionKey)
      );
    }

    // 3. Order-based fallback — find the unclaimed card whose
    //    position in the sorted array matches this section's index.
    if (!card) {
      const unclaimedSorted = pool.filter((a) => !claimed.has(a._id));
      card = unclaimedSorted[sectionIndex] ?? unclaimedSorted[0];
    }

    if (!card) return {};
    claimed.add(card._id);
    return {
      videoUrl: card.videoUrl ?? undefined,
      imageUrl: card.image ?? undefined,
      // Normalise frames into the component's local shape. Filter
      // out frames with no media at all so the cycle doesn't show
      // empty slots — and drop the `frames` key entirely if nothing
      // survives, so downstream code can use a simple
      // `frames?.length` check.
      frames: (() => {
        const cleaned = (card.frames ?? [])
          .map((f) => ({
            label: f.label ?? undefined,
            videoUrl: f.videoUrl ?? undefined,
            imageUrl: f.image ?? undefined,
          }))
          .filter((f) => f.videoUrl || f.imageUrl);
        return cleaned.length > 0 ? cleaned : undefined;
      })(),
    };
  };
}

/** Section eyebrow — same treatment across all four for visual rhythm. */
function Eyebrow({
  children,
  opacity,
}: {
  children: string;
  opacity: MotionValue<number>;
}) {
  return (
    <motion.div
      style={{ opacity }}
      className="text-[10px] md:text-xs tracking-[0.3em] uppercase text-pacific-mid mb-5"
    >
      {children}
    </motion.div>
  );
}

/**
 * PlayOnceVideo — `<video>` that defers playback to viewport
 * intersection. Plays from the start every time the section enters
 * view; pauses when it leaves so we don't burn CPU on off-screen
 * playback. Doesn't loop — the clip plays through, freezes on its
 * last frame, and only restarts the next time the user scrolls
 * back into view.
 *
 * Why not autoplay-on-mount? With a long homepage, the user often
 * scrolls past several screens before reaching this section. By the
 * time they arrive, an autoplay-on-mount video has already finished
 * and they'd only see a static last frame. IntersectionObserver
 * defers the play() call until the element is actually visible, so
 * the clip lands as a moment, not a missed moment.
 *
 * Restart-on-re-entry: when the user scrolls back to a section
 * they've already passed, the clip rewinds and plays again. We
 * rewind via `currentTime = 0` rather than recreating the element
 * so the network buffer stays warm.
 *
 * Replay transition: a snap from "frozen last frame" to "playing
 * first frame" is jarring, so on each replay we crossfade the
 * video to opacity 0 (220ms ease-in), rewind+play at the trough,
 * then ramp opacity back to 1 (350ms with a soft cubic-bezier).
 * The first play skips this transition because the section's own
 * scroll-driven entrance already provides the intro feel — a
 * second fade on top would compound and look odd.
 */
function PlayOnceVideo({
  src,
  className,
}: {
  src: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const opacity = useMotionValue(1);
  const hasPlayedRef = useRef(false);
  const isTransitioningRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            // Guard against re-fire during an in-flight crossfade —
            // otherwise rapid scrolling could stack play() calls.
            if (isTransitioningRef.current) continue;

            if (!hasPlayedRef.current) {
              // First time the section is on screen — just play.
              // The section's wrapper is doing its own intro
              // animation; piling another fade on top would feel
              // muddy.
              hasPlayedRef.current = true;
              el.currentTime = 0;
              el.play().catch(() => {});
            } else {
              // Replay path — fade out, rewind+play at the bottom
              // of the dip, fade back up.
              isTransitioningRef.current = true;
              animate(opacity, 0, {
                duration: 0.22,
                ease: [0.4, 0, 1, 1],
                onComplete: () => {
                  el.currentTime = 0;
                  el.play().catch(() => {});
                  animate(opacity, 1, {
                    duration: 0.35,
                    ease: [0.16, 1, 0.3, 1],
                    onComplete: () => {
                      isTransitioningRef.current = false;
                    },
                  });
                },
              });
            }
          } else {
            // Section left the viewport — pause so we're not
            // decoding frames the user can't see.
            el.pause();
          }
        }
      },
      // Threshold 0.25 = wait until ~a quarter of the player is on
      // screen so the clip doesn't start while it's still mostly
      // below the fold, and doesn't pause while it's still mostly
      // visible.
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
    // `opacity` is stable (returned from useMotionValue once) so it
    // doesn't need to re-create the observer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.video
      ref={ref}
      key={src}
      className={className}
      src={src}
      muted
      playsInline
      preload="metadata"
      aria-hidden="true"
      style={{ opacity }}
    />
  );
}

/**
 * MediaSlot — single source of truth for "play a video, OR show an
 * image, OR fall back to a tasteful placeholder" inside each section.
 * Each section composes this inside its own animated wrapper rather
 * than reimplementing the precedence logic.
 *
 * Video config: muted + playsInline so the clip is allowed to start
 * on every browser without a user gesture and survives mobile
 * autoplay restrictions. NO loop — the clip plays once and freezes
 * on its last frame, treating the video as a one-shot reveal rather
 * than a continuous distraction. preload="metadata" because the
 * section may not be in view yet; we don't want to eagerly download
 * every video on the homepage.
 *
 * Playback start is deferred to viewport intersection (see
 * PlayOnceVideo below) so the clip begins when the user reaches
 * the section, not when the page first loads. Without that, on a
 * long homepage the video would have already finished by the time
 * the user scrolled to it and they'd only ever see the last frame.
 */
function MediaSlot({
  media,
  alt,
  placeholderGradient,
  placeholderVariant,
  videoSizes = "(max-width: 1024px) 100vw, 60vw",
}: {
  media: SectionMedia;
  alt: string;
  placeholderGradient: string;
  placeholderVariant: "warm" | "cool";
  videoSizes?: string;
}) {
  if (media.videoUrl) {
    return (
      <PlayOnceVideo
        src={media.videoUrl}
        className="absolute inset-0 w-full h-full object-cover"
      />
    );
  }
  if (media.imageUrl) {
    return (
      <Image
        src={media.imageUrl}
        alt={alt}
        fill
        className="object-cover"
        sizes={videoSizes}
      />
    );
  }
  return (
    <PlaceholderPanel
      gradient={placeholderGradient}
      variant={placeholderVariant}
    />
  );
}

/** Headline pair — upright primary line + italic accent line. */
function Headline({
  primary,
  accent,
  className,
}: {
  primary: string;
  accent: string;
  className?: string;
}) {
  return (
    <h2
      className={
        "text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-light tracking-tight text-white leading-[1.05] " +
        (className ?? "")
      }
    >
      {primary}
      <br />
      <em className="italic font-extralight text-pacific-light/90">{accent}</em>
    </h2>
  );
}

/* ================================================================== *
 *  01 · KITCHEN — Slab Sweep                                          *
 *  Image dollies in from the right (translateX 18% → 0%, scale       *
 *  1.12 → 1.00) while a left-side text column floats up from below.  *
 * ================================================================== */
function KitchenSection({ media }: { media: SectionMedia }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const imageX = useTransform(scrollYProgress, [0.1, 0.55], ["18%", "0%"]);
  const imageScale = useTransform(scrollYProgress, [0.1, 0.6], [1.12, 1]);
  const imageOpacity = useTransform(scrollYProgress, [0.1, 0.4], [0, 1]);

  const textY = useTransform(scrollYProgress, [0.15, 0.5], [80, 0]);
  const textOpacity = useTransform(scrollYProgress, [0.15, 0.45], [0, 1]);
  const eyebrowOpacity = useTransform(scrollYProgress, [0.1, 0.35], [0, 1]);

  const copy = SECTION_COPY.kitchen;

  return (
    <section
      ref={ref}
      className="relative bg-[#0a1620]"
      style={{ minHeight: "200vh" }}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="h-full max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Text */}
          <motion.div
            style={{ opacity: textOpacity, y: textY }}
            className="lg:col-span-5"
          >
            <Eyebrow opacity={eyebrowOpacity}>{copy.label}</Eyebrow>
            <Headline primary={copy.title} accent={copy.titleAccent} />
            <p className="mt-6 text-base md:text-lg text-pacific-mid font-light max-w-md leading-relaxed">
              {copy.description}
            </p>
          </motion.div>

          {/* Image */}
          <motion.div
            style={{
              x: imageX,
              scale: imageScale,
              opacity: imageOpacity,
            }}
            className="lg:col-span-7 relative w-full aspect-[4/5] lg:aspect-[5/6] rounded-2xl overflow-hidden shadow-2xl"
          >
            <MediaSlot
              media={media}
              alt={`${copy.title} ${copy.titleAccent}`}
              placeholderGradient={copy.placeholderGradient}
              placeholderVariant="warm"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== *
 *  02 · BATH — Liquid Reveal                                          *
 *  Image starts hidden behind a clip-path inset that's clipping       *
 *  100% from the bottom. As you scroll, the inset retreats to 0%      *
 *  (water rising in a basin). Text fades from a slight blur to        *
 *  focus.                                                              *
 * ================================================================== */
function BathSection({ media }: { media: SectionMedia }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Bottom inset: 100% means fully clipped from bottom (image hidden).
  // Animate down to 0% to reveal upward, like water filling. Combined
  // with the static "inset(0% 0% X 0%)" wrapper into a single clipPath
  // motion value so the JSX style binding stays out of hook-call land.
  const clipBottom = useTransform(scrollYProgress, [0.15, 0.6], ["100%", "0%"]);
  const clipPath = useTransform(clipBottom, (v) => `inset(0% 0% ${v} 0%)`);
  const imageOpacity = useTransform(scrollYProgress, [0.15, 0.35], [0, 1]);

  const textBlur = useTransform(
    scrollYProgress,
    [0.2, 0.5],
    ["blur(12px)", "blur(0px)"]
  );
  const textOpacity = useTransform(scrollYProgress, [0.2, 0.5], [0, 1]);
  const textY = useTransform(scrollYProgress, [0.2, 0.5], [40, 0]);
  const eyebrowOpacity = useTransform(scrollYProgress, [0.15, 0.4], [0, 1]);

  const copy = SECTION_COPY.bath;

  return (
    <section
      ref={ref}
      className="relative bg-[#0d1d28]"
      style={{ minHeight: "200vh" }}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="h-full max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Image (left this time, for visual rhythm with kitchen) */}
          <motion.div
            style={{ opacity: imageOpacity }}
            className="lg:col-span-7 lg:order-1 order-2 relative w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl"
          >
            <motion.div
              // Clip from the bottom upward as we scroll. inset(top
              // right bottom left) — animating the bottom value
              // creates the "water rising" reveal.
              style={{ clipPath }}
              className="absolute inset-0"
            >
              <MediaSlot
                media={media}
                alt={`${copy.title} ${copy.titleAccent}`}
                placeholderGradient={copy.placeholderGradient}
                placeholderVariant="cool"
              />
            </motion.div>
          </motion.div>

          {/* Text right */}
          <motion.div
            style={{ opacity: textOpacity, y: textY, filter: textBlur }}
            className="lg:col-span-5 lg:order-2 order-1"
          >
            <Eyebrow opacity={eyebrowOpacity}>{copy.label}</Eyebrow>
            <Headline primary={copy.title} accent={copy.titleAccent} />
            <p className="mt-6 text-base md:text-lg text-pacific-mid font-light max-w-md leading-relaxed">
              {copy.description}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== *
 *  03 · ARCHITECTURE — Tile Build                                     *
 *  Image is split into a 3×3 grid of tiles. Each tile starts          *
 *  scattered (random offsets + rotations) and snaps into place        *
 *  along scrollYProgress. Per-tile scroll ranges stagger so they      *
 *  arrive in waves, not all at once.                                  *
 * ================================================================== */
function ArchitectureSection({ media }: { media: SectionMedia }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const textOpacity = useTransform(scrollYProgress, [0.55, 0.75], [0, 1]);
  const textY = useTransform(scrollYProgress, [0.55, 0.75], [40, 0]);
  const eyebrowOpacity = useTransform(scrollYProgress, [0.5, 0.7], [0, 1]);

  // Grid-gap collapse — once the tiles have finished flying in, the
  // 2px seams between them collapse to 0 so the 9 slices fuse into a
  // single seamless image. Tuned to land just as the text reveal
  // completes, so the section visually "settles" at that moment.
  const gridGap = useTransform(scrollYProgress, [0.55, 0.68], ["2px", "0px"]);

  const copy = SECTION_COPY.architecture;

  // Per-tile scatter parameters — tuned to feel like a controlled
  // explosion, not pure chaos. Each tile gets:
  //   - a starting offset (x, y) measured in % of the image area
  //   - a starting rotation (deg)
  //   - a scroll range during which it animates into place
  // Order roughly outside-in so the centre lands last.
  const tiles = [
    { x: -120, y: -110, rot: -22, range: [0.1, 0.45] }, // top-left
    { x: 0, y: -140, rot: 12, range: [0.12, 0.5] }, // top-mid
    { x: 130, y: -100, rot: 24, range: [0.14, 0.5] }, // top-right
    { x: -150, y: 0, rot: -14, range: [0.16, 0.55] }, // mid-left
    { x: 0, y: 0, rot: 0, range: [0.2, 0.6] }, // centre
    { x: 140, y: 10, rot: 16, range: [0.18, 0.55] }, // mid-right
    { x: -110, y: 130, rot: 18, range: [0.22, 0.6] }, // bot-left
    { x: 10, y: 150, rot: -10, range: [0.24, 0.6] }, // bot-mid
    { x: 130, y: 120, rot: 22, range: [0.22, 0.6] }, // bot-right
  ] as const;

  return (
    <section
      ref={ref}
      className="relative bg-[#080f15]"
      style={{ minHeight: "220vh" }}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="h-full max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Tile mosaic — OR a full-frame video if one's been
              supplied. Video gracefully bypasses the tile build
              because syncing 9 <video> elements would be punishing
              for the browser. The section still pins and the text
              still scroll-animates; you just get a single playing
              clip instead of the assembling grid. */}
          <div className="lg:col-span-7 relative w-full aspect-[5/6] rounded-2xl overflow-hidden">
            {media.videoUrl ? (
              <MediaSlot
                media={media}
                alt={`${copy.title} ${copy.titleAccent}`}
                placeholderGradient={copy.placeholderGradient}
                placeholderVariant="cool"
              />
            ) : (
              <>
                {/* Background placeholder — sits behind the tiles so
                    the section never looks empty during assembly. */}
                <div
                  className="absolute inset-0 opacity-[0.18]"
                  style={{ background: copy.placeholderGradient }}
                />
                <motion.div
                  style={{ gap: gridGap }}
                  className="absolute inset-0 grid grid-cols-3 grid-rows-3"
                >
                  {tiles.map((t, i) => (
                    <ArchitectureTile
                      key={i}
                      index={i}
                      scrollYProgress={scrollYProgress}
                      scatterX={t.x}
                      scatterY={t.y}
                      scatterRot={t.rot}
                      range={t.range as readonly [number, number]}
                      imageUrl={media.imageUrl}
                      placeholderGradient={copy.placeholderGradient}
                    />
                  ))}
                </motion.div>
              </>
            )}
          </div>

          {/* Text */}
          <motion.div
            style={{ opacity: textOpacity, y: textY }}
            className="lg:col-span-5"
          >
            <Eyebrow opacity={eyebrowOpacity}>{copy.label}</Eyebrow>
            <Headline primary={copy.title} accent={copy.titleAccent} />
            <p className="mt-6 text-base md:text-lg text-pacific-mid font-light max-w-md leading-relaxed">
              {copy.description}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ArchitectureTile({
  index,
  scrollYProgress,
  scatterX,
  scatterY,
  scatterRot,
  range,
  imageUrl,
  placeholderGradient,
}: {
  index: number;
  scrollYProgress: MotionValue<number>;
  scatterX: number;
  scatterY: number;
  scatterRot: number;
  range: readonly [number, number];
  imageUrl?: string;
  placeholderGradient: string;
}) {
  const x = useTransform(scrollYProgress, [range[0], range[1]], [scatterX, 0]);
  const y = useTransform(scrollYProgress, [range[0], range[1]], [scatterY, 0]);
  const rotate = useTransform(
    scrollYProgress,
    [range[0], range[1]],
    [scatterRot, 0]
  );
  const opacity = useTransform(
    scrollYProgress,
    [range[0], (range[0] + range[1]) / 2],
    [0, 1]
  );

  // Each tile shows the SAME source image, but with backgroundPosition
  // adjusted so it appears as the right "slice" of the full picture.
  // 3×3 grid → row 0..2, col 0..2.
  const row = Math.floor(index / 3);
  const col = index % 3;
  const bgPos = `${col * 50}% ${row * 50}%`;

  return (
    <motion.div
      style={{ x, y, rotate, opacity }}
      className="relative overflow-hidden bg-pacific-dark/40"
    >
      {imageUrl ? (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: "300% 300%",
            backgroundPosition: bgPos,
            backgroundRepeat: "no-repeat",
          }}
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: placeholderGradient,
            // Faint per-tile contrast so the grid is legible even
            // without a source image.
            opacity: 0.4 + (index % 2) * 0.25,
          }}
        />
      )}
    </motion.div>
  );
}

/* ================================================================== *
 *  04 · COMMERCIAL — Crossfade Cycle                                  *
 *  Sticky text panel on the left. Image area on the right cycles      *
 *  through N frames via opacity crossfade as scroll progresses.       *
 *                                                                    *
 *  Three rendering modes, picked in this order:                       *
 *    A) MULTI-FRAME — `media.frames` supplied from Sanity. Each       *
 *       frame is a separate slot with its own video/image and an     *
 *       optional sub-label that cycles in sync. Frame videos play    *
 *       only while their slot is the active one (opacity > 0.4),     *
 *       paused otherwise, so we never decode more than one clip      *
 *       at a time.                                                    *
 *    B) SINGLE VIDEO — `media.videoUrl` only. Plays full-frame, no    *
 *       cycle. Same as Kitchen/Bath behaviour.                        *
 *    C) LEGACY 4-FRAME CYCLE — neither set; falls back to a single    *
 *       image (or placeholder) cloned across 4 slots with subtle     *
 *       hue/brightness tints so the cycle still reads as "different  *
 *       scenes" before real assets land.                              *
 * ================================================================== */

const COMMERCIAL_LEGACY_LABELS = [
  "Hospitality",
  "Healthcare",
  "Retail",
  "Foodservice",
];

const COMMERCIAL_LEGACY_TINTS = [
  { hueRotate: "0deg", brightness: "1" },
  { hueRotate: "12deg", brightness: "0.95" },
  { hueRotate: "-8deg", brightness: "1.05" },
  { hueRotate: "20deg", brightness: "0.92" },
] as const;

/**
 * Compute a frame's opacity keyframes within the 0.15 → 0.85 active
 * region of the section's scroll. Each frame holds at full opacity
 * for the centre half of its segment, fades in over the leading
 * quarter, and fades out over the trailing quarter — except the
 * last frame, which holds at 1 until the section unpins.
 */
function commercialFrameKeyframes(
  index: number,
  total: number
): { keyframes: [number, number, number]; values: [number, number, number] } {
  const start = 0.15;
  const end = 0.85;
  const seg = (end - start) / total;
  const segStart = start + index * seg;
  const segEnd = segStart + seg;
  const fadeIn = segStart;
  const peak = segStart + seg * 0.3;
  const isLast = index === total - 1;
  const fadeOut = isLast ? end : segEnd;
  const tail = isLast ? 1 : 0;
  return {
    keyframes: [fadeIn, peak, fadeOut],
    values: [0, 1, tail],
  };
}

function CommercialSection({ media }: { media: SectionMedia }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const textOpacity = useTransform(scrollYProgress, [0.1, 0.35], [0, 1]);
  const textY = useTransform(scrollYProgress, [0.1, 0.35], [50, 0]);
  const eyebrowOpacity = useTransform(scrollYProgress, [0.1, 0.3], [0, 1]);

  const copy = SECTION_COPY.commercial;

  // Pick rendering mode. Multi-frame wins over single-video wins
  // over the 4-frame legacy fallback.
  const hasFrames = !!media.frames && media.frames.length > 0;
  const isSingleVideo = !hasFrames && !!media.videoUrl;

  // Build the array of frames the cycle iterates over. In mode A
  // these come from Sanity; in mode C we synthesise 4 clones of the
  // single source with the legacy hue tints + sub-labels so the
  // cycle still feels purposeful before real assets are uploaded.
  const cycleFrames: FrameMedia[] = hasFrames
    ? media.frames!
    : COMMERCIAL_LEGACY_LABELS.map((label) => ({
        label,
        videoUrl: undefined, // legacy fallback never plays video
        imageUrl: media.imageUrl,
      }));
  const total = cycleFrames.length;

  return (
    <section
      ref={ref}
      className="relative bg-[#0a1620]"
      style={{ minHeight: "240vh" }}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="h-full max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Text */}
          <motion.div
            style={{ opacity: textOpacity, y: textY }}
            className="lg:col-span-5"
          >
            <Eyebrow opacity={eyebrowOpacity}>{copy.label}</Eyebrow>
            <Headline primary={copy.title} accent={copy.titleAccent} />
            <p className="mt-6 text-base md:text-lg text-pacific-mid font-light max-w-md leading-relaxed">
              {copy.description}
            </p>

            {/* Cycling sub-labels — render only when there are
                frames to cycle through. In single-video mode there's
                nothing to label, so we omit the row entirely. */}
            {!isSingleVideo && (
              <div className="mt-10 h-6 relative">
                {cycleFrames.map((frame, i) => (
                  <CommercialFrameLabel
                    key={i}
                    scrollYProgress={scrollYProgress}
                    label={frame.label || COMMERCIAL_LEGACY_LABELS[i] || ""}
                    index={i}
                    total={total}
                  />
                ))}
              </div>
            )}
          </motion.div>

          {/* Media area */}
          <div className="lg:col-span-7 relative w-full aspect-[4/5] lg:aspect-[5/6] rounded-2xl overflow-hidden shadow-2xl">
            {isSingleVideo ? (
              <MediaSlot
                media={media}
                alt={`${copy.title} ${copy.titleAccent}`}
                placeholderGradient={copy.placeholderGradient}
                placeholderVariant="warm"
              />
            ) : (
              cycleFrames.map((frame, i) => (
                <CommercialFrameSlot
                  key={i}
                  scrollYProgress={scrollYProgress}
                  frame={frame}
                  index={i}
                  total={total}
                  copy={copy}
                  // Legacy-mode-only tint. Real frames render
                  // verbatim with no colour treatment.
                  legacyTint={
                    !hasFrames ? COMMERCIAL_LEGACY_TINTS[i] : undefined
                  }
                />
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * One slot in the Commercial cycle. Owns its own opacity motion
 * value (so hooks fire in a consistent order regardless of how
 * many frames are configured) and renders either video, image, or
 * placeholder per the supplied frame. Frame videos use
 * `OpacityGatedVideo` so they only play while their slot is the
 * active one — at most ~one video decoding at a time.
 */
function CommercialFrameSlot({
  scrollYProgress,
  frame,
  index,
  total,
  copy,
  legacyTint,
}: {
  scrollYProgress: MotionValue<number>;
  frame: FrameMedia;
  index: number;
  total: number;
  copy: SectionCopy;
  legacyTint?: { hueRotate: string; brightness: string };
}) {
  const { keyframes, values } = commercialFrameKeyframes(index, total);
  const opacity = useTransform(scrollYProgress, keyframes, values);

  const filter = legacyTint
    ? `hue-rotate(${legacyTint.hueRotate}) brightness(${legacyTint.brightness})`
    : undefined;

  return (
    <motion.div style={{ opacity, filter }} className="absolute inset-0">
      {frame.videoUrl ? (
        <OpacityGatedVideo
          src={frame.videoUrl}
          activity={opacity}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : frame.imageUrl ? (
        <Image
          src={frame.imageUrl}
          alt={frame.label ?? `${copy.title} ${copy.titleAccent}`}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 60vw"
        />
      ) : (
        <PlaceholderPanel gradient={copy.placeholderGradient} variant="warm" />
      )}
    </motion.div>
  );
}

/**
 * Sub-label cycler — same opacity keyframe math as the matching
 * frame slot, so the "Now: Hospitality" caption fades in and out in
 * lockstep with the visual it names.
 */
function CommercialFrameLabel({
  scrollYProgress,
  label,
  index,
  total,
}: {
  scrollYProgress: MotionValue<number>;
  label: string;
  index: number;
  total: number;
}) {
  const { keyframes, values } = commercialFrameKeyframes(index, total);
  const opacity = useTransform(scrollYProgress, keyframes, values);

  return (
    <motion.span
      style={{ opacity }}
      className="absolute inset-0 text-xs tracking-[0.3em] uppercase text-pacific-light/80"
    >
      Now: {label}
    </motion.span>
  );
}

/**
 * Video element whose play/pause state is gated by an opacity
 * motion value rather than viewport intersection. Used by the
 * Commercial cycle so multiple video frames can co-exist in the
 * same DOM region without all decoding simultaneously: only the
 * frame whose opacity is the active one (>0.4) plays, with a small
 * lower threshold (<0.15) for pausing so we don't flicker on the
 * fade-in/out boundary.
 *
 * Plays from the start each time it activates, then pauses on
 * deactivation — so scrolling back into view replays from frame 0.
 */
function OpacityGatedVideo({
  src,
  activity,
  className,
}: {
  src: string;
  activity: MotionValue<number>;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const playingRef = useRef(false);

  useMotionValueEvent(activity, "change", (latest) => {
    const el = ref.current;
    if (!el) return;
    if (latest > 0.4 && !playingRef.current) {
      playingRef.current = true;
      el.currentTime = 0;
      el.play().catch(() => {});
    } else if (latest < 0.15 && playingRef.current) {
      playingRef.current = false;
      el.pause();
    }
  });

  return (
    <video
      ref={ref}
      key={src}
      className={className}
      src={src}
      poster={
        src.startsWith("/videos/")
          ? src.replace(/\.mp4$/, "-poster.jpg")
          : undefined
      }
      muted
      playsInline
      preload="metadata"
      aria-hidden="true"
    />
  );
}

/* ------------------------------------------------------------------ *
 * Placeholder panel — used when a section's Sanity image is missing.  *
 * Reads as an intentional design choice (subtle texture, brand        *
 * navy bleed) rather than a broken/empty box.                         *
 * ------------------------------------------------------------------ */
function PlaceholderPanel({
  gradient,
  variant,
}: {
  gradient: string;
  variant: "warm" | "cool";
}) {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0" style={{ background: gradient }} />
      {/* Faint SVG noise so flat gradients don't look plasticky */}
      <div
        className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
      {/* Bottom scrim — ramps to brand navy so the panel feels of-a-piece
          with the surrounding section. Direction depends on warm/cool
          variant so the bleed feels right. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            variant === "warm"
              ? "linear-gradient(180deg, transparent 60%, rgba(10,22,32,0.55) 100%)"
              : "linear-gradient(180deg, transparent 50%, rgba(13,29,40,0.55) 100%)",
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Public composer                                                     *
 * ------------------------------------------------------------------ */
export function ApplicationsScrollSections({
  applications,
}: {
  applications?: SanityApplicationCard[];
}) {
  const resolveMedia = buildMediaResolver(applications);

  return (
    <>
      {/* Section header — single editorial intro before the four
          scroll sections kick in. Replaces the old grid's heading.
          id="sec-applications" + scroll-mt-20 anchors the homepage
          left-side section nav to the start of this block, with the
          margin offset clearing the fixed header. */}
      <section
        id="sec-applications"
        className="relative bg-[#0a1620] pt-20 md:pt-28 pb-8 md:pb-12 scroll-mt-20"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-12 flex flex-col lg:flex-row items-start justify-between gap-8">
          <div className="lg:max-w-lg">
            <div className="text-xs font-medium tracking-[0.25em] uppercase text-stone-500 mb-4">
              02 · Applications
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white leading-[1.08]">
              Wherever stone would normally be.
            </h2>
          </div>
          <p className="lg:max-w-md lg:pt-12 text-base font-light text-stone-400 leading-relaxed">
            Rated for residential and commercial use. Passes food-contact,
            low-emission, and fire safety standards in North America, the EU,
            and India.
          </p>
        </div>
      </section>

      <KitchenSection media={resolveMedia("kitchen")} />
      <BathSection media={resolveMedia("bath")} />
      <ArchitectureSection media={resolveMedia("architecture")} />
      <CommercialSection media={resolveMedia("commercial")} />
    </>
  );
}
