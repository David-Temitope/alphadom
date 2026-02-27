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
    title: "Buy & Sell Products Online in Nigeria",
    description: "Alphadom is Nigeria's trusted online marketplace. Buy affordable fashion, electronics, phones, laptops, books & essentials from verified vendors with fast nationwide delivery.",
    url: "/",
    keywords: "buy online Nigeria, online shopping, cheap phones Nigeria, buy clothes online, electronics Nigeria, affordable fashion, trusted vendors, nationwide delivery, e-commerce Nigeria, Alphadom, buy and sell online, best deals Nigeria, online marketplace Nigeria",
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "name": "Alphadom",
          "url": "https://alphadom.online",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://alphadom.online/products?search={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        },
        {
          "@type": "OnlineStore",
          "name": "Alphadom",
          "url": "https://alphadom.online",
          "description": "Nigeria's trusted online marketplace for affordable products from verified vendors.",
          "currenciesAccepted": "NGN",
          "paymentAccepted": "Credit Card, Bank Transfer, Paystack",
          "areaServed": { "@type": "Country", "name": "Nigeria" }
        },
        {
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "How do I buy products on Alphadom?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Browse our products, add items to your cart, and checkout securely with Paystack or bank transfer. We deliver nationwide across Nigeria."
              }
            },
            {
              "@type": "Question",
              "name": "How do I become a vendor on Alphadom?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Visit our 'Become a Vendor' page, fill out the application form with your store details, and our team will review and approve your application."
              }
            },
            {
              "@type": "Question",
              "name": "Is Alphadom safe for online shopping?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes! Alphadom verifies all vendors, uses secure payment processing via Paystack, and offers buyer protection with our refund and dispute policies."
              }
            }
          ]
        }
      ]
    },
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
