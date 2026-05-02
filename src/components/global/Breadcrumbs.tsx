import Link from "next/link";

/**
 * Visible breadcrumb trail. Mirrors whatever items you pass to the
 * <BreadcrumbList> JSON-LD component on the same page so Google sees
 * matching visible + structured data — that pairing is what unlocks
 * the breadcrumb-style URL display in SERPs.
 *
 * Two visual variants:
 *   - light  → use on cream / warm-tone pages (PDP, blog post)
 *   - dark   → use on navy / dark hero overlays
 *
 * Last item is rendered as plain text (the user is already on it),
 * earlier items are real <Link>s.
 */

export interface BreadcrumbItem {
  name: string;
  url: string;
}

const SEPARATOR = "·";

export function Breadcrumbs({
  items,
  variant = "light",
  className = "",
}: {
  items: BreadcrumbItem[];
  variant?: "light" | "dark";
  className?: string;
}) {
  if (!items || items.length === 0) return null;

  const colors =
    variant === "dark"
      ? {
          link: "text-white/60 hover:text-white",
          current: "text-white",
          sep: "text-white/30",
        }
      : {
          link: "text-stone-500 hover:text-[#112732]",
          current: "text-[#112732]",
          sep: "text-stone-400",
        };

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] tracking-[0.18em] uppercase font-medium">
        {items.map((it, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${it.name}-${i}`} className="flex items-center gap-x-2">
              {isLast ? (
                <span className={colors.current} aria-current="page">
                  {it.name}
                </span>
              ) : (
                <Link
                  href={it.url}
                  className={`${colors.link} transition-colors`}
                >
                  {it.name}
                </Link>
              )}
              {!isLast && (
                <span aria-hidden="true" className={colors.sep}>
                  {SEPARATOR}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
