"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ShieldCheck, X } from "lucide-react";
import type { CertificationLink } from "@/data/certifications";

/**
 * Full-screen, view-only reader for Pacific's own certificates.
 *
 * What it shows are page images the server has already rasterised and
 * watermarked (src/lib/certificates/render.ts) — the PDF itself never
 * reaches the browser, and there is no download, print or share control
 * and no URL that opens a certificate on its own.
 *
 * On top of that it deters the casual routes to a copy: no context menu,
 * no drag, no selection, Ctrl/Cmd+S/P/C swallowed, printing blanked, and
 * the pages hidden whenever the window loses focus or PrintScreen is
 * pressed. None of this can stop a screenshot tool or a phone camera —
 * nothing in a browser can — which is why the watermark is burned into
 * the pixels and a second, dated one is laid over them here.
 *
 * Rendered through a portal into <body> for the same reason as the
 * catalogue Flipbook: a framer-motion ancestor would otherwise make
 * `position: fixed` resolve against it instead of the viewport.
 */

type PageSize = { width: number; height: number };
type Meta = { id: string; title: string; pages: PageSize[] };

export function CertificateViewer({
  cert,
  onClose,
}: {
  cert: CertificationLink["id"];
  onClose: () => void;
}) {
  const [meta, setMeta] = useState<Meta | null>(null);
  const [failed, setFailed] = useState(false);
  const [concealed, setConcealed] = useState(false);
  const [src, setSrc] = useState<Record<number, string>>({});
  const closeRef = useRef<HTMLButtonElement>(null);
  // Read through a ref so a parent passing an inline arrow doesn't re-run
  // the setup effect below (and re-lock scroll, re-bind keys) each render.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    let alive = true;
    fetch(`/api/certificates/${cert}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((m: Meta) => alive && setMeta(m))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [cert]);

  // Each page is fetched into a blob: URL and painted as a CSS background.
  // The route answers no-store, so the browser keeps no cached copy that
  // a direct visit to the image URL could be served from (the server
  // refuses those); a background offers no "Save image" either; and the
  // blob URLs are revoked the moment the viewer closes.
  useEffect(() => {
    if (!meta) return;
    let alive = true;
    const urls: string[] = [];
    meta.pages.forEach((_, i) => {
      fetch(pageUrl(cert, i + 1), { cache: "no-store" })
        .then((r) => (r.ok ? r.blob() : Promise.reject(r.status)))
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          urls.push(url);
          if (alive) setSrc((s) => ({ ...s, [i]: url }));
        })
        .catch(() => {});
    });
    return () => {
      alive = false;
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [meta, cert]);

  useEffect(() => {
    const html = document.documentElement;
    const { overflow } = document.body.style;
    // overflow alone, as in the Flipbook: a position:fixed lock fights
    // Lenis and loses the scroll position on close.
    document.body.style.overflow = "hidden";
    html.classList.add("cert-viewing");

    const conceal = () => setConcealed(true);
    const scrubClipboard = () => {
      navigator.clipboard?.writeText("").catch(() => {});
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (e.key === "PrintScreen") {
        conceal();
        scrubClipboard();
      }
      const mod = e.ctrlKey || e.metaKey;
      if (mod && ["s", "p", "c", "a"].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };
    // Windows only reports PrintScreen on keyup.
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen") {
        conceal();
        scrubClipboard();
      }
    };
    const onVisibility = () => {
      if (document.hidden) conceal();
    };
    const block = (e: Event) => e.preventDefault();

    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("keyup", onKeyUp, true);
    window.addEventListener("blur", conceal);
    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("copy", block);
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = overflow;
      html.classList.remove("cert-viewing");
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("keyup", onKeyUp, true);
      window.removeEventListener("blur", conceal);
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("copy", block);
    };
  }, []);

  // Second watermark, drawn here rather than on the server so it can
  // carry today's date — a capture shows when it was taken.
  const overlay = useMemo(() => {
    const date = new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date());
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='420' height='300'><text x='210' y='150' text-anchor='middle' transform='rotate(-24 210 150)' font-family='Arial, sans-serif' font-size='12' letter-spacing='2' fill='rgba(17,39,50,0.14)'>pacific-surfaces.com · viewed ${date}</text></svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  }, []);

  const guard = (e: React.SyntheticEvent) => e.preventDefault();

  return createPortal(
    <div
      data-over-media
      role="dialog"
      aria-modal="true"
      aria-label={meta?.title ?? "Certificate"}
      className="fixed inset-0 z-[200] flex flex-col bg-black/85 backdrop-blur-sm"
      onContextMenu={guard}
      onDragStart={guard}
      style={{ userSelect: "none", WebkitUserSelect: "none", WebkitTouchCallout: "none" }}
    >
      {/* Printing a page with the viewer open prints nothing. */}
      <style>{`@media print { html.cert-viewing body { display: none !important; } }`}</style>

      <div className="flex shrink-0 items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <ShieldCheck className="h-4 w-4 shrink-0 text-white/70" aria-hidden />
          <div className="min-w-0">
            <div className="truncate text-sm font-medium tracking-tight text-white">
              {meta?.title ?? "Certificate"}
            </div>
            <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/60">
              Pacific Surfaces · View only
            </div>
          </div>
        </div>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close certificate"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div
        data-lenis-prevent
        className="relative min-h-0 flex-1 overflow-y-auto px-3 pb-8 sm:px-6"
      >
        {failed && (
          <div className="mx-auto mt-24 max-w-md text-center text-sm text-white/80">
            This certificate could not be loaded just now. Please try again
            in a moment.
          </div>
        )}

        {!meta && !failed && (
          <div className="mx-auto mt-24 flex max-w-md flex-col items-center gap-4 text-sm text-white/70">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/25 border-t-white" />
            Loading certificate…
          </div>
        )}

        {meta && (
          <div
            className="mx-auto flex max-w-4xl flex-col gap-4 transition-[filter] duration-200"
            style={{ filter: concealed ? "blur(28px)" : "none" }}
            aria-hidden={concealed}
          >
            {meta.pages.map((p, i) => (
              <div
                key={i}
                role="img"
                aria-label={`${meta.title}, page ${i + 1} of ${meta.pages.length}`}
                className="relative w-full overflow-hidden bg-white shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
                style={{
                  aspectRatio: `${p.width} / ${p.height}`,
                  backgroundImage: src[i] ? `url(${src[i]})` : undefined,
                  backgroundSize: "100% 100%",
                }}
              >
                {!src[i] && (
                  <div className="absolute inset-0 animate-pulse bg-[#f3f4f5]" />
                )}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{ backgroundImage: overlay }}
                />
              </div>
            ))}
          </div>
        )}

        {concealed && meta && (
          <button
            type="button"
            onClick={() => setConcealed(false)}
            className="absolute inset-0 flex items-center justify-center"
          >
            <span className="rounded-full bg-white px-6 py-3 text-xs font-medium uppercase tracking-[0.15em] text-[#112732] shadow-lg">
              Click to keep viewing
            </span>
          </button>
        )}
      </div>
    </div>,
    document.body,
  );
}

function pageUrl(cert: string, page: number) {
  return `/api/certificates/${cert}/${page}`;
}
