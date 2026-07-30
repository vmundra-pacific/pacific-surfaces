import type { Metadata } from "next";

/**
 * Metadata carrier for /favorites.
 *
 * The page itself is a client component (it reads the favourites list
 * out of localStorage), and a `"use client"` module cannot export
 * `metadata` — which is why this route was the only public page on the
 * site shipping with no title or description at all. A layout is the
 * standard way to attach metadata to a client-rendered route.
 *
 * Deliberately `noindex`: the content is per-visitor and comes from
 * localStorage, so a crawler always sees an empty list. Indexing it
 * would put a permanently blank page in search results. It stays
 * `follow` so link equity still flows to the linked product pages.
 */
export const metadata: Metadata = {
  title: "Your Favourites — Pacific Surfaces",
  description:
    "The surfaces you've saved while browsing the Pacific Surfaces catalogue, kept together for easy comparison.",
  robots: { index: false, follow: true },
};

export default function FavoritesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
