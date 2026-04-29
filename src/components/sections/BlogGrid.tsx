"use client";

/**
 * BlogGrid — uniform editorial card grid for the /blog index.
 *
 * Replaces the previous "featured post + smaller grid" pattern with
 * a single uniform 4-column grid where every post is rendered as
 * the same card shape. This matches the SS1 reference layout and
 * reads as more "magazine archive" than "newsroom hero."
 *
 * Card design (mapped to Pacific palette):
 *   - White card surface on the cream page background, subtle
 *     shadow on hover.
 *   - Image sits at the top of the card with aspect-[4/5] —
 *     intentionally portrait-leaning so the grid feels like an
 *     editorial gallery rather than a sea of landscape thumbs.
 *   - Title in navy (#112732), excerpt in stone-grey, date and
 *     reading time in tracked-out small caps as a meta line at the
 *     top of the text block.
 *   - Subtle scale-105 zoom on the image during hover, matching
 *     the convention used elsewhere (Signature Projects card).
 */

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
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

  return (
    <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 items-stretch">
      {posts.map((post) => (
        <StaggerItem key={post._id} className="h-full">
          <BlogCard post={post} />
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}

function BlogCard({ post }: { post: BlogPost }) {
  return (
    // Outer wrapper owns the `group` + relative position. The
    // tooltip below positions absolutely against this wrapper, so
    // it floats over neighbouring cards without affecting grid
    // layout. The wrapper also has h-full so it participates in
    // the row's items-stretch sizing.
    <div className="group relative h-full">
      <Link
        href={`/blog/${post.slug.current}`}
        // Native browser tooltip — screen readers also pick this
        // up, so the full title is accessible to keyboard / a11y
        // users in addition to the custom overlay below.
        title={post.title}
        className="block bg-white rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(17,39,50,0.06)] hover:shadow-[0_8px_30px_rgba(17,39,50,0.10)] transition-shadow duration-500 h-full flex flex-col"
      >
        {/* Image */}
        <div className="aspect-[4/5] bg-stone-100 overflow-hidden">
          {post.mainImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.mainImage}
              alt={post.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-stone-200 to-stone-300" />
          )}
        </div>

        {/* Text block — flex-1 so it fills the remaining card height
          when titles are short, keeping cards same total height. */}
        <div className="p-5 lg:p-6 flex-1 flex flex-col">
          <div className="flex items-center gap-3 text-[10px] tracking-[0.2em] uppercase text-stone-500 mb-3">
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </time>
            {post.minutesToRead && (
              <>
                <span className="w-0.5 h-0.5 bg-stone-400 rounded-full" />
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  {post.minutesToRead} min
                </span>
              </>
            )}
          </div>
          {/* line-clamp-2 keeps every card the same height. On hover,
            the floating tooltip overlay below shows the full title —
            no inline layout shift. */}
          <h3 className="text-base lg:text-lg font-medium text-[#112732] leading-snug group-hover:text-[#0a1620] transition-colors line-clamp-2">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="mt-3 text-sm font-light text-stone-600 leading-relaxed line-clamp-2">
              {post.excerpt}
            </p>
          )}
        </div>
      </Link>

      {/* Custom tooltip removed — the native browser tooltip from
          the `title` attribute on the Link above is enough. It
          appears beside the cursor, follows it, and matches what
          the user expects from a normal hover preview. */}
    </div>
  );
}
