export const metadata = {
  title: "Pacific Surfaces — Studio",
  description: "Content management for Pacific Surfaces",
};

/**
 * Studio layout is a pass-through. The root layout at src/app/layout.tsx
 * already renders <html> and <body> — having this nested layout render
 * its own pair caused a hydration mismatch (the body className from the
 * root layout vs. the inline `style={{ margin: 0 }}` here).
 *
 * Tailwind's Preflight already resets body margin to 0 site-wide, so
 * we don't need to set it explicitly for the studio. If we ever need
 * studio-specific layout overrides, do them on a wrapping <div>, not
 * on a nested <body>.
 */
export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
