"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/** The ad tracking parameters a lead link carries on to the contact form. */
const TRACKING = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"];

/**
 * A link to the contact form that keeps the visitor's ad parameters (owner,
 * 2026-10-22: a quote button on the sills page to run ads to). A visitor
 * who lands on a page from an ad carries its utm_* (and gclid / fbclid) to
 * the form, which records them with the enquiry, so every lead says which
 * page and which campaign it came from.
 */
export function LeadLink({
  href,
  className,
  children,
  ...rest
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className" | "children">) {
  const [to, setTo] = useState(href);
  useEffect(() => {
    const here = new URLSearchParams(window.location.search);
    const [path, hash] = href.split("#");
    const [base, query] = path.split("?");
    const params = new URLSearchParams(query ?? "");
    for (const k of TRACKING) {
      const v = here.get(k);
      if (v && !params.has(k)) params.set(k, v);
    }
    const q = params.toString();
    setTo(`${base}${q ? `?${q}` : ""}${hash ? `#${hash}` : ""}`);
  }, [href]);
  return (
    <Link href={to} className={className} {...rest}>
      {children}
    </Link>
  );
}
