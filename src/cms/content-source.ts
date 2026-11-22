/**
 * Which store the site reads each kind of content from.
 *
 * CONTENT_SOURCE picks the store for the whole site: "sanity" or "cms".
 * Unset or empty means "sanity".
 *
 * A single kind of content can be sent back to Sanity on its own with
 * its own setting, for example CONTENT_SOURCE_PRODUCTS=sanity while
 * CONTENT_SOURCE=cms. Unset or empty means "follow CONTENT_SOURCE".
 *
 * Only that way back is supported: the site on the CMS
 * (CONTENT_SOURCE=cms) with some kinds sent back to Sanity. Sending one
 * kind forward to the CMS while the site stays on Sanity is NOT
 * supported and is refused when the server starts: the file routes, the
 * picture-host hint and robots follow CONTENT_SOURCE only, so they would
 * still point at Sanity.
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

/**
 * Refuses a wrong value in any of the settings, and refuses any kind set to
 * "cms" while CONTENT_SOURCE is "sanity" or not set. Run when the server
 * starts.
 */
export function assertContentSettings(): void {
  const site = contentSource();
  for (const type of Object.keys(CONTENT_TYPE_SETTINGS) as ContentType[]) {
    const kind = contentSourceFor(type);
    if (kind === "cms" && site !== "cms") {
      const name = CONTENT_TYPE_SETTINGS[type];
      throw new Error(
        `${name} is "cms" but CONTENT_SOURCE is ${site === "sanity" && process.env.CONTENT_SOURCE ? '"sanity"' : "not set"}. ` +
          `This mix is not supported: the site's files and pictures would still come from Sanity. ` +
          `Set CONTENT_SOURCE=cms for the whole site, and send single kinds back with ${name}=sanity.`
      );
    }
  }
}
