import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import { allBlogPostsQuery } from "@/sanity/lib/queries";
import { BreadcrumbList } from "@/components/global/JsonLd";
import { BlogGrid, type BlogPost } from "@/components/sections/BlogGrid";
import { CompanyNav, Container, LABEL, LIGHT, ProClose } from "@/components/sections/professionals/ProKit";

/**
 * /blog, News: The Pacific Journal, rebuilt 2026-10-08 in the
 * Professionals pages' language (owner: the Corporate section to get the
 * same upgrade). A plain masthead, the company nav, the newest post as a
 * feature and every other post as a card (BlogGrid).
 */

export const metadata: Metadata = {
  title: "The Pacific Journal: News, Guides and Field Notes | Pacific Surfaces",
  description:
    "News, guides and field notes from Pacific Surfaces: trade shows, new collections, and how to choose and care for quartz, granite and stone surfaces.",
  alternates: { canonical: "/blog" },
};

export default async function BlogPage() {
  const posts: BlogPost[] = await client.fetch(allBlogPostsQuery);
  const lastUpdated =
    posts.length > 0
      ? new Date(posts[0].publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
      : null;

  return (
    <main data-light-page className="bg-white text-[#14140f]">
      <BreadcrumbList
        items={[
          { name: "Home", url: "/" },
          { name: "The Pacific Journal", url: "/blog" },
        ]}
      />

      <header className="bg-white pt-32 lg:pt-40">
        <Container className="grid gap-8 pb-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:pb-16">
          <div>
            <p className={LABEL}>Company · News</p>
            <h1 style={LIGHT} className="mt-5 text-[46px] uppercase leading-[0.95] tracking-[-0.03em] sm:text-7xl lg:text-[104px]">
              The Pacific Journal
            </h1>
          </div>
          <div>
            <p className="max-w-md text-[17px] font-light leading-relaxed">
              News, guides and field notes from Pacific Surfaces: trade shows and new collections, and how to choose and
              care for quartz, granite and stone.
            </p>
            <div className="mt-8 grid max-w-md grid-cols-2 border-t border-[#14140f]/20">
              <div className="pt-4">
                <p className="text-[11px] uppercase tracking-[0.14em] opacity-60">Articles</p>
                <p style={LIGHT} className="mt-1 text-[32px] leading-none">
                  {posts.length}
                </p>
              </div>
              {lastUpdated && (
                <div className="border-l border-[#14140f]/20 pl-6 pt-4">
                  <p className="text-[11px] uppercase tracking-[0.14em] opacity-60">Last update</p>
                  <p className="mt-2 text-[17px] font-light">{lastUpdated}</p>
                </div>
              )}
            </div>
          </div>
        </Container>
      </header>
      <CompanyNav current="blog" />

      <BlogGrid posts={posts} />

      <ProClose
        title="Talk to us about a project"
        body="Samples, quotes and specification help, from the team behind the journal."
        ctas={[
          { label: "Get in touch", href: "/contact#enquiry" },
          { label: "Our story", href: "/about" },
        ]}
        image="/images/spaces/hotels/lobby-bar.jpg"
      />
    </main>
  );
}
