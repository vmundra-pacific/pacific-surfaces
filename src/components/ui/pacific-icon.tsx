/**
 * PacificIcon — just the diamond/flag monogram (no wordmark), extracted
 * as a clean vector from the official logo lockup PDF. Renders via
 * fill="currentColor" so the surrounding element's text color controls
 * the mark's color — no separate white/dark/navy image files to keep
 * in sync, no crossfade-between-images flicker.
 *
 * Used in the header, where "PACIFIC" / "SURFACES" render as real HTML
 * text next to it (kept separate from this icon so the wordmark can be
 * hidden at narrower breakpoints without needing a second SVG).
 */
export function PacificIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="125.96 228.27 139.51 138.89"
      className={className}
      aria-hidden="true"
    >
      <path transform="matrix(1,0,0,-1,197.2847,361.1673)" d="M0 0-15.374 15.234-17.31 17.222-13.211 30.899C7.054 34.21 28.437 45.096 45.226 56.78 49.988 60.094 54.095 63.503 58.519 67.481L62.18 64.103 54.581 56.323 19.49 20.142 2.611 2.711Z" fill="currentColor"/>
    <path transform="matrix(1,0,0,-1,190.6717,307.9783)" d="M0 0 5.52 18.351-15.945 18.35-23.779-9.613-26.996-20.633-58.714 10.767-44.038 25.819 39.956 25.837 42.499 22.686C40.308 20.548 38.296 18.894 35.794 17.227 27.7 11.833 19.174 7.468 10.159 3.797 6.816 2.4 4.018 1.249 0 0" fill="currentColor"/>
    <path transform="matrix(1,0,0,-1,224.3327,263.42)" d="M0 0-56.664 .041-39.398 17.975-28.681 29.147-13.605 13.894Z" fill="currentColor"/>
    </svg>
  );
}
