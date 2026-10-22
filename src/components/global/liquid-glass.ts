import type { CSSProperties } from "react";

/**
 * The site's liquid glass (owner, 2026-10-20): a light, saturated frost
 * with a bright rim and inner highlight, so the page shows through. Shared
 * by the homepage section dock and the support dock. Inline styles: the
 * bw-temp skin rewrites colour utilities.
 */
export const LIQUID_GLASS: CSSProperties = {
  background: "linear-gradient(160deg, rgba(255,255,255,0.55), rgba(255,255,255,0.28))",
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
