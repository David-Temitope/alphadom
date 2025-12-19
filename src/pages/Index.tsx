import { Hero } from "@/components/Hero";
import { FeaturedProducts } from "@/components/FeaturedProducts";
import { About } from "@/components/About";
import { NewsletterSubscription } from "@/components/NewsletterSubscription";
import { PlatformAd } from "@/components/PlatformAd";
import { WelcomeCard } from "@/components/WelcomeCard";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <FeaturedProducts />
      <About />
      
      {/* Newsletter Section */}
      <section className="py-16 px-4">
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