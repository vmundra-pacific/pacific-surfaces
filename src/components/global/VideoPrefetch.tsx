"use client";

/**
 * Off-screen video preloader.
 *
 * Mounts hidden `<video preload="auto">` elements for each URL in
 * `urls`, which nudges the browser to start fetching the bytes
 * immediately on page load — even though nothing visible on screen
 * is asking for them. The actual `<video>` elements that DO appear
 * on screen (e.g. inside SignatureProjects' card grid) keep their
 * `preload="none"` so they don't double-fetch; when their
 * IntersectionObserver later calls play(), the browser pulls from
 * its HTTP cache instead of doing a fresh network round-trip.
 *
 * The intent is to use the splash-screen window — when the user is
 * waiting on the brand video and can't interact yet — as free time
 * to warm caches for the videos further down the page. By the time
 * the splash dismisses, most clips have fully buffered, so the
 * Signature Projects section reads instantly when reached.
 *
 * Why a hidden <video> instead of <link rel="preload">?
 *   - <link rel="preload" as="video"> works in some browsers but
 *     has spotty support and doesn't always promote the bytes the
 *     way a real <video> element does.
 *   - <video preload="auto"> is the closest thing to a "fetch and
 *     decode metadata" hint that the browser reliably honours.
 *
 * Why not display: none?
 *   - Some browsers skip loading for fully-display:none video.
 *     We use a 1×1 invisible, pointer-events:none, clipped element
 *     parked off-screen so the browser still treats it as a "real"
 *     resource and fetches it.
 */
export function VideoPrefetch({ urls }: { urls: string[] }) {
  if (urls.length === 0) return null;
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        width: 1,
        height: 1,
        overflow: "hidden",
        pointerEvents: "none",
        opacity: 0,
        clip: "rect(0,0,0,0)",
        bottom: -1,
        right: -1,
      }}
    >
      {urls.map((url) => (
        <video
          key={url}
          src={url}
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
