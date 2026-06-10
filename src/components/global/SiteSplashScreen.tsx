"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { VideoLoadingScreen } from "@/components/visualize/VideoLoadingScreen";

/**
 * Site-wide splash that plays the brand homepage render as a loading
 * screen while the page boots. Mounted at the (site) layout level so
 * it covers everything on the marketing site on first paint.
 *
 * Dismiss policy:
 *   - Shows on first mount and plays the video ONCE (no loop).
 *   - Dismisses when the video reaches its end — the user always sees
 *     the full render before the site is revealed.
 *   - Hard safety ceiling (MAX_DISPLAY_MS) so a missing or broken
 *     video file can never strand the user behind the splash.
 *   - Skipped on subsequent client-side navigations / page refreshes
 *     within the same tab via sessionStorage. Open a fresh tab to
 *     replay the splash.
 *
 * Scroll behaviour:
 *   - All page scrolling is locked while the splash is on screen,
 *     including throughout the exit animation. We block native scroll
 *     (overflow:hidden on html+body), Lenis smooth-scroll (its wheel
 *     handler is bypassed by capturing wheel events first), touch
 *     scroll on mobile, and keyboard scroll keys. The lock releases
 *     only after the exit animation has fully completed and the
 *     splash unmounts, so the page never moves under the user's eye
 *     while it's still being revealed.
 */
const MAX_DISPLAY_MS = 20000;
const SESSION_KEY = "ps:splashShown";

