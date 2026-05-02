"use client";

/**
 * BlogPostContent — single blog post detail page.
 *
 * Re-toned from the previous dark-navy design to a cream editorial
 * surface that matches the redesigned /blog index. Reasoning:
 * editorial long-form reads better on a light surface, and clicking
 * through from the cream index to a dark post page would be jarring.
 * Brand continuity is preserved by the dark-navy ribbon at the top
 * and the navy heading typography on cream.
 *
 * Inline images
 * -------------
 * The Sanity blogPost schema's `body` field already accepts
 * `{ type: "image" }` blocks alongside `{ type: "block" }` text — so
 * editors can drop images between paragraphs. The default
 * PortableText renderer doesn't know how to render those image
 * blocks, so we provide a custom `components.types.image` that
 * runs each image through `urlForImage`, emits a styled
 * `<figure>` with optional `<figcaption>` from the caption field,
 * and breathes vertical space around it.
 */

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronRight, Clock, ArrowLeft } from "lucide-react";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { urlForImage } from "@/sanity/lib/image";
import type { Image as SanityImage } from "sanity";

interface BlogPost {
  _id: string;
  title: string;
  slug: { current: string };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any[];
  excerpt?: string;
  mainImage?: string;
  publishedAt: string;
  minutesToRead?: number;
  author?: string;
}

/**
 * Custom PortableText renderer overrides. The default renderer
 * already handles `block` types (paragraphs, headings, marks);
 * we extend it with `types.image` so editor-supplied inline images
 * render as proper styled figures with optional captions.
 *
 * The wrapping figure adds generous vertical breathing room
 * (my-12) so images feel like a deliberate beat in the reading
 * rhythm rather than crammed in. A subtle border-radius matches the
 * card aesthetic of the index.
 */
const portableTextComponents: PortableTextComponents = {
  types: {
    image: ({
      value,
    }: {
      value: SanityImage & { alt?: string; caption?: string };
    }) => {
      if (!value?.asset) return null;
      const url = urlForImage(value).width(1400).url();
      return (
        <figure className="my-12">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={value.alt ?? ""}
            loading="lazy"
            decoding="async"
            className="w-full h-auto rounded-2xl shadow-sm"
          />
          {value.caption && (
            <figcaption className="mt-4 text-sm text-stone-500 italic text-center font-light">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
  },
};

export function BlogPostContent({ post }: { post: BlogPost }) {
  return (
    // pt-20 pushes the breadcrumb ribbon below the site's fixed
    // top-0 h-20 navbar so the breadcrumb / post title don't render
    // underneath it. Same offset the blog index uses.
    <div className="pt-20">
      {/* Dark navy ribbon at the top — same brand stamp as the
          /blog index, keeps brand continuity even though the body
          surface below is cream. */}
      <div className="bg-[#112732]">
        <nav className="mx-auto max-w-3xl px-6 lg:px-8 py-4">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2 text-xs tracking-wide"
          >
            <Link
              href="/"
              className="text-pacific-mid/80 hover:text-white transition-colors"
            >
              Home
            </Link>
            <ChevronRight className="w-3 h-3 text-white/30" />
            <Link
              href="/blog"
              className="text-pacific-mid/80 hover:text-white transition-colors"
            >
              Field Notes
            </Link>
            <ChevronRight className="w-3 h-3 text-white/30" />
            <span className="text-white font-medium truncate max-w-[200px]">
              {post.title}
            </span>
          </motion.div>
        </nav>
      </div>

      {/* Article body — cream surface, navy headings, stone-grey
          body text. */}
      <article className="bg-[#f4efe8] mx-auto max-w-full">
        <div className="mx-auto max-w-3xl px-6 lg:px-8 py-16 lg:py-24">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
            className="mb-10"
          >
            <div className="flex items-center gap-3 text-xs text-stone-500 tracking-wide mb-5">
              {post.author && (
                <>
                  <span className="text-[#112732] font-medium">
                    {post.author}
                  </span>
                  <span className="w-1 h-1 bg-stone-400 rounded-full" />
                </>
              )}
              <time dateTime={post.publishedAt}>
                {new Date(post.publishedAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              {post.minutesToRead && (
                <>
                  <span className="w-1 h-1 bg-stone-400 rounded-full" />
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {post.minutesToRead} min read
                  </span>
                </>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-[#112732] leading-[1.15]">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="mt-6 text-lg font-light text-stone-600 leading-relaxed">
                {post.excerpt}
              </p>
            )}
          </motion.header>

          {/* Hero Image */}
          {post.mainImage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mb-12 aspect-[16/9] rounded-2xl overflow-hidden bg-stone-200"
            >
              <Image
                src={post.mainImage}
                alt={post.title}
                width={1400}
                height={787}
                className="h-full w-full object-cover"
                priority
              />
            </motion.div>
          )}

          {/* Body — Tailwind Typography prose plugin tone-mapped
              to Pacific palette. prose-strong: navy. prose-a:
              navy with underline. prose-img: rounded (caught by
              the custom image renderer above for inline assets,
              this is fallback for any direct <img> in body). */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="prose prose-lg max-w-none
            prose-headings:font-light prose-headings:tracking-tight prose-headings:text-[#112732]
            prose-p:font-light prose-p:leading-relaxed prose-p:text-stone-700
            prose-a:text-[#112732] prose-a:underline prose-a:underline-offset-4 hover:prose-a:text-[#0a1620]
            prose-strong:text-[#112732] prose-strong:font-medium
            prose-blockquote:border-l-4 prose-blockquote:border-[#112732]/40 prose-blockquote:text-stone-600 prose-blockquote:not-italic
            prose-img:rounded-2xl"
          >
            {post.body && (
              <PortableText
                value={post.body}
                components={portableTextComponents}
              />
            )}
          </motion.div>

          {/* Back link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-16 pt-8 border-t border-[#112732]/10"
          >
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-[#112732] hover:text-[#0a1620] transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Field Notes
            </Link>
          </motion.div>
        </div>
      </article>
    </div>
  );
}
