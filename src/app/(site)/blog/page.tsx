import type { Metadata } from "next";
import Link from "next/link";
import { client } from "@/sanity/lib/client";
import { allBlogPostsQuery } from "@/sanity/lib/queries";

export const metadata: Metadata = {
  title: "Blog — Pacific Surfaces",
  description:
    "Insights, trends, and guides on premium quartz and granite surfaces for modern interiors.",
};

interface BlogPost {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt: string;
  mainImage: string;
  publishedAt: string;
  minutesToRead: number;
}

export default async function BlogPage() {
  const posts: BlogPost[] = await client.fetch(allBlogPostsQuery);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">Blog</h1>
      <p className="mt-2 text-gray-600">
        Ideas, trends, and inspiration for premium surfaces.
      </p>

      {posts.length === 0 ? (
        <p className="text-gray-500 py-12 text-center">
          Blog posts are being imported. Check back soon!
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post._id}
              href={`/blog/${post.slug.current}`}
              className="group"
            >
              {post.mainImage && (
                <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={post.mainImage}
                    alt={post.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="mt-4">
                <p className="text-sm text-gray-500">
                  {new Date(post.publishedAt).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  {post.minutesToRead && ` · ${post.minutesToRead} min read`}
                </p>
                <h2 className="mt-2 text-lg font-semibold text-gray-900 group-hover:underline">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {post.excerpt}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
