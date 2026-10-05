import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { auth } from "@/auth";
import LoginForm from "@/components/customer/LoginForm";
import { PacificLogoMark } from "@/components/ui/pacific-logo-mark";

export const metadata: Metadata = {
  title: "Sign in — Customer Care Portal | Pacific Surfaces",
};

/* The sales team's way in: the org's Salesforce login. Falls back to the
   generic login host so the link is never dead if the env var isn't set;
   point NEXT_PUBLIC_SALESFORCE_LOGIN_URL at the org's My Domain to skip it. */
const SALESFORCE_LOGIN_URL =
  process.env.NEXT_PUBLIC_SALESFORCE_LOGIN_URL ?? "https://login.salesforce.com";

/** What one portal login covers, named across the top of the card. */
const PORTAL_PARTS = ["Customer Care", "Service requests", "Your profile"];

/**
 * Customer Care Portal sign-in, laid out after Cosentino's: a white card
 * centred over an application photograph, the portal's parts named in a
 * dark strip across its top, and the employee route set below the card.
 *
 * This page sits OUTSIDE the portal's dark theme (see customer/layout.tsx)
 * and leans on the site skin instead: copy on the white card reads black,
 * and the blocks over the photograph carry `data-over-media` to stay white.
 * The photograph is a fixed sibling of the card, never its ancestor — the
 * skin turns every line of text inside a block that holds a photo white,
 * which would blank the card.
 */
export default async function CustomerLoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/customer/dashboard");
  }

  return (
    <main className="relative flex min-h-[100svh] flex-col items-center justify-center px-4 py-16">
      <div aria-hidden="true" className="fixed inset-0">
        <Image
          src="/images/india-home/taj-vein-kitchen.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/25" />
      </div>

      <div className="relative w-full max-w-[556px] shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
        <div
          data-over-media
          className="flex items-center justify-center gap-2.5 bg-[#1b1b19] px-4 py-4 text-[13px] font-light text-white sm:gap-4 sm:px-6 sm:text-[15px]"
        >
          {PORTAL_PARTS.map((part, i) => (
            <span key={part} className="flex items-center gap-2.5 whitespace-nowrap sm:gap-4">
              {i > 0 && <span aria-hidden="true" className="block h-px w-5 bg-white/60 sm:w-10" />}
              {part}
            </span>
          ))}
        </div>

        <div className="bg-white">
          <div className="flex items-center justify-between gap-4 border-b border-black/15 px-6 py-5 sm:px-8">
            <Link href="/" aria-label="Pacific Surfaces home">
              <PacificLogoMark className="h-9 w-auto text-[#14140f]" />
            </Link>
            <span className="text-right text-[13px] text-black/60 sm:text-sm">Customer Care Portal</span>
          </div>

          <LoginForm />
        </div>
      </div>

      {/* The sales team signs in to Salesforce, not to this portal: the form
          above authenticates a CUSTOMER against the Sanity `customer`
          collection, and a Salesforce session here would have no customer
          `_id` for the /customer/* pages to read. So this stays a plain
          outbound link. */}
      <a
        data-over-media
        href={SALESFORCE_LOGIN_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="relative mt-8 inline-flex items-center gap-1 text-[15px] font-medium text-white underline-offset-4 hover:underline"
      >
        Pacific Surfaces employee access
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </a>
    </main>
  );
}
