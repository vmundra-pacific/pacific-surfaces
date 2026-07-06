import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { client } from "@/sanity/lib/client";
import { groq } from "next-sanity";
import { sanityImg } from "@/lib/sanity-img";

/**
 * /search — site-wide search endpoint that the WebSite/SearchAction
 * JSON-LD in src/app/layout.tsx points to. Google's sitelinks search
 * box submits to /search?q={term}; this page renders matching
 * products from Sanity in a simple grid. If `q` is missing, we
 * render an empty-state page that links back to the catalogue.
 *
 * Kept intentionally lean: this is plumbing for the SearchAction
 * schema, not a destination experience. The product grid on
 * /products is the real catalogue. If we ever want autocomplete or
 * faceted search, that lives there.
 */

export const metadata: Metadata = {
  title: "Search",
  description:
    "Search Pacific Surfaces — premium quartz, granite, and semi-precious stone surfaces.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/search" },
};

const searchQuery = groq`
  *[_type == "product" && (
    name match $term + "*" ||
    pt::text(description) match $term + "*" ||
    category->name match $term + "*"
  )] | order(name asc)[0...60] {
    _id,
    name,
    "slug": slug.current,
    "categorySlug": category->slug.current,
    "categoryName": category->name,
    "mainImage": mainImage.asset->url,
  }
`;

type SearchResult = {
  _id: string;
  name: string;
  slug: string;
  categorySlug?: string;
  categoryName?: string;
  mainImage?: string;
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const term = (q ?? "").trim();

  let results: SearchResult[] = [];
  if (term) {
    try {
      results = await client.fetch(searchQuery, { term });
    } catch (error) {
      // A Sanity outage or malformed query shouldn't 500 the search
      // page — render the empty state and let the user browse.
      console.error("[search] Sanity fetch failed:", error);
      results = [];
    }
  }

  return (
    <div className="pt-28 pb-24 bg-[#f4efe8] min-h-screen">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <p className="text-[11px] tracking-[0.32em] uppercase text-stone-500 mb-4">
          Search
        </p>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight text-[#112732] mb-3">
          {term ? (
            <>
              Results for{" "}
              <em className="not-italic text-stone-500">
                &ldquo;{term}&rdquo;
              </em>
            </>
          ) : (
            "Search"
          )}
        </h1>
        <p className="text-base text-stone-600 mb-12 max-w-2xl">
          {term
            ? `${results.length} surface${results.length === 1 ? "" : "s"} matching your search.`
            : "Use the search box in your browser, or browse the full catalogue below."}
        </p>

        {results.length > 0 ? (
          <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
            {results.map((r) => {
              // The /products/[slug]/[item] route resolves collections,
              // not products — category/product hrefs 404. The bare
              // /products/[slug] dispatcher resolves product detail pages.
              const href = `/products/${r.slug}`;
              return (
                <li key={r._id}>
                  <Link href={href} className="group block">
                    <div className="aspect-[4/5] overflow-hidden bg-stone-200 mb-3 rounded-sm">
                      {r.mainImage && (
                        <Image
                          // sanityImg returns string | undefined per its
                          // declared signature; the `r.mainImage &&` guard
                          // narrows the input to string but TS can't carry
                          // that through. Fall back to the raw URL so the
                          // src prop is always string.
                          src={sanityImg(r.mainImage, { w: 720, q: 75 }) ?? r.mainImage}
                          alt={r.name}
                          width={720}
                          height={900}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      )}
                    </div>
                    <p className="text-[10px] tracking-[0.28em] uppercase text-stone-500 mb-1">
                      {r.categoryName ?? "Surface"}
                    </p>
                    <p className="text-base font-light text-[#112732]">
                      {r.name}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="border-t border-[#112732]/15 pt-10">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#112732] text-white text-xs font-medium tracking-[0.15em] uppercase rounded-full hover:bg-[#1a3548] transition-colors"
            >
              Browse all surfaces
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
