"use client";

/**
 * Last-resort error boundary.
 *
 * Catches failures in the ROOT layout itself — the one case
 * src/app/(site)/error.tsx cannot handle, because that boundary lives
 * inside the layout that has already failed. When this renders, the root
 * layout (and therefore <Header/>, <Footer/>, fonts and globals.css) is
 * NOT available, so this file must ship its own <html>/<body> and cannot
 * rely on Tailwind classes resolving. Styles are inlined deliberately —
 * brand colours are hardcoded to their hex values for that reason:
 *   pacific-dark #112732 / pacific-mid #9AA8B6 / pacific-light #DAE1E8
 *
 * Keep this file dependency-free. Importing shared components here risks
 * the import itself being what's broken.
 */

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#112732",
          color: "#ffffff",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          padding: "2rem",
        }}
      >
        <main style={{ maxWidth: "36rem" }}>
          <p
            style={{
              fontSize: "0.75rem",
              fontWeight: 500,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "#9AA8B6",
              margin: "0 0 1.5rem",
            }}
          >
            Unexpected error
          </p>

          <h1
            style={{
              fontSize: "clamp(2.25rem, 6vw, 4rem)",
              fontWeight: 300,
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
              margin: "0 0 1.5rem",
            }}
          >
            Something went wrong
          </h1>

          <p
            style={{
              fontSize: "1rem",
              fontWeight: 300,
              lineHeight: 1.7,
              color: "#9AA8B6",
              margin: "0 0 2.5rem",
            }}
          >
            The page could not be loaded. Please try again — if the problem
            persists, you can reach us directly and we&apos;ll help.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
            <button
              onClick={reset}
              style={{
                appearance: "none",
                cursor: "pointer",
                border: "1px solid #ffffff",
                borderRadius: "9999px",
                backgroundColor: "#ffffff",
                color: "#112732",
                padding: "0.875rem 1.75rem",
                fontSize: "0.75rem",
                fontWeight: 500,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Try again
            </button>

            <a
              href="/contact"
              style={{
                display: "inline-flex",
                alignItems: "center",
                border: "1px solid rgba(154,168,182,0.4)",
                borderRadius: "9999px",
                color: "#ffffff",
                textDecoration: "none",
                padding: "0.875rem 1.75rem",
                fontSize: "0.75rem",
                fontWeight: 500,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Contact us
            </a>
          </div>

          {error.digest && (
            <p
              style={{
                marginTop: "3rem",
                fontSize: "0.625rem",
                fontWeight: 500,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "rgba(154,168,182,0.6)",
              }}
            >
              Reference {error.digest}
            </p>
          )}
        </main>
      </body>
    </html>
  );
}