export default function SiteSplashScreen() {
  // Splash plays ONLY on the homepage. Any other route — product
  // pages, /about, /contact, /spaces, etc. — must skip the splash
  // so deep-linked visitors don't sit through a brand intro that
  // wasn't designed for the page they're actually trying to reach.
  // SiteSplashScreen still mounts at the (site) layout level (so
  // navigating from the homepage to another page mid-splash still
  // unmounts it cleanly), it just returns null when off-route.
  const pathname = usePathname();
  const isHomepage = pathname === "/";

  // Three-state machine. `null` keeps SSR/CSR markup in sync until the
  // effect runs. `true` shows the splash. `false` triggers the exit
  // animation but the component stays mounted until AnimatePresence
  // calls `onExitComplete`, at which point `mounted` flips to false.
  const [visible, setVisible] = useState<boolean | null>(null);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isHomepage) {
      // Not on the homepage — never show the splash. We still set
      // the sessionStorage flag so a subsequent navigation to the
      // homepage in the same tab respects the "shown once per
      // session" policy.
      setVisible(false);
      setMounted(false);
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* ignore */
      }
      return;
    }
    let alreadyShown = false;
    try {
      alreadyShown = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      /* private mode etc. — fall through and show it */
    }
    if (alreadyShown) {
      setVisible(false);
      setMounted(false);
      return;
    }

    setVisible(true);
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* ignore */
    }

    // Two-condition dismiss gate:
    //   1. The brand video has reached its end (`videoEnded`), and
    //   2. The homepage hero has loaded its first batch of frames
    //      (`pacific:hero-ready`).
    // Whichever finishes second flips `visible` to false. The 20s
    // safety ceiling still applies as the absolute upper bound.
    let videoEnded = false;
    let heroReady = false;
    const tryDismiss = () => {
      if (videoEnded && heroReady) setVisible(false);
    };
    const onHeroReady = () => {
      heroReady = true;
      tryDismiss();
    };
    window.addEventListener("pacific:hero-ready", onHeroReady);

    // Expose a setter the VideoLoadingScreen can call from onEnded.
    // We attach it to a ref-like object on `window` so the inline
    // arrow in the JSX below can flip the flag without the component
    // having to thread state through.
    (
      window as unknown as { __pacificSplashOnVideoEnd?: () => void }
    ).__pacificSplashOnVideoEnd = () => {
      videoEnded = true;
      tryDismiss();
    };

    // Safety ceiling — if either the video or the hero loader stalls
    // beyond MAX_DISPLAY_MS we still let the user through.
    const ceiling = window.setTimeout(() => setVisible(false), MAX_DISPLAY_MS);

    return () => {
      window.clearTimeout(ceiling);
      window.removeEventListener("pacific:hero-ready", onHeroReady);
      delete (window as unknown as { __pacificSplashOnVideoEnd?: () => void })
        .__pacificSplashOnVideoEnd;
    };
  }, [isHomepage]);

  // Scroll lock — runs only while the splash is actively VISIBLE.
  // The instant the video ends (or the safety ceiling fires) and we
  // call `setVisible(false)`, the lock releases and the user can
  // scroll right away. The splash's exit animation continues to play
  // in the background on top of the now-interactive page; we
  // intentionally don't gate scroll on the animation finishing,
  // because the user doesn't want a "few seconds of nothing" between
  // the video ending and being able to interact.
  useEffect(() => {
    if (!visible) return;
    if (typeof window === "undefined") return;

    // Native scroll lock via overflow:hidden on both html and body.
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlOverscroll = html.style.overscrollBehavior;
    const prevBodyOverscroll = body.style.overscrollBehavior;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    body.style.overscrollBehavior = "none";

    // Capture wheel/touchmove BEFORE Lenis sees them and prevent default.
    // Capture-phase + non-passive lets us call preventDefault, which
    // stops both the native scroll and Lenis's wheel-driven smoothing.
    const blockEvent = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };

    // Block keyboard scroll keys (space, arrows, page nav).
    const blockedKeys = new Set([
      " ",
      "ArrowDown",
      "ArrowUp",
      "ArrowLeft",
      "ArrowRight",
      "PageDown",
      "PageUp",
      "Home",
      "End",
    ]);
    const blockKey = (e: KeyboardEvent) => {
      if (blockedKeys.has(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        // Space is documented as a "skip the splash" key, but this
        // capture-phase handler swallows it before the splash's own
        // onKeyDown ever fires. Dismiss here so Space still skips.
        if (e.key === " ") setVisible(false);
      }
    };

    window.addEventListener("wheel", blockEvent, {
      passive: false,
      capture: true,
    });
    window.addEventListener("touchmove", blockEvent, {
      passive: false,
      capture: true,
    });
    window.addEventListener("keydown", blockKey, { capture: true });

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      html.style.overscrollBehavior = prevHtmlOverscroll;
      body.style.overscrollBehavior = prevBodyOverscroll;
      window.removeEventListener("wheel", blockEvent, { capture: true });
      window.removeEventListener("touchmove", blockEvent, { capture: true });
      window.removeEventListener("keydown", blockKey, { capture: true });
    };
  }, [visible]);

  if (!mounted) return null;

  return (
    <AnimatePresence onExitComplete={() => setMounted(false)}>
      {visible && (
        <div
          // Fixed full-viewport wrapper so VideoLoadingScreen (which
          // uses absolute inset-0) sits over the entire page rather
          // than its nearest positioned ancestor.
          //
          // Click-to-dismiss: any tap anywhere on the splash skips the
          // loading video and reveals the page immediately. Useful for
          // return visitors and impatient first-timers; the brand
          // moment is preserved for users who let the video play.
          className="fixed inset-0 z-[100] cursor-pointer"
          aria-hidden={!visible}
          role="button"
          tabIndex={0}
          onClick={() => setVisible(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
              e.preventDefault();
              setVisible(false);
            }
          }}
        >
          <VideoLoadingScreen
            message="Welcome to Pacific Surfaces"
            subMessage="Setting the stage — your slabs are loading."
            loop={false}
            onEnded={() => {
              const w = window as unknown as {
                __pacificSplashOnVideoEnd?: () => void;
              };
              if (typeof w.__pacificSplashOnVideoEnd === "function") {
                w.__pacificSplashOnVideoEnd();
              } else {
                // Effect hasn't bound yet; just dismiss.
                setVisible(false);
              }
            }}
          />
        </div>
      )}
    </AnimatePresence>
  );
}
