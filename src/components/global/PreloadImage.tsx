/**
 * A high-priority image preload for the page's first large paint, written
 * as a <link> in the page's own tree (React hoists it into <head>).
 *
 * In place of react-dom's preload(): called from a page, that one also
 * travels in the page's prefetch payload, so every page that merely linked
 * to it (the header, product cards) downloaded its hero or zoom image
 * without showing it; the homepage fetched the 264 KB /products poster on
 * every visit (2026-10-22, phone performance). This <link> only renders
 * when the page itself does.
 */
export function PreloadImage({ href, media }: { href?: string | null; media?: string }) {
  if (!href) return null;
  return <link rel="preload" as="image" href={href} media={media} fetchPriority="high" />;
}
