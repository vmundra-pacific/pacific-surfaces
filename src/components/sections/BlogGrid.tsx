import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container, LABEL, LIGHT } from "@/components/sections/professionals/ProKit";

/**
 * BlogGrid: the /blog index, rebuilt 2026-10-08 with the Professionals
 * pages' language (owner: the Corporate section to get the same upgrade).
 * The text no longer sits on the photographs, where light images made
 * titles unreadable: the newest post is a feature with the picture beside
 * the copy, the rest are cards with the picture above. No scroll-in
 * animation, so every card is in the HTML and visible at once.
 */

export interface BlogPost {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt?: string;
  mainImage?: string;
  publishedAt: string;
  minutesToRead?: number;
}

const dateOf = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

function Meta({ post }: { post: BlogPost }) {
  return (
    <p className="text-[12px] uppercase tracking-[0.12em] opacity-60">
      <time dateTime={post.publishedAt}>{dateOf(post.publishedAt)}</time>
      {post.minutesToRead ? ` · ${post.minutesToRead} min read` : ""}
    </p>
  );
}

export function BlogGrid({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) {
    return (
      <Container className="py-24">
        <p className="text-[17px] font-light">New articles are on their way.</p>
      </Container>
    );
  }
  const [featured, ...rest] = posts;

  return (
    <>
      {/* The newest post. */}
      <section className="bg-white">
        <Container className="py-14 lg:py-20">
          <Link
            href={`/blog/${featured.slug.current}`}
            className="group/post grid items-center gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16"
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#E4E1DB]">
              {featured.mainImage && (
                <Image
                  src={featured.mainImage}
                  alt={featured.title}
                  fill
                  priority
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover/post:scale-[1.02]"
                />
              )}
            </div>
            <div>
              <p className={LABEL}>Latest</p>
              <div className="mt-4">
                <Meta post={featured} />
              </div>
              <h2 style={LIGHT} className="mt-4 text-[30px] uppercase leading-[1.05] tracking-[-0.02em] sm:text-4xl lg:text-[44px]">
                {featured.title}
              </h2>
              {featured.excerpt && <p className="mt-5 text-[17px] font-light leading-relaxed opacity-80">{featured.excerpt}</p>}
              <span className="mt-7 inline-flex items-center gap-2 border-b border-[#14140f] pb-0.5 text-[12px] uppercase tracking-[0.12em]">
                Read the article
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </div>
          </Link>
        </Container>
      </section>

      {/* Everything else, newest first. */}
      {rest.length > 0 && (
        <section className="bg-[#EFEDE9]">
          <Container className="py-16 lg:py-24">
            <p className={LABEL}>More from the journal</p>
            <h2 style={LIGHT} className="mt-4 text-[30px] uppercase leading-[1.05] tracking-[-0.02em] sm:text-4xl lg:text-[48px]">
              All articles
            </h2>
            <ul className="mt-12 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((post) => (
                <li key={post._id}>
                  <Link href={`/blog/${post.slug.current}`} className="group/post block">
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#E4E1DB]">
                      {post.mainImage && (
                        <Image
                          src={post.mainImage}
                          alt={post.title}
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover transition-transform duration-700 group-hover/post:scale-[1.03]"
                        />
                      )}
                    </div>
                    <div className="mt-5">
                      <Meta post={post} />
                    </div>
                    <h3 className="mt-3 text-[19px] leading-snug group-hover/post:underline group-hover/post:underline-offset-4">
                      {post.title}
                    </h3>
                    {post.excerpt && <p className="mt-2 line-clamp-3 text-[15px] font-light leading-relaxed opacity-80">{post.excerpt}</p>}
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}
    </>
  );
}
