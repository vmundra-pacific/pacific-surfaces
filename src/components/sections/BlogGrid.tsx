"use client";

/**
 * BlogGrid — editorial layout for the /blog index, image-first.
 *
 * Both card variants (Featured cover story + Standard archive cards)
 * are full-bleed photos with the text overlaid at the bottom over a
 * dark gradient scrim. Reads like an editorial photo feature where
 * the image carries the page; the title is the caption underneath.
 *
 * Card shapes:
 *   - Featured: 16/8 horizontal hero, full row width.
 *   - Standard: 4/5 portrait, three across at lg+, two at sm, one
 *     on phone.
 *
 * Hover: image scales 1.04, the bottom scrim deepens slightly, and
 * the read-arrow nudges right.
 */

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, ArrowRight } from "lucide-react";
import { sanityImg } from "@/lib/sanity-img";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/animated-section";

interface BlogPost {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt?: string;
  mainImage?: string;
  publishedAt: string;
  minutesToRead?: number;
}

export function BlogGrid({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) {
    return (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-stone-500 py-24 text-center text-lg font-light"
      >
        Field notes are being written. Check back soon.
      </motion.p>
    );
  }

  // Posts are sorted by publishedAt desc by the GROQ query.
  // The first post takes the featured cover-story slot; the rest
  // fill the standard grid below.
  const [featured, ...rest] = posts;

  return (
    <div className="space-y-12 lg:space-y-16">
      <FeaturedCard post={featured} />

      {rest.length > 0 && (
        <>
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-[#112732]/15" />
            <span className="text-[11px] tracking-[0.28em] uppercase text-stone-500 font-medium">
              More Field Notes
            </span>
            <div className="h-px flex-1 bg-[#112732]/15" />
          </div>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {rest.map((post) => (
              <StaggerItem key={post._id} className="h-full">
                <StandardCard post={post} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </>
      )}
    </div>
  );
}

/* ================================================================== *
 *  Featured cover-story card — full-bleed photo, text bottom-left.    *
 * ================================================================== */

function FeaturedCard({ post }: { post: BlogPost }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
    >
      <Link
        href={`/blog/${post.slug.current}`}
        title={post.title}
        // Featured aspect ratio: cinematic 16/8 on desktop, square-ish
        // 4/3 on mobile so the headline doesn't get cramped on narrow
        // screens. shadow lifts on hover; image zooms via inner span.
        className="group relative block aspect-[4/3] sm:aspect-[16/9] lg:aspect-[16/8] rounded-2xl overflow-hidden bg-stone-900 shadow-[0_1px_3px_rgba(17,39,50,0.08)] hover:shadow-[0_16px_50px_rgba(17,39,50,0.18)] transition-shadow duration-500"
      >
        {/* Image fills the entire card */}
        {post.mainImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={sanityImg(post.mainImage, { w: 1200 }) ?? post.mainImage}
            alt={post.title}
            loading="eager"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-stone-300 to-stone-500" />
        )}

        {/* Bottom gradient scrim — keeps text legible against any
            frame of the photo. Slightly deeper at the bottom edge
            where the text sits, fading out by the upper third. */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

        {/* Top-left "Featured Note" stamp — sits in the lit half of
            the gradient with a subtle scrim under it. */}
        <div className="absolute top-6 left-6 lg:top-8 lg:left-10">
          <span className="inline-block text-[10px] tracking-[0.28em] uppercase text-white/90 font-medium px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15">
            Featured Note
          </span>
        </div>

        {/* Bottom-left content — title + meta + read affordance */}
        <div className="absolute inset-x-0 bottom-0 p-6 lg:p-10 max-w-3xl">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-light tracking-tight text-white leading-[1.1] mb-4 lg:mb-5">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="hidden sm:block text-sm lg:text-base font-light text-white/80 leading-relaxed mb-5 lg:mb-6 line-clamp-2 max-w-2xl">
              {post.excerpt}
            </p>
          )}
          <div className="flex items-center gap-4 text-[10px] tracking-[0.22em] uppercase text-white/70 font-medium">
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </time>
            {post.minutesToRead && (
              <>
                <span className="w-1 h-1 bg-white/40 rounded-full" />
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  {post.minutesToRead} min read
                </span>
              </>
            )}
            <span className="w-1 h-1 bg-white/40 rounded-full" />
            <span className="inline-flex items-center gap-1.5 group-hover:gap-2 transition-all">
              Read note
              <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ================================================================== *
 *  Standard card — full-bleed portrait photo with text overlay.       *
 * ================================================================== */

function StandardCard({ post }: { post: BlogPost }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="group relative h-full"
    >
      <Link
        href={`/blog/${post.slug.current}`}
        title={post.title}
        // 4/5 portrait — same as the previous design but the image
        // now occupies the full card instead of a top thumbnail.
        // bg-stone-900 fallback so the gradient scrim has something
        // to mix into when the image is still loading.
        className="relative block aspect-[4/5] rounded-2xl overflow-hidden bg-stone-900 shadow-[0_1px_3px_rgba(17,39,50,0.06)] hover:shadow-[0_12px_40px_rgba(17,39,50,0.14)] transition-shadow duration-500 h-full"
      >
        {post.mainImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={sanityImg(post.mainImage, { w: 1200 }) ?? post.mainImage}
            alt={post.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-stone-300 to-stone-500" />
        )}

        {/* Gradient scrim — taller and softer than the featured one
            because the portrait card needs more reading area at the
            bottom for a longer title. */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

        {/* Bottom-aligned text */}
        <div className="absolute inset-x-0 bottom-0 p-5 lg:p-6">
          <div className="flex items-center gap-3 text-[10px] tracking-[0.22em] uppercase text-white/75 mb-3 font-medium">
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </time>
            {post.minutesToRead && (
              <>
                <span className="w-1 h-1 bg-white/40 rounded-full" />
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  {post.minutesToRead} min
                </span>
              </>
            )}
          </div>
          <h3 className="text-base sm:text-lg lg:text-xl font-medium text-white leading-snug line-clamp-3 mb-3 tracking-tight">
            {post.title}
          </h3>
          {/* Read affordance pinned at the bottom — small arrow
              that nudges right on hover. Excerpt is omitted from the
              standard card since the title takes prominence over the
              image. */}
          <span className="inline-flex items-center gap-1.5 text-[10px] font-medium tracking-[0.22em] uppercase text-white/85 group-hover:text-white group-hover:gap-2 transition-all">
            Read
            <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
