import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { client } from "@/sanity/lib/client";
import { blogPostBySlugQuery } from "@/sanity/lib/queries";
import { PortableText } from "@portabletext/react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await client.fetch(blogPostBySlugQuery, { slug });
  if (!post) return { title: "Post Not Found" };

  return {
    title: post.seoTitle || `${post.title} — Pacific Surfaces Blog`,
    description: post.seoDescription || post.excerpt,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await client.fetch(blogPostBySlugQuery, { slug });

  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <nav className="mb-8 text-sm text-gray-500">
        <Link href="/" className="hover:text-gray-700">Home</Link>
        {" / "}
        <Link href="/blog" className="hover:text-gray-700">Blog</Link>
        {" / "}
        <span className="text-gray-900">{post.title}</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          {post.title}
        </h1>
        <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
          {post.author && <span>By {post.author}</span>}
          <time dateTime={post.publishedAt}>
            {new Date(post.publishedAt).toLocaleDateString("en-IN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          {post.minutesToRead && <span>{post.minutesToRead} min read</span>}
        </div>
      </header>

      {post.mainImage && (
        <div className="mb-8 aspect-video rounded-lg overflow-hidden">
          <img
            src={post.mainImage}
            alt={post.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="prose prose-gray max-w-none">
        {post.body && <PortableText value={post.body} />}
      </div>
    </article>
  );
}
