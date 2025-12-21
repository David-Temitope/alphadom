import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAdminSettings } from '@/hooks/useAdminSettings';
import { useAuth } from '@/contexts/AuthContext';
import { useUserTypes } from '@/hooks/useUserTypes';
import { useShopApplications } from '@/hooks/useShopApplications';
import { ArrowRight, Leaf, Shield, Recycle, ChevronLeft, ChevronRight, Store } from 'lucide-react';

// Default hero images for guests/fallback
import heroDefault1 from '@/assets/hero-default-1.jpg';
import heroDefault2 from '@/assets/hero-default-2.jpg';

const DEFAULT_HERO_IMAGES = [heroDefault1, heroDefault2];

// Fixed guest hero content - never flashes or waits for settings
const GUEST_HERO_TITLE = "Your Online";
const GUEST_HERO_MAIN_TEXT = "Marketplace";
const GUEST_HERO_SECONDARY_TEXT = "Shop Smart, Save Big";
const GUEST_HERO_SUBTITLE = "Discover amazing deals from verified vendors. Join thousands of buyers and sellers on Africa's growing e-commerce platform!";

export const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { settings } = useAdminSettings();
  const { user } = useAuth();
  const { hasUserType } = useUserTypes();
  const { userApplication } = useShopApplications();

  // For guests: ALWAYS use fixed defaults immediately (no flash)
  // For logged-in users: use admin settings or defaults as fallback
  const isGuest = !user;
  const heroImages = isGuest 
    ? DEFAULT_HERO_IMAGES 
    : (settings.hero_images.length > 0 ? settings.hero_images : DEFAULT_HERO_IMAGES);

  // Use fixed text for guests, admin settings for logged-in users
  const heroTitle = isGuest ? GUEST_HERO_TITLE : (settings.hero_title || GUEST_HERO_TITLE);
  const heroMainText = isGuest ? GUEST_HERO_MAIN_TEXT : (settings.hero_main_text || GUEST_HERO_MAIN_TEXT);
  const heroSecondaryText = isGuest ? GUEST_HERO_SECONDARY_TEXT : (settings.hero_secondary_text || GUEST_HERO_SECONDARY_TEXT);
  const heroSubtitle = isGuest ? GUEST_HERO_SUBTITLE : (settings.hero_subtitle || GUEST_HERO_SUBTITLE);

  // Slide auto-advance effect
  useEffect(() => {
    if (heroImages.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [heroImages.length]);

  // Manual slide controls
  const nextSlide = () => {
    if (heroImages.length <= 1) return;
    setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  };

  const prevSlide = () => {
    if (heroImages.length <= 1) return;
    setCurrentSlide(
      (prev) => (prev - 1 + heroImages.length) % heroImages.length
    );
  };

  // Show "Start Selling" button only for logged-in users who aren't vendors/dispatchers/applicants
  // Show "Start Selling" button only for logged-in users who aren't approved vendors/dispatchers
  // Still show if they have a rejected application so they can reapply
  const showStartSelling = user && !hasUserType('vendor') && !hasUserType('dispatch') && 
    (!userApplication || userApplication.status === 'rejected');

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-blue-50 to-slate-50 min-h-[90vh] flex items-center pb-16">

      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-green-100/20 to-blue-100/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">

              {/* Site Description Badge */}
              <div className="inline-flex items-center px-4 py-2 bg-green-100/80 text-green-700 rounded-full text-sm font-medium backdrop-blur-sm border border-green-200/50">
                <Shield className="w-4 h-4 mr-2" />
                Buy & Sell Online with Ease
              </div>

              {/* Hero Title */}
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-800 leading-tight">
                {settings.hero_title || settings.site_name}
                <span className="block bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  {settings.hero_main_text || "Store"}
                </span>
                {settings.hero_secondary_text || "for Modern Living"}
              </h1>

              {/* Hero Subtitle */}
              <p className="text-xl text-slate-600 leading-relaxed max-w-lg">
                {heroSubtitle}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <Link to="/products" className="flex items-center">
                  Shop Now
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              </Button>

              {/* Show "Start Selling" for logged-in users who aren't vendors/dispatchers/applicants */}
              {showStartSelling ? (
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-green-300 text-green-700 hover:bg-green-50 px-8 py-4 text-lg rounded-xl backdrop-blur-sm bg-white/80"
                >
                  <Link to="/user-types" className="flex items-center">
                    <Store className="mr-2 w-5 h-5" />
                    Start Selling
                  </Link>
                </Button>
              ) : (
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-4 text-lg rounded-xl backdrop-blur-sm bg-white/80"
                >
                  <Link to="/about">Learn More</Link>
                </Button>
              )}
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center group">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-green-200 transition-colors duration-200">
                  <Leaf className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-sm font-medium text-slate-700">Great Deals</p>
              </div>

              <div className="text-center group">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-200 transition-colors duration-200">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-slate-700">Verified Vendors</p>
              </div>

              <div className="text-center group">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-green-200 transition-colors duration-200">
                  <Recycle className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-sm font-medium text-slate-700">Fast Delivery</p>
              </div>
            </div>
          </div>

          {/* Right Hero Image / Slider - Always show (uses defaults for guests) */}
          <div className="relative">
            <div className="relative z-10 h-96 lg:h-[500px] overflow-hidden rounded-2xl shadow-2xl">
              <div className="relative w-full h-full">
                {heroImages.map((image, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
                      index === currentSlide
                        ? 'translate-x-0'
                        : index < currentSlide
                        ? '-translate-x-full'
                        : 'translate-x-full'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Hero slide ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading={index === 0 ? "eager" : "lazy"}
                      decoding="async"
                      fetchPriority={index === 0 ? "high" : "low"}
                    />
                  </div>
                ))}

                {/* Navigation Arrows - Only show if multiple images */}
                {heroImages.length > 1 && (
                  <>
                    <button
                      onClick={prevSlide}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-200"
                    >
                      <ChevronLeft className="w-5 h-5 text-slate-700" />
                    </button>
                    <button
                      onClick={nextSlide}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-200"
                    >
                      <ChevronRight className="w-5 h-5 text-slate-700" />
                    </button>

                    {/* Dots Indicator */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                      {heroImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentSlide(index)}
                          className={`w-3 h-3 rounded-full transition-all duration-200 ${
                            index === currentSlide ? 'bg-white shadow-lg' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="absolute -inset-4 bg-gradient-to-r from-green-200/30 to-blue-200/30 rounded-3xl blur-xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};