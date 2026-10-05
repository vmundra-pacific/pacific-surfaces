/**
 * Certifications — one shared source of truth for the marks shown on the
 * homepage TrustStrip and on every product page.
 *
 * A badge with `viewable: true` opens Pacific's own certificate in the
 * view-only CertificateViewer, read live from the certificates folder on
 * Google Drive. The Drive file IDs are deliberately NOT here — this module
 * ships to the browser — they live server-side in
 * src/lib/certificates/registry.ts.
 *
 * `viewable: false` renders the badge without any click action. That is
 * Greenguard for now: there is no Greenguard certificate in the folder
 * yet. Add the file to the folder and its ID to the registry, then flip
 * this flag.
 */
export interface CertificationLink {
  /** Matches the badge title rendered on the strip. */
  id: "nsf" | "greenguard" | "ce" | "iso" | "kosher" | "epd";
  /** Whether a certificate is on file to open in the viewer. */
  viewable: boolean;
  /** Accessible name for the badge's action. */
  label: string;
}

export const CERTIFICATION_LINKS: Record<
  CertificationLink["id"],
  CertificationLink
> = {
  nsf: { id: "nsf", viewable: true, label: "View the NSF/ANSI 51 certificate" },
  greenguard: {
    id: "greenguard",
    viewable: false,
    label: "Greenguard Gold certified",
  },
  ce: { id: "ce", viewable: true, label: "View the CE certificate" },
  iso: { id: "iso", viewable: true, label: "View the ISO 9001:2015 certificate" },
  kosher: { id: "kosher", viewable: true, label: "View the Kosher certificate" },
  epd: {
    id: "epd",
    viewable: true,
    label: "View the Environmental Product Declaration",
  },
};
