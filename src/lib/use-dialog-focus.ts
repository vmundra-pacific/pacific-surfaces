"use client";

import { useEffect, type RefObject } from "react";

/**
 * Keyboard focus for a modal dialog (WCAG 2.4.3, 2.1.2), shared by every
 * overlay on the site:
 *
 *   - on open, focus moves into the dialog, unless the dialog has already
 *     put it on one of its own controls (a search field, a close button);
 *   - Tab and Shift+Tab cycle inside the dialog instead of walking into the
 *     page behind it;
 *   - on close, focus goes back to the control that opened it.
 *
 * Dialogs can stack (a product's sizes over the sills catalogue): only the
 * top one traps. Escape and scroll locking stay with each dialog.
 */

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  'input:not([disabled]):not([type="hidden"])',
  "select:not([disabled])",
  "textarea:not([disabled])",
  "iframe",
  "summary",
  "[contenteditable='true']",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/** The open dialogs, last opened last. */
const stack: HTMLElement[] = [];

function focusable(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => {
      if (el.tabIndex < 0) return false;
      if (el.closest("[inert]") || el.closest('[aria-hidden="true"]'))
        return false;
      const style = getComputedStyle(el);
      if (style.visibility === "hidden" || style.display === "none")
        return false;
      return el.getClientRects().length > 0;
    }
  );
}

export function useDialogFocus(
  ref: RefObject<HTMLElement | null>,
  active: boolean = true
) {
  useEffect(() => {
    if (!active) return;
    const node = ref.current;
    if (!node) return;

    const opener = document.activeElement as HTMLElement | null;
    stack.push(node);

    // After a frame, so a dialog that focuses its own field keeps it.
    const raf = requestAnimationFrame(() => {
      if (node.contains(document.activeElement)) return;
      if (!node.hasAttribute("tabindex")) {
        node.setAttribute("tabindex", "-1");
        node.style.outline = "none";
      }
      node.focus({ preventScroll: true });
    });

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || stack[stack.length - 1] !== node) return;
      const items = focusable(node);
      if (items.length === 0) {
        e.preventDefault();
        node.focus({ preventScroll: true });
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement;
      if (!node.contains(current)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      } else if (e.shiftKey && (current === first || current === node)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && current === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey, true);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey, true);
      const i = stack.indexOf(node);
      if (i !== -1) stack.splice(i, 1);
      if (opener && opener.isConnected && opener !== document.body) {
        opener.focus({ preventScroll: true });
      }
    };
  }, [ref, active]);
}
