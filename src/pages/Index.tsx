
import { Hero } from "@/components/Hero";
import { FeaturedProducts } from "@/components/FeaturedProducts";
import { About } from "@/components/About";
import { NewsletterSubscription } from "@/components/NewsletterSubscription";
import { PlatformAd } from "@/components/PlatformAd";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <FeaturedProducts />
      
      {/* Featured Ad Section */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <PlatformAd targetPage="home" />
        </div>
      </section>
      
      <About />
      
      {/* Newsletter Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-2xl">
          <NewsletterSubscription />
        </div>
      </section>
    </div>
  );
};

export default Index;
