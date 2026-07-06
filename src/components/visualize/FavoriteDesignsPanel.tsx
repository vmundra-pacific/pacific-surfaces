"use client";

import { useEffect, useState } from "react";
import { Heart, Check } from "lucide-react";
import type { Slab } from "@/data/slabs";

/**
 * Favorites live in localStorage only (key `ps_favorites_v1`, toggled
 * from the heart button on ProductDetail.tsx) — same key the
 * /favorites page and /api/favorites route already use. No new
 * storage mechanism, just a new reader.
 */
const FAV_STORAGE_KEY = "ps_favorites_v1";

function readFavoriteIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FAV_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Resolves the visitor's favorited product ids against a list of
 * already-fetched slabs (Sanity `_id` === `slab.id`, see
 * data/sanityToSlab.ts) — no extra network round trip, since the
 * visualizer already has the full catalogue in memory as `curated`.
 *
 * Re-reads on window focus so favoriting a product in another tab
 * (e.g. browsing /catalogue in a second tab) shows up here without
 * requiring a full page reload.
 */
export function useFavoriteSlabs(source: Slab[]): Slab[] {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    setIds(readFavoriteIds());
    const refresh = () => setIds(readFavoriteIds());
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  if (ids.length === 0) return [];
  // Most-recently-favorited first (ps_favorites_v1 is stored
  // oldest-first via array push), deduped defensively.
  return ids
    .slice()
    .reverse()
    .map((id) => source.find((s) => s.id === id))
    .filter((s): s is Slab => Boolean(s))
    .filter((s, i, arr) => arr.findIndex((x) => x.id === s.id) === i);
}

/**
 * Third intake-screen column: the visitor's favorited designs,
 * selectable as the design to apply once a surface is detected on
 * the uploaded/demo photo. Renders `null` (hides entirely) when the
 * visitor has no favorites yet — per product decision, we don't want
 * an empty-state card cluttering the upload screen for first-time
 * visitors who haven't favorited anything.
 */
export function FavoriteDesignsPanel({
  slabs,
  activeId,
  onPick,
}: {
  slabs: Slab[];
  activeId: string | null;
  onPick: (slab: Slab) => void;
}) {
  if (slabs.length === 0) return null;

  return (
    <div className="h-full flex flex-col rounded-2xl border border-white/10 bg-white/[.02] p-6">
      <div className="shrink-0 flex items-center gap-2 text-[10px] md:text-xs tracking-[.28em] uppercase text-pacific-mid mb-4">
        <Heart className="w-3.5 h-3.5 fill-current" />
        Your favorites
      </div>
      <p className="shrink-0 text-xs text-pacific-mid/90 leading-relaxed mb-4">
        Works for upload or any demo room — pick one to apply automatically to
        the first surface you select.
      </p>
      <div className="flex-1 min-h-0 grid grid-cols-2 gap-2.5 overflow-y-auto pr-1 content-start">
        {slabs.map((slab) => {
          const isActive = slab.id === activeId;
          return (
            <button
              key={slab.id}
              type="button"
              onClick={() => onPick(slab)}
              title={slab.name}
              className={`relative aspect-square rounded-xl overflow-hidden ring-2 transition-all ${
                isActive ? "ring-white" : "ring-white/10 hover:ring-white/40"
              }`}
            >
              {slab.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={slab.photoUrl}
                  alt={slab.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{ backgroundImage: slab.swatch }}
                />
              )}
              {isActive && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-pacific-dark" />
                  </div>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 px-1.5 py-1 bg-gradient-to-t from-black/75 to-transparent">
                <div className="text-[9px] leading-tight text-white truncate">
                  {slab.name}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
