import "server-only";

/**
 * Pacific's own certificates, read live from the shared "Certifications"
 * folder on Google Drive.
 *
 * Server-only on purpose: the Drive file IDs never reach the browser, so
 * the viewer cannot be turned into a link to the original PDFs. The
 * client knows only the short id ("nsf"), and every page it sees is a
 * watermarked image rendered by render.ts.
 *
 * The folder holds two uploads of most certificates (27 May 2025 and
 * 16 June) with identical byte sizes; the IDs below are the June copies.
 * To update a certificate, upload the new file over the old one in Drive
 * ("Manage versions") so the ID stays the same — the site picks it up
 * within the hour (REVALIDATE_SECONDS in render.ts). A new file with a
 * new ID needs its ID changed here.
 *
 * Greenguard has no certificate in the folder yet, so it is absent here
 * and its badge stays unclickable (see src/data/certifications.ts).
 */
export const CERTIFICATES = {
  nsf: {
    title: "NSF/ANSI 51 Certificate",
    driveFileId: "1CogLxY3L4eymAq7xkIFzMc2voJlgyd7x",
  },
  ce: {
    title: "CE Certificate",
    driveFileId: "1SFA2sdhtmr4tOSl88S3j57pCmDqbqGpO",
  },
  iso: {
    title: "ISO 9001:2015 Certificate",
    driveFileId: "1QKtahbNMj-CJDpPDH8JsQeIcAeDPCiDr",
  },
  kosher: {
    title: "Kosher Certificate",
    driveFileId: "1l_xxV_-64rTqJAy-7Hh0J1VLZc3bsxJ6",
  },
  epd: {
    title: "Environmental Product Declaration",
    driveFileId: "1fLBihfj9C6t4ACc1Ppi4iGAeYhOa4t2v",
  },
} as const;

export type CertificateId = keyof typeof CERTIFICATES;

/** Own-property check: `in` would also accept "toString" and friends. */
export function isCertificateId(value: string): value is CertificateId {
  return Object.hasOwn(CERTIFICATES, value);
}
