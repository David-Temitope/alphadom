import { Hero } from "@/components/Hero";
import { TrendingCategories } from "@/components/TrendingCategories";
import { FeaturedProducts } from "@/components/FeaturedProducts";
import { FlashSales } from "@/components/FlashSales";
import { TopVendors } from "@/components/TopVendors";
import { About } from "@/components/About";
import { NewsletterSubscription } from "@/components/NewsletterSubscription";
import { PlatformAd } from "@/components/PlatformAd";
import { WelcomeCard } from "@/components/WelcomeCard";
import { MobileHomepage } from "@/components/MobileHomepage";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSEO } from "@/hooks/useSEO";

const Index = () => {
  const isMobile = useIsMobile();

  useSEO({
    title: "Alphadom - Your #1 Online Marketplace",
    description: "Buy and sell quality products on Alphadom. From fashion to electronics, find the best deals from trusted vendors nationwide.",
    url: "/",
  });

  // Render mobile-specific layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        <MobileHomepage />
        <PlatformAd targetPage="home" />
        <WelcomeCard />
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <TrendingCategories />
      <FeaturedProducts />
      <FlashSales />
      <TopVendors />
      <About />
      
      {/* Newsletter Section */}
      <section className="py-16 px-4 bg-background">
        <div className="container mx-auto max-w-2xl">
          <NewsletterSubscription />
        </div>
      </section>
      
      {/* Floating Ad */}
      <PlatformAd targetPage="home" />
      
      {/* Welcome Card for new users */}
      <WelcomeCard />
    </div>
  );
};

export default Index;
