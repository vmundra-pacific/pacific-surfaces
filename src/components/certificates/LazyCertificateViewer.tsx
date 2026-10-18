"use client";

import { useEffect, useRef, useState, type ComponentProps } from "react";
import type { CertificateViewer as Viewer } from "./CertificateViewer";

/**
 * CertificateViewer, loaded on demand so its code stays out of the page
 * bundles that show certificate badges (homepage, product pages,
 * professionals pages). It renders nothing until a certificate is opened.
 *
 * Deliberately not next/dynamic: that wraps the viewer in Suspense, and
 * React holds a boundary's first reveal back for up to 300 ms after its
 * fallback, so the viewer would open late on the first click even with
 * the chunk already fetched. Here the loaded module is kept and rendered
 * directly, so once warm a click opens the viewer in the same frame, as
 * the static import did. Callers warm it when the page is idle and when a
 * badge is hovered, focused or touched.
 */
type ViewerComponent = typeof Viewer;

let loaded: ViewerComponent | null = null;
let loading: Promise<ViewerComponent> | null = null;

function loadViewer(): Promise<ViewerComponent> {
  if (!loading) {
    loading = import("./CertificateViewer").then(
      (m) => (loaded = m.CertificateViewer)
    );
    // A failed fetch (offline, a deploy swapping chunks) is retried on
    // the next call rather than cached.
    loading.catch(() => {
      loading = null;
    });
  }
  return loading;
}

/** Start fetching the viewer's code. Safe to call on every hover. */
export function warmCertificateViewer() {
  loadViewer().catch(() => {});
}

/** Warm the viewer once the page is idle. A tap on a phone has no hover
 *  before it, so without this the first tap would wait on the chunk. */
export function useWarmCertificateViewerWhenIdle() {
  useEffect(() => {
    if (typeof window.requestIdleCallback === "function") {
      const idleId = window.requestIdleCallback(warmCertificateViewer, {
        timeout: 3000,
      });
      return () => window.cancelIdleCallback(idleId);
    }
    const timeoutId = setTimeout(warmCertificateViewer, 1500);
    return () => clearTimeout(timeoutId);
  }, []);
}

export function LazyCertificateViewer(props: ComponentProps<ViewerComponent>) {
  const [Loaded, setLoaded] = useState<ViewerComponent | null>(() => loaded);
  // Read through a ref so a parent's inline arrow doesn't re-run the load.
  const onCloseRef = useRef(props.onClose);
  onCloseRef.current = props.onClose;

  useEffect(() => {
    if (Loaded) return;
    let alive = true;
    loadViewer().then(
      (component) => {
        if (alive) setLoaded(() => component);
      },
      // Couldn't load: clear the parent's open state so the next click
      // tries again instead of leaving a badge that does nothing.
      () => {
        if (alive) onCloseRef.current();
      }
    );
    return () => {
      alive = false;
    };
  }, [Loaded]);

  return Loaded ? <Loaded {...props} /> : null;
}
