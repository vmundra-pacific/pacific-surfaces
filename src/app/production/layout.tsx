/**
 * /production — Embedded production dashboard.
 *
 * Lives OUTSIDE the (site) route group so it doesn't inherit the
 * marketing header/footer/chrome. The dashboard takes the full viewport.
 *
 * NOTE: this directory is the only addition to the Pacific Surfaces
 * codebase for the production dashboard. Nothing else in src/ or
 * next.config.ts has been modified. The dashboard itself is its own
 * Next.js app deployed separately; this layout just hosts it inside
 * an iframe at /production so users see it at pacificsurfaces.com/production.
 */
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Production Dashboard — Pacific Surfaces",
  description: "Internal production dashboard for PT quartz manufacturing.",
  robots: { index: false, follow: false },
};

export default function ProductionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
