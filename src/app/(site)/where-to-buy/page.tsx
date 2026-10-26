import type { Metadata } from "next";
import { cookies } from "next/headers";
import { BreadcrumbList } from "@/components/global/JsonLd";
import { WhereToBuy } from "@/components/where-to-buy/WhereToBuy";
import { phoneVerificationEnabled } from "@/lib/phone-verification";
import { DEALERS } from "@/lib/where-to-buy-dealers";
import { ACCESS_COOKIE, hasAccess } from "@/lib/where-to-buy-access";

/**
 * Where to Buy: dealers, distributors and studios that show Pacific
 * Surfaces. Pilot: Bengaluru, from src/data/dealers-bangalore.json
 * (regenerate with scripts/build-dealers-bangalore.py).
 *
 * The outlets are shown only after the visitor leaves their details
 * (marketing, 2026-10-26), so they are not in this page's HTML for anyone
 * else: no Store list in the structured data, and the list is rendered
 * only for a browser holding the access cookie that
 * /api/where-to-buy/lead sets. Reading the cookie makes the page dynamic.
 */

const TITLE =
  "Where to Buy Pacific Surfaces Quartz & Granite | Dealers in Bengaluru";
const DESCRIPTION = `Find Pacific Surfaces dealers, distributors and kitchen and interior studios in Bengaluru: ${DEALERS.length} outlets by area and PIN code, with directions, phone numbers and what is on display.`;

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
      <WhereToBuy
        initialDealers={unlocked ? DEALERS : null}
        otp={phoneVerificationEnabled()}
      />
    </>
  );
}
