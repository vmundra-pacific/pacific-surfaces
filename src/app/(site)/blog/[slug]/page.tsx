import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { client } from "@/sanity/lib/client";
import { blogPostBySlugQuery } from "@/sanity/lib/queries";
import { BlogPostContent } from "@/components/sections/BlogPostContent";
import { BreadcrumbList, ArticleSchema } from "@/components/global/JsonLd";

interface Props {
  params: Promise<{ slug: string }>;
}

type Block = { _type?: string; children?: { text?: string }[] };

/** The post's own opening words, for a post with no SEO description or
 *  excerpt in Sanity: about 155 characters, cut at a word. */
function openingWords(body: unknown, max = 155): string | undefined {
  if (!Array.isArray(body)) return undefined;
  const text = (body as Block[])
    .filter((b) => b?._type === "block")
    .map((b) => (b.children ?? []).map((c) => c.text ?? "").join(""))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return undefined;
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:.\s]+$/, "")}…`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await client.fetch(blogPostBySlugQuery, { slug });
  if (!post) return { title: "Post Not Found" };

  return {
    title: post.seoTitle || `${post.title} — Pacific Surfaces Blog`,
    description: post.seoDescription || post.excerpt || openingWords(post.body),
    alternates: { canonical: `/blog/${slug}` },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await client.fetch(blogPostBySlugQuery, { slug });

  if (!post) notFound();

  return (
    <>
      <BreadcrumbList
        items={[
          { name: "Home", url: "/" },
          { name: "Blog", url: "/blog" },
          { name: post.title, url: `/blog/${slug}` },
        ]}
      />
      <ArticleSchema
        headline={post.title}
        image={post.mainImage}
        datePublished={post.publishedAt}
        dateModified={post._updatedAt ?? post.publishedAt}
        authorName={post.author?.name ?? undefined}
        url={`/blog/${slug}`}
        description={post.seoDescription || post.excerpt}
      />
      <BlogPostContent post={post} />
    </>
  );
}
