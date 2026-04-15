import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import { allBlogPostsQuery } from "@/sanity/lib/queries";
import { PageHeader } from "@/components/ui/page-header";
import { BlogGrid } from "@/components/sections/BlogGrid";

export const metadata: Metadata = {
  title: "Blog — Pacific Surfaces",
  description:
    "Insights, trends, and guides on premium quartz and granite surfaces for modern interiors.",
};

export default async function BlogPage() {
  const posts = await client.fetch(allBlogPostsQuery);

  return (
    <>
      <PageHeader
        badge="Journal"
        title="Ideas & Inspiration"
        description="Trends, guides, and stories from the world of premium surfaces."
      />
      <section className="mx-auto max-w-7xl px-6 lg:px-8 py-16 lg:py-24">
        <BlogGrid posts={posts} />
      </section>
    </>
  );
}
