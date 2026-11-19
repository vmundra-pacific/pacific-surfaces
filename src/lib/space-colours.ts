import * as cms from "@/cms/read";
import type { SpaceColour } from "@/components/sections/spaces/SpaceBlocks";

/**
 * The "popular colours" tiles of a space page: the designs named by slug,
 * read from Sanity (name and slab photograph), in the order given. A slug
 * Sanity no longer has, or has hidden, is left out rather than shown blank.
 */
export async function spaceColours(slugs: string[]): Promise<SpaceColour[]> {
  const rows = await cms
    .productTiles<{ name: string; slug: string; image: string | null }[]>(slugs)
    .catch(() => []);
  return slugs.flatMap((slug) => {
    const r = rows?.find((x) => x.slug === slug);
    return r ? [{ name: r.name, slug: r.slug, image: r.image }] : [];
  });
}
