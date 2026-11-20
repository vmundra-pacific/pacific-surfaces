import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { SupportDock } from "@/components/global/SupportDock";
import SmoothScrollProvider from "@/components/providers/SmoothScroll";
import MotionPrefs from "@/components/providers/MotionPrefs";
import { CartProvider } from "@/lib/cart";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <SmoothScrollProvider>
        <MotionPrefs>
          {/* No brand splash here. The homepage hero already shows a
          loading screen while it preloads its parallax frames, and the
          splash was gated on the same `pacific:hero-ready` event that
          dismisses it — so the two always played in sequence and the
          5.4s welcome video was pure waiting after the page was ready.
          See components/sections/HeroScrollCanvas for the one that
          remains. SiteSplashScreen.tsx is deleted; recover it from git
          if the brand moment is wanted back. */}
          {/* First stop for keyboard and screen-reader users: jumps past the
            header and its mega menus (WCAG 2.4.1). Hidden until focused. */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[1000] focus:rounded-full focus:bg-white focus:px-5 focus:py-3 focus:text-xs focus:font-medium focus:uppercase focus:tracking-[0.1em] focus:text-pacific-dark focus:shadow-lg focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-pacific-dark"
          >
            Skip to main content
          </a>
          <Header />
          <main
            id="main-content"
            tabIndex={-1}
            className="min-h-screen outline-none"
          >
            {children}
          </main>
          <Footer />
          {/* WhatsApp, call, email and a quick enquiry on every page (owner,
            2026-10-22), in place of the lone WhatsApp button. */}
          <SupportDock />
        </MotionPrefs>
      </SmoothScrollProvider>
    </CartProvider>
  );
}
