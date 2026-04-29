import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import { allBlogPostsQuery } from "@/sanity/lib/queries";
import { BlogGrid } from "@/components/sections/BlogGrid";

export const metadata: Metadata = {
  title: "Field Notes — Pacific Surfaces",
  description:
    "Quartz & stone — guides, news, and industry insight from the Pacific Surfaces editorial team.",
};

/**
 * /blog — the editorial index.
 *
 * Layout:
 *   1. Slim full-width dark-navy ribbon at the top with the
 *      site-wide editorial tagline (the brand stamp on every blog
 *      page — same ribbon repeats on the post detail page).
 *   2. Cream body surface (#f4efe8) with a serif-feel "Field Notes"
 *      title in dark navy, set against the cream for editorial
 *      contrast. Optional intro paragraph below.
 *   3. Uniform 4-column card grid, every post the same shape (no
 *      featured post). Card design lives in BlogGrid.tsx.
 *
 * Every card is fully Sanity-driven — each card on this index
 * comes from a `blogPost` document in Sanity Studio. Edit the
 * document → card updates. The body field of each post is Portable
 * Text, so editors can compose paragraphs, headings, and inline
 * images in any combination.
 */
export default async function BlogPage() {
  const posts = await client.fetch(allBlogPostsQuery);

  return (
    // Top padding pushes the ribbon below the site's `fixed top-0`
    // navbar (Header.tsx) so the two don't overlap. The header
    // averages ~72px tall depending on viewport — pt-20 leaves a
    // comfortable buffer at every breakpoint.
    <div className="pt-20">
      {/* Dark-navy ribbon — full-width, slim. Tracked-out caps,
          editorial stamp. Same ribbon also appears on each post's
          breadcrumb bar so brand continuity carries across the
          two views. */}
      <div className="bg-[#112732] py-3 lg:py-4">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <p className="text-[11px] md:text-xs font-medium tracking-[0.3em] uppercase text-pacific-light">
            Quartz &amp; Stone · Field Notes &amp; Industry Insight
          </p>
        </div>
      </div>

      {/* Cream body */}
      <div className="bg-[#f4efe8] min-h-screen">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 lg:py-24">
          {/* Editorial title */}
          <header className="max-w-3xl mb-14 lg:mb-20">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-[#112732] leading-[1.05]">
              Field Notes
            </h1>
            <p className="mt-6 text-base lg:text-lg font-light text-stone-600 leading-relaxed max-w-xl">
              Trends, guides, and stories from the world of premium surfaces —
              new entries from the Pacific editorial team.
            </p>
          </header>

          {/* Card grid — every card driven by a Sanity blogPost
              document. Add / edit / publish from /studio →
              Blog Posts. */}
          <BlogGrid posts={posts} />
        </div>
      </div>
    </div>
  );
}
