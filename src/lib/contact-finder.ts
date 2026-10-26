/**
 * The partner finder in the /contact hero; off for now (owner, 2026-10-05).
 *
 * Kept out of ContactContent (a client component) so the server page can
 * read it as well: while the finder is off, /contact neither fetches the
 * Sanity dealer roster nor sends it to the browser, where anyone could
 * read it (marketing, 2026-10-26: dealer details only after a lead form).
 */
export const SHOW_FINDER = false;
