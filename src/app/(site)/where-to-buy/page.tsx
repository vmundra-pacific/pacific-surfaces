import type { Metadata } from "next";
import { cookies } from "next/headers";
import { BreadcrumbList } from "@/components/global/JsonLd";
import { WhereToBuy } from "@/components/where-to-buy/WhereToBuy";
import { phoneVerificationEnabled } from "@/lib/phone-verification";
import { ACCESS_COOKIE, hasAccess } from "@/lib/where-to-buy-access";

/**
 * Where to Buy: dealers, distributors and studios that show Pacific
 * Surfaces across India, from src/data/dealers-india.json (regenerate
 * with scripts/build-dealers-india.py from the all-regions master).
 *
 * The outlets are shown only after the visitor leaves their details, and
 * then only the nearest few for each search (marketing, 2026-10-26), so
 * the directory is never in this page: no Store list in the structured
 * data, no count, and no outlets in the HTML. A browser holding the access
 * cookie that /api/where-to-buy/lead sets is told so, and its searches go
 * to /api/where-to-buy/search. Reading the cookie makes the page dynamic.
 */

const TITLE =
  "Where to Buy Pacific Surfaces Quartz & Granite | Dealers in India";
const DESCRIPTION =
  "Find Pacific Surfaces dealers, distributors and kitchen and interior studios across India by city, area and PIN code, with directions and what is on display.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/where-to-buy" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/where-to-buy",
  },
};

export default async function WhereToBuyPage() {
  const unlocked = hasAccess((await cookies()).get(ACCESS_COOKIE)?.value);
  return (
    <>
      <BreadcrumbList
        items={[
          { name: "Home", url: "/" },
          { name: "Where to buy", url: "/where-to-buy" },
        ]}
      />
      <WhereToBuy unlocked={unlocked} otp={phoneVerificationEnabled()} />
    </>
  );
}
