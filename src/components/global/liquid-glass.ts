import type { CSSProperties } from "react";

/**
 * The site's liquid glass (owner, 2026-10-20): a light, saturated frost
 * with a bright rim and inner highlight, so the page shows through. Shared
 * by the homepage section dock and the support dock. Inline styles: the
 * bw-temp skin rewrites colour utilities.
 */
export const LIQUID_GLASS: CSSProperties = {
  background:
    "linear-gradient(160deg, rgba(255,255,255,0.55), rgba(255,255,255,0.28))",
  backdropFilter: "blur(18px) saturate(180%)",
  WebkitBackdropFilter: "blur(18px) saturate(180%)",
  border: "1px solid rgba(255,255,255,0.6)",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.85), inset 0 -1px 0 rgba(255,255,255,0.25), 0 10px 30px rgba(0,0,0,0.16)",
};

/** The filled tile inside the glass: the section dock's active section. */
export const GLASS_FILLED: CSSProperties = {
  color: "#ffffff",
  background: "rgba(20,20,15,0.88)",
  boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
};

/** Liquid glass tinted dark, for a card over a photograph with white copy
 *  (the Where to Buy card, after Cosentino's): a warm grey-brown smoke
 *  behind a strong blur, a bright rim and inner highlight. */
export const LIQUID_GLASS_DARK: CSSProperties = {
  background:
    "linear-gradient(160deg, rgba(108,98,92,0.66), rgba(62,55,51,0.62))",
  backdropFilter: "blur(26px) saturate(160%)",
  WebkitBackdropFilter: "blur(26px) saturate(160%)",
  border: "1px solid rgba(255,255,255,0.36)",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 0 rgba(255,255,255,0.12), 0 30px 80px -20px rgba(0,0,0,0.5)",
};
