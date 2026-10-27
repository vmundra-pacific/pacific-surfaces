import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { client } from "@/sanity/lib/client";
import { blogPostBySlugQuery } from "@/sanity/lib/queries";
import { BlogPostContent } from "@/components/sections/BlogPostContent";
import { BreadcrumbList, ArticleSchema } from "@/components/global/JsonLd";
import { clipAtWord, plainText, type PortableBlock } from "@/lib/portable-text";

interface Props {
  params: Promise<{ slug: string }>;
}

// Cached like the product pages: built ahead for every post and
// refreshed at most once a minute. Without generateStaticParams the
// route rendered on every visit (a function call in iad1 and a Sanity
// query each time); a post published later is built on its first visit.
export const revalidate = 60;

export async function generateStaticParams() {
  const slugs: string[] = await client.fetch(
    `*[_type == "blogPost" && defined(slug.current)].slug.current`
  );
  return slugs.map((slug) => ({ slug }));
}

/** The post's own opening words, for a post with no SEO description or
 *  excerpt in Sanity: about 155 characters, cut at a word. */
function openingWords(body: unknown, max = 155): string | undefined {
  if (!Array.isArray(body)) return undefined;
  const text = plainText(body as PortableBlock[]);
  return text ? clipAtWord(text, max) : undefined;
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
      {/* author is a plain string in Sanity (schemas/blogPost.ts), the
          same byline BlogPostContent prints. */}
      <ArticleSchema
        type="BlogPosting"
        headline={post.title}
        image={post.mainImage}
        datePublished={post.publishedAt}
        dateModified={post._updatedAt ?? post.publishedAt}
        authorName={
          typeof post.author === "string"
            ? post.author.trim() || undefined
            : undefined
        }
        url={`/blog/${slug}`}
        description={post.seoDescription || post.excerpt}
      />
      <BlogPostContent post={post} />
    </>
  );
}
