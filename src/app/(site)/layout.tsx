import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { WhatsAppFAB } from "@/components/ui/whatsapp-fab";
import SmoothScrollProvider from "@/components/providers/SmoothScroll";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SmoothScrollProvider>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <WhatsAppFAB />
    </SmoothScrollProvider>
  );
}
