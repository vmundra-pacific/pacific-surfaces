import { redirect } from "next/navigation";

/**
 * Catch-all 404 handler.
 *
 * Any URL that doesn't match a real route in the app is sent here by
 * Next.js. Instead of rendering a "Not Found" page, we redirect the
 * visitor to the homepage so legacy Wix URLs and mistyped paths land
 * somewhere useful rather than a dead end.
 *
 * Trade-off worth knowing: search engines treat redirect-to-homepage
 * as a "soft 404" and may eventually drop those URLs from the index.
 * For a fresh migration that's the desired behaviour — the old URLs
 * shouldn't be indexed under the new site anyway. If you ever want
 * proper 404s back, replace this with a real UI and remove the
 * redirect call.
 */
export default function NotFound() {
  redirect("/");
}
