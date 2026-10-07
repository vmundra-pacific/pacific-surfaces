"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/**
 * The window the sill collection opens over its page (a product, the size
 * chart, the technical specifications): a titled panel with a sticky
 * header, so the page itself stays short. Escape, the close button or a
 * click outside closes it; the page behind does not scroll while it is
 * open, and focus goes back to whatever opened it. One may open over
 * another (a product's sizes); Escape closes the top one only.
 * `onClose` should be stable (useCallback).
 */

/** The open dialogs, last opened last: only the top one answers Escape. */
const stack: symbol[] = [];

export function SillDialog({
  title,
  onClose,
  actions,
  fit = false,
  children,
}: {
  title: string;
  onClose: () => void;
  /** Links beside the close button, e.g. the PDF. */
  actions?: React.ReactNode;
  /** As tall as its content, centred, rather than the full height. */
  fit?: boolean;
  children: React.ReactNode;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    const me = Symbol(title);
    stack.push(me);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && stack[stack.length - 1] === me) onClose();
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const back = document.activeElement as HTMLElement | null;
    panel.current?.focus();
    return () => {
      stack.splice(stack.indexOf(me), 1);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      back?.focus();
    };
  }, [onClose, title]);

  return createPortal(
    <div
      className={`fixed inset-0 z-[400] flex justify-center bg-black/55 sm:p-6 lg:p-10 ${fit ? "items-center" : ""}`}
      onClick={onClose}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full overflow-y-auto overscroll-contain bg-white text-[#14140f] outline-none ${
          fit ? "max-h-full max-w-5xl" : "h-full max-w-6xl"
        }`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-[#14140f]/10 bg-white px-5 py-4 sm:px-8">
          <h2 id={titleId} className="text-sm uppercase tracking-[0.12em]">
            {title}
          </h2>
          <div className="flex items-center gap-2">
            {actions}
            <button type="button" onClick={onClose} aria-label="Close" className="p-2 hover:opacity-60">
              <X className="h-5 w-5" strokeWidth={1.25} />
            </button>
          </div>
        </div>
        <div className="px-5 py-8 sm:px-8 sm:py-10">{children}</div>
      </div>
    </div>,
    document.body
  );
}
