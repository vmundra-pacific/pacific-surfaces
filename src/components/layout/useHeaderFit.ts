"use client";

import { useEffect, type RefObject } from "react";

/**
 * Keeps every item in the header bar visible (owner, 2026-10-27: "make the
 * texts small there in top so that every text is visible"). The bar's three
 * columns — logo and region, the menu, the buttons — are checked against
 * each other; if they collide or the buttons run off the edge, the menu
 * labels, the gaps between them and the button group are scaled down in
 * 5% steps until they fit (no smaller than 70%). A translated menu runs
 * much longer than the English one ("SOLICITE UM ORÇAMENTO"), and some
 * laptop widths were already tight in English. Where everything fits, as
 * in English on a wide screen, nothing changes.
 *
 * Only each menu label is scaled, not its item: the item also holds that
 * item's mega-menu panel, which keeps its size. Re-checked when the bar
 * resizes and when its text changes (Google Translate swapping words in).
 */
export function useHeaderFit(gridRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const [left, nav, right] = Array.from(grid.children) as HTMLElement[];
    if (!left || !nav || !right) return;

    const SAFE = 12; // least room kept between columns, px
    const labels = () =>
      Array.from(nav.children)
        .map((item) => item.firstElementChild as HTMLElement | null)
        .filter((el): el is HTMLElement => el !== null);

    const collides = () => {
      const g = grid.getBoundingClientRect();
      const l = left.getBoundingClientRect();
      const r = right.getBoundingClientRect();
      if (r.right > g.right + 1) return true;
      const items = Array.from(nav.children).filter(
        (e) => (e as HTMLElement).offsetParent
      ) as HTMLElement[];
      if (!items.length) return l.right + SAFE > r.left;
      const first = items[0].getBoundingClientRect();
      const last = items[items.length - 1].getBoundingClientRect();
      return l.right + SAFE > first.left || last.right + SAFE > r.left;
    };

    const scale = (k: number) => {
      const z = k === 1 ? "" : String(k);
      labels().forEach((el) => (el.style.zoom = z));
      right.style.zoom = z;
      nav.style.columnGap = "";
      if (k !== 1)
        nav.style.columnGap = `${(parseFloat(getComputedStyle(nav).columnGap) || 0) * k}px`;
    };

    // Last resort, when even 70% does not fit (a long language at the
    // narrowest laptop width): the region button drops its country name
    // and divider and keeps the globe.
    const compact = (on: boolean) =>
      left
        .querySelectorAll<HTMLElement>("[data-fit-optional]")
        .forEach((el) => (el.style.display = on ? "none" : ""));

    let frame = 0;
    const fit = () => {
      const shrink = () => {
        scale(1);
        for (
          let k = 0.95;
          k >= 0.7 && collides();
          k = Math.round((k - 0.05) * 100) / 100
        )
          scale(k);
      };
      compact(false);
      shrink();
      if (collides()) {
        compact(true);
        shrink();
      }
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fit);
    };

    schedule();
    const ro = new ResizeObserver(schedule);
    ro.observe(grid);
    const mo = new MutationObserver(schedule);
    for (const col of [left, nav, right])
      mo.observe(col, { subtree: true, childList: true, characterData: true });
    document.fonts?.ready.then(schedule);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      mo.disconnect();
    };
  }, [gridRef]);
}
