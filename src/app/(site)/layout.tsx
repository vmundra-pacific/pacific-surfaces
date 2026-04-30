import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { WhatsAppFAB } from "@/components/ui/whatsapp-fab";
import SmoothScrollProvider from "@/components/providers/SmoothScroll";
import SiteSplashScreen from "@/components/global/SiteSplashScreen";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SmoothScrollProvider>
      {/* Brand video splash — shown once per tab session while the
          page boots. Sits on top of everything via fixed z-[100]. */}
      <SiteSplashScreen />
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <WhatsAppFAB />
    </SmoothScrollProvider>
  );
}
