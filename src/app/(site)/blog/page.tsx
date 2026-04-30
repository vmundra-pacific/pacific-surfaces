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
 * /blog — the editorial index, revamped.
 *
 * Layout from top to bottom:
 *
 *   1. Slim navy ribbon (brand stamp; same ribbon repeats on the
 *      blog post detail page so the two views feel like the same
 *      magazine).
 *
 *   2. Cream editorial masthead. Three-column header layout on
 *      desktop:
 *        - Left:  oversized "Field Notes" wordmark in dark navy.
 *        - Right: tracked-out small caps eyebrow + a short
 *                introduction paragraph + the issue meta (count
 *                of articles, last updated). Reads like the
 *                colophon on a print magazine cover.
 *      The header sits above a thin hairline rule that visually
 *      anchors the body grid below.
 *
 *   3. BlogGrid renders a featured cover-story card for the most
 *      recent post, then a 3-column uniform grid for the rest.
 *      Section divider between the two sections so the magazine
 *      hierarchy is unambiguous.
 */

export default async function BlogPage() {
  const posts = await client.fetch(allBlogPostsQuery);
  const totalCount = posts.length;
  const lastUpdated =
    posts.length > 0
      ? new Date(posts[0].publishedAt).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : null;

  return (
    // pt-20 clears the site's fixed top-0 navbar so the navy ribbon
    // doesn't slide under it.
    <div className="pt-20">
      {/* Brand stamp ribbon — slim, dark, full-width. */}
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
          {/* Editorial masthead — three-column header on desktop:
              wordmark left, copy + colophon right. Stacks on mobile. */}
          <header className="mb-14 lg:mb-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start lg:items-end">
              {/* Wordmark — left column on desktop */}
              <div className="lg:col-span-7">
                <p className="text-[11px] sm:text-xs font-medium tracking-[0.32em] uppercase text-stone-500 mb-4 lg:mb-6">
                  The Pacific Journal · Issue {String(totalCount).padStart(2, "0")}
                </p>
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light tracking-tight text-[#112732] leading-[0.95]">
                  Field
                  <br />
                  <em className="not-italic text-stone-500">Notes</em>
                </h1>
              </div>

              {/* Colophon — right column on desktop */}
              <div className="lg:col-span-5 lg:pb-3">
                <p className="text-base lg:text-lg font-light text-stone-600 leading-relaxed mb-8 max-w-md">
                  Trends, guides, and stories from the world of premium
                  surfaces — new entries from the Pacific editorial team.
                </p>
                <dl className="grid grid-cols-2 gap-6 max-w-md text-sm">
                  <div>
                    <dt className="text-[10px] tracking-[0.28em] uppercase text-stone-500 font-medium mb-1">
                      Articles
                    </dt>
                    <dd className="text-2xl font-light text-[#112732] tracking-tight">
                      {totalCount.toString().padStart(2, "0")}
                    </dd>
                  </div>
                  {lastUpdated && (
                    <div>
                      <dt className="text-[10px] tracking-[0.28em] uppercase text-stone-500 font-medium mb-1">
                        Last Update
                      </dt>
                      <dd className="text-sm font-light text-[#112732] tracking-tight pt-1.5">
                        {lastUpdated}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {/* Hairline rule anchoring the masthead to the body */}
            <div className="mt-12 lg:mt-16 h-px bg-[#112732]/15" />
          </header>

          {/* Featured cover-story card + uniform 3-column grid below */}
          <BlogGrid posts={posts} />
        </div>
      </div>
    </div>
  );
}
