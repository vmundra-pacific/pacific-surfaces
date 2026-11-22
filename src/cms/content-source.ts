/**
 * Which store the site reads each kind of content from.
 *
 * CONTENT_SOURCE picks the store for the whole site: "sanity" or "cms".
 * Unset or empty means "sanity".
 *
 * A single kind of content can be sent back, or forward, on its own with
 * its own setting, for example CONTENT_SOURCE_PRODUCTS=sanity while
 * CONTENT_SOURCE=cms. Unset or empty means "follow CONTENT_SOURCE".
 *
 * Any other value, in any of these settings ("CMS", "true", " cms"), is
 * refused with an error that names the setting. It is never read as one
 * of the two stores by guesswork.
 *
 * This file reads only `process.env` and imports nothing, so the start-up
 * check, the edge routes and the server fetchers can all use it.
 */

export type ContentSource = "sanity" | "cms";

/**
 * The kinds of content, named as the fetchers in `./read.ts` group
 * them, each with its setting. The old-file-address look-up
 * (`legacyFiles`) and the media routes follow CONTENT_SOURCE only: they
 * are about files, not a kind of content.
 */
export const CONTENT_TYPE_SETTINGS = {
  products: "CONTENT_SOURCE_PRODUCTS",
  collections: "CONTENT_SOURCE_COLLECTIONS",
  journal: "CONTENT_SOURCE_JOURNAL",
  home: "CONTENT_SOURCE_HOME",
  resources: "CONTENT_SOURCE_RESOURCES",
  careers: "CONTENT_SOURCE_CAREERS",
  beyondStone: "CONTENT_SOURCE_BEYOND_STONE",
  spacePages: "CONTENT_SOURCE_SPACE_PAGES",
  faq: "CONTENT_SOURCE_FAQ",
  search: "CONTENT_SOURCE_SEARCH",
  sitemap: "CONTENT_SOURCE_SITEMAP",
} as const;

export type ContentType = keyof typeof CONTENT_TYPE_SETTINGS;

function parse(name: string, value: string | undefined): ContentSource | null {
  if (value === undefined || value === "") return null;
  if (value === "sanity" || value === "cms") return value;
  throw new Error(
    `${name} is ${JSON.stringify(value)}. It must be "sanity" or "cms", or not set.`
  );
}

/** The store for the whole site. */
export function contentSource(): ContentSource {
  return parse("CONTENT_SOURCE", process.env.CONTENT_SOURCE) ?? "sanity";
}

/** The store for one kind of content: its own setting, else the site's. */
export function contentSourceFor(type: ContentType): ContentSource {
  const own = parse(
    CONTENT_TYPE_SETTINGS[type],
    process.env[CONTENT_TYPE_SETTINGS[type]]
  );
  return own ?? contentSource();
}

/** Refuses a wrong value in any of the settings. Run when the server starts. */
export function assertContentSettings(): void {
  contentSource();
  for (const type of Object.keys(CONTENT_TYPE_SETTINGS) as ContentType[]) {
    contentSourceFor(type);
  }
}
