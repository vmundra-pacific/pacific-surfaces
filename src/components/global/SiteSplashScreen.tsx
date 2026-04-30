"use client";

import { useEffect, useState } from "react";
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
  // Three-state machine. `null` keeps SSR/CSR markup in sync until the
  // effect runs. `true` shows the splash. `false` triggers the exit
  // animation but the component stays mounted until AnimatePresence
  // calls `onExitComplete`, at which point `mounted` flips to false.
  const [visible, setVisible] = useState<boolean | null>(null);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
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

    // Safety ceiling — if the video never fires `ended` (missing file,
    // codec issue, network stall) we still let the user through.
    const ceiling = window.setTimeout(() => setVisible(false), MAX_DISPLAY_MS);

    return () => {
      window.clearTimeout(ceiling);
    };
  }, []);

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
          className="fixed inset-0 z-[100]"
          aria-hidden={!visible}
        >
          <VideoLoadingScreen
            message="Welcome to Pacific Surfaces"
            subMessage="Setting the stage — your slabs are loading."
            loop={false}
            onEnded={() => setVisible(false)}
          />
        </div>
      )}
    </AnimatePresence>
  );
}
