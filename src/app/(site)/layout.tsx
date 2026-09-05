import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { WhatsAppFAB } from "@/components/ui/whatsapp-fab";
import SmoothScrollProvider from "@/components/providers/SmoothScroll";
import { CartProvider } from "@/lib/cart";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <SmoothScrollProvider>
        {/* No brand splash here. The homepage hero already shows a
          loading screen while it preloads its parallax frames, and the
          splash was gated on the same `pacific:hero-ready` event that
          dismisses it — so the two always played in sequence and the
          5.4s welcome video was pure waiting after the page was ready.
          See components/sections/HeroScrollCanvas for the one that
          remains. SiteSplashScreen.tsx is deleted; recover it from git
          if the brand moment is wanted back. */}
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <WhatsAppFAB />
      </SmoothScrollProvider>
    </CartProvider>
  );
}
