"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Clock, ArrowLeft } from "lucide-react";
import { PortableText } from "@portabletext/react";

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

export function BlogPostContent({ post }: { post: BlogPost }) {
  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-stone-50 border-b border-stone-100">
        <nav className="mx-auto max-w-3xl px-6 lg:px-8 py-4">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2 text-xs tracking-wide"
          >
            <Link
              href="/"
              className="text-stone-400 hover:text-stone-600 transition-colors"
            >
              Home
            </Link>
            <ChevronRight className="w-3 h-3 text-stone-300" />
            <Link
              href="/blog"
              className="text-stone-400 hover:text-stone-600 transition-colors"
            >
              Blog
            </Link>
            <ChevronRight className="w-3 h-3 text-stone-300" />
            <span className="text-stone-900 font-medium truncate max-w-[200px]">
              {post.title}
            </span>
          </motion.div>
        </nav>
      </div>

      <article className="mx-auto max-w-3xl px-6 lg:px-8 py-12 lg:py-20">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 text-xs text-stone-400 tracking-wide mb-5">
            {post.author && (
              <>
                <span className="text-stone-600 font-medium">{post.author}</span>
                <span className="w-1 h-1 bg-stone-300 rounded-full" />
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
                <span className="w-1 h-1 bg-stone-300 rounded-full" />
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {post.minutesToRead} min read
                </span>
              </>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-stone-900 leading-tight">
            {post.title}
          </h1>
        </motion.header>

        {/* Hero Image */}
        {post.mainImage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mb-12 aspect-[16/9] rounded-2xl overflow-hidden bg-stone-100"
          >
            <img
              src={post.mainImage}
              alt={post.title}
              className="h-full w-full object-cover"
            />
          </motion.div>
        )}

        {/* Body */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="prose prose-stone prose-lg max-w-none
            prose-headings:font-light prose-headings:tracking-tight
            prose-p:font-light prose-p:leading-relaxed prose-p:text-stone-600
            prose-a:text-stone-900 prose-a:underline prose-a:underline-offset-4
            prose-img:rounded-xl"
        >
          {post.body && <PortableText value={post.body} />}
        </motion.div>

        {/* Back link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-16 pt-8 border-t border-stone-100"
        >
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-900 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Journal
          </Link>
        </motion.div>
      </article>
    </>
  );
}
