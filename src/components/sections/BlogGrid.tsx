"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";

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
        className="text-stone-400 py-24 text-center text-lg font-light"
      >
        Blog posts are being written. Check back soon.
      </motion.p>
    );
  }

  // First post = featured
  const [featured, ...rest] = posts;

  return (
    <div>
      {/* Featured post */}
      {featured && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
          className="mb-16"
        >
          <Link
            href={`/blog/${featured.slug.current}`}
            className="group grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
          >
            {featured.mainImage && (
              <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-stone-100">
                <img
                  src={featured.mainImage}
                  alt={featured.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            )}
            <div className="lg:pl-4">
              <div className="flex items-center gap-3 text-xs text-stone-400 tracking-wide mb-4">
                <time dateTime={featured.publishedAt}>
                  {new Date(featured.publishedAt).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
                {featured.minutesToRead && (
                  <>
                    <span className="w-1 h-1 bg-stone-300 rounded-full" />
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {featured.minutesToRead} min read
                    </span>
                  </>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-stone-900 group-hover:text-stone-600 transition-colors">
                {featured.title}
              </h2>
              {featured.excerpt && (
                <p className="mt-4 text-stone-500 font-light leading-relaxed line-clamp-3">
                  {featured.excerpt}
                </p>
              )}
              <span className="inline-flex items-center gap-2 mt-6 text-sm font-medium text-stone-900 group-hover:gap-3 transition-all">
                Read Article
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </Link>
        </motion.div>
      )}

      {/* Grid */}
      {rest.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
          {rest.map((post, index) => (
            <motion.div
              key={post._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.5,
                delay: (index % 3) * 0.1,
                ease: [0.25, 0.4, 0.25, 1],
              }}
            >
              <Link
                href={`/blog/${post.slug.current}`}
                className="group block"
              >
                {post.mainImage && (
                  <div className="aspect-[16/10] rounded-xl overflow-hidden bg-stone-100 mb-5">
                    <img
                      src={post.mainImage}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="flex items-center gap-3 text-xs text-stone-400 tracking-wide mb-3">
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
                      <span>{post.minutesToRead} min</span>
                    </>
                  )}
                </div>
                <h3 className="text-base font-medium text-stone-900 group-hover:text-stone-600 transition-colors leading-snug">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="mt-2 text-sm text-stone-500 font-light line-clamp-2">
                    {post.excerpt}
                  </p>
                )}
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
