import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { BlogPost } from "@/components/sections/BlogGrid";

/**
 * Articles from the journal as a row of cards just above the footer
 * (owner, 2026-10-20, after a tile maker's "Our Recent Blogs" strip): the
 * photograph, a small label and the title beneath it, then a link to the
 * whole journal. The homepage picks posts whose photographs carry no
 * headline text of their own.
 */
export function RecentArticles({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) return null;
  return (
    <section data-light-page className="bg-white text-[#14140f]">
      <div className="mx-auto max-w-[1440px] px-6 py-20 sm:px-10 lg:px-14 lg:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] opacity-60">The Pacific Journal</p>
          <h2
            className="mt-4 text-[34px] uppercase leading-[1.02] sm:text-[44px] lg:text-[56px]"
            style={{ fontVariationSettings: "'wght' 250, 'wdth' 100", letterSpacing: "-0.03em" }}
          >
            Recent articles
          </h2>
          <p className="mt-5 text-[15px] font-light leading-relaxed opacity-75">
            Design ideas, material guides and news from Pacific Surfaces, to help you choose and care for quartz,
            granite and stone.
          </p>
        </div>

        <ul className="mt-14 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <li key={post._id}>
              <Link href={`/blog/${post.slug.current}`} className="group/post block">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#E4E1DB]">
                  {post.mainImage && (
                    <Image
                      src={post.mainImage}
                      alt={post.title}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 group-hover/post:scale-[1.03]"
                    />
                  )}
                </div>
                <p className="mt-5 text-center text-[11px] font-medium uppercase tracking-[0.22em] opacity-60">
                  Article
                </p>
                <h3 className="mt-2 text-center text-[18px] leading-snug group-hover/post:underline group-hover/post:underline-offset-4">
                  {post.title}
                </h3>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-14 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 border-b border-[#14140f] pb-0.5 text-[12px] uppercase tracking-[0.14em]"
          >
            <span>Read more articles</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
