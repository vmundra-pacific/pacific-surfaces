export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-03-28";

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  "Missing environment variable: NEXT_PUBLIC_SANITY_DATASET"
);

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  "Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID"
);

/**
 * Server-only token used for READING content.
 *
 * Deliberately NOT prefixed with NEXT_PUBLIC_ — it must never reach the
 * browser. It is only ever referenced from server components, route
 * handlers and build-time scripts (client.ts imports `server-only`, so a
 * `"use client"` module importing it is a build error).
 *
 * Why this exists: the read clients were previously tokenless, which
 * requires the dataset to be world-readable. That meant anyone holding
 * `projectId` + `dataset` — both shipped to every browser via
 * NEXT_PUBLIC_* — could query the dataset directly and read customer
 * password hashes, job applications, contact submissions and every
 * other document, completely bypassing the app's authorization checks.
 *
 * Setting this variable lets the dataset be flipped to PRIVATE while
 * the site keeps rendering. It is optional so that nothing breaks
 * before the dataset is locked down: while the dataset is still public
 * the token is simply unused, and once it's private the same code path
 * starts authenticating. Grant it Viewer/read permission only — never a
 * write role.
 *
 * Before the dataset is set to Private it must be on Vercel for
 * Production AND Preview: pages are also rendered at build time, so a
 * build without it fails on a private dataset. The form routes read and
 * write with SANITY_API_WRITE_TOKEN, and Studio uses each editor's own
 * login, so neither depends on this token.
 */
export const readToken = process.env.SANITY_API_READ_TOKEN;

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage);
  }
  return v;
}
