"use client";

/**
 * /favorites — dedicated view for products the visitor has
 * favorited. Per the 2026 UX audit: "Option to favorite is available
 * but there is not place to view just the ones that have been
 * favorited."
 *
 * Favorites are stored client-side only (localStorage key
 * ps_favorites_v1, toggled from the heart button on ProductDetail.tsx
 * product pages) — there's no server-side account system, so this has
 * to be a client component that reads the id list on mount and
 * resolves them via /api/favorites, then renders through the same
 * SlabGrid component the catalogue uses for visual consistency.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { SlabGrid } from "@/components/catalogue/SlabGrid";
import { PageHeader } from "@/components/ui/page-header";
import type { Slab } from "@/data/slabs";

const FAV_STORAGE_KEY = "ps_favorites_v1";

export default function FavoritesPage() {
  const [status, setStatus] = useState<"loading" | "empty" | "ready">(
    "loading"
  );
  const [slabs, setSlabs] = useState<Slab[]>([]);

  useEffect(() => {
    let ids: string[] = [];
    try {
      const raw = localStorage.getItem(FAV_STORAGE_KEY);
      ids = raw ? JSON.parse(raw) : [];
    } catch {
      ids = [];
    }

    if (ids.length === 0) {
      setStatus("empty");
      return;
    }

    fetch(`/api/favorites?ids=${encodeURIComponent(ids.join(","))}`)
      .then((res) => res.json())
      .then((data) => {
        setSlabs(data.slabs ?? []);
        setStatus("ready");
      })
      .catch(() => setStatus("empty"));
  }, []);

  return (
    <>
      <PageHeader
        badge="Saved"
        title="Your Favorites"
        description="Every surface you've favorited, in one place — pick up where you left off."
        dark
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 lg:py-20 bg-[#112732] min-h-[50vh]">
        {status === "loading" && (
          <div className="text-center text-pacific-mid py-16">Loading…</div>
        )}

        {status === "empty" && (
          <div className="flex flex-col items-center text-center py-16 gap-4">
            <Heart className="w-10 h-10 text-pacific-mid/50" />
            <h2 className="text-2xl font-light text-white">No favorites yet</h2>
            <p className="text-pacific-mid max-w-md">
              Tap the heart icon on any product page to save it here for quick
              access later.
            </p>
            <Link
              href="/catalogue"
              className="mt-2 inline-flex items-center gap-1.5 rounded-full px-6 py-3 text-xs font-medium tracking-[0.1em] uppercase bg-white text-[#112732] hover:bg-pacific-light transition-colors"
            >
              Browse the Catalogue
            </Link>
          </div>
        )}

        {status === "ready" && (
          <SlabGrid
            slabs={slabs}
            dense={false}
            onClearAll={() => {
              window.location.href = "/catalogue";
            }}
          />
        )}
      </div>
    </>
  );
}
