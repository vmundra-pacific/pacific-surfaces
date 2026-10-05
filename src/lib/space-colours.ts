import { client } from "@/sanity/lib/client";
import type { SpaceColour } from "@/components/sections/spaces/SpaceBlocks";

/**
 * The "popular colours" tiles of a space page: the designs named by slug,
 * read from Sanity (name and slab photograph), in the order given. A slug
 * Sanity no longer has, or has hidden, is left out rather than shown blank.
 */
export async function spaceColours(slugs: string[]): Promise<SpaceColour[]> {
  const rows = await client
    .fetch<{ name: string; slug: string; image: string | null }[]>(
      `*[_type == "product" && slug.current in $slugs && visible != false]{
        name, "slug": slug.current, "image": mainImage.asset->url
      }`,
      { slugs }
    )
    .catch(() => []);
  return slugs.flatMap((slug) => {
    const r = rows?.find((x) => x.slug === slug);
    return r ? [{ name: r.name, slug: r.slug, image: r.image }] : [];
  });
}
