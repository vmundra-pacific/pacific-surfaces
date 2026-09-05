/**
 * /production — Fullscreen iframe embed of the production dashboard.
 *
 * The dashboard is deployed as its own Next.js app (separate Vercel
 * project). This route just embeds it so internal users can reach it at
 * pacificsurfaces.com/production without leaving the main domain.
 *
 * Configure the dashboard URL with the env var:
 *   NEXT_PUBLIC_PRODUCTION_DASHBOARD_URL=https://your-dashboard.vercel.app
 *
 * Defaults to http://localhost:3000 for local development.
 */

const DASHBOARD_URL =
  process.env.NEXT_PUBLIC_PRODUCTION_DASHBOARD_URL || "http://localhost:3000";

export default function ProductionPage() {
  return (
    <iframe
      src={DASHBOARD_URL}
      title="Production Dashboard"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        border: 0,
        margin: 0,
        padding: 0,
        zIndex: 50,
        background: "#fafafa",
      }}
      // sandbox is intentionally permissive — the dashboard needs to set
      // its own auth cookies, run scripts, render forms, and submit edits
      // back to Airtable via its own API routes.
      allow="clipboard-read; clipboard-write"
    />
  );
}
