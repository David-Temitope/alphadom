import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useUserTypes } from '@/hooks/useUserTypes';
import { useShopApplications } from '@/hooks/useShopApplications';
import { useAdminSettings } from '@/hooks/useAdminSettings';
import { ArrowRight, CheckCircle, Shield, Truck, ChevronLeft, ChevronRight, Star } from 'lucide-react';

// Default hero images for fallback
import heroDefault1 from '@/assets/hero-default-1.jpg';
import heroDefault2 from '@/assets/hero-default-2.jpg';

const DEFAULT_HERO_IMAGES = [heroDefault1, heroDefault2];

export const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { user } = useAuth();
  const { hasUserType } = useUserTypes();
  const { userApplication } = useShopApplications();
  const { settings, loading: settingsLoading } = useAdminSettings();

  // Use admin settings images if available, otherwise use defaults
  const heroImages = settings.hero_images && settings.hero_images.length > 0 
    ? settings.hero_images 
    : DEFAULT_HERO_IMAGES;

  // Slide auto-advance effect
  useEffect(() => {
    if (heroImages.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [heroImages.length]);

  const nextSlide = () => {
    if (heroImages.length <= 1) return;
    setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  };

  const prevSlide = () => {
    if (heroImages.length <= 1) return;
    setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  const showStartSelling = user && !hasUserType('vendor') && !hasUserType('dispatch') && 
    (!userApplication || userApplication.status === 'rejected');

  return (
    <section className="relative bg-background overflow-hidden">
      <div className="container mx-auto px-4 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-full text-sm font-medium">
              <CheckCircle className="w-4 h-4" />
              {settings.hero_secondary_text || "Genesis of Trustworthy Commerce"}
            </div>

            {/* Hero Title - Admin controlled */}
            <div className="space-y-2">
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                {settings.hero_title}
              </h1>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                <span className="text-gradient">{settings.hero_main_text}</span>
              </h1>
            </div>

            {/* Subtitle - Admin controlled */}
            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
              {settings.hero_subtitle}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 rounded-xl font-semibold group"
              >
                <Link to="/products" className="flex items-center gap-2">
                  Shop Now
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>

              {showStartSelling ? (
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-border hover:bg-secondary px-8 rounded-xl font-semibold"
                >
                  <Link to="/become-a-vendor">Become a Seller</Link>
                </Button>
              ) : (
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-border hover:bg-secondary px-8 rounded-xl font-semibold"
                >
                  <Link to="/about">Learn More</Link>
                </Button>
              )}
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-6 pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span>Great Deals</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-5 h-5 text-primary" />
                <span>Verified Sellers</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Truck className="w-5 h-5 text-primary" />
                <span>Reliable Delivery</span>
              </div>
            </div>
          </div>

          {/* Right Hero Image */}
          <div className="relative">
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-card bg-secondary aspect-square lg:aspect-[4/3]">
              {/* Rating Badge */}
              <div className="absolute top-4 right-4 z-20 bg-background/95 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-soft">
                <Star className="w-4 h-4 fill-primary text-primary" />
                <span className="text-sm font-semibold">Top Rated</span>
              </div>

              {/* Images */}
              <div className="relative w-full h-full">
                {heroImages.map((image, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-500 ${
                      index === currentSlide ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Hero slide ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading={index === 0 ? "eager" : "lazy"}
                    />
                  </div>
                ))}
              </div>

              {/* Navigation */}
              {heroImages.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/90 hover:bg-background rounded-full flex items-center justify-center shadow-soft transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/90 hover:bg-background rounded-full flex items-center justify-center shadow-soft transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {/* Dots */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {heroImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentSlide 
                            ? 'bg-primary w-6' 
                            : 'bg-background/60'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
