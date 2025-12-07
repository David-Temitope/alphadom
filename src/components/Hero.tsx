import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Leaf, Shield, Recycle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAdminSettings } from '@/hooks/useAdminSettings';

export const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { settings } = useAdminSettings();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % settings.hero_images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [settings.hero_images.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % settings.hero_images.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + settings.hero_images.length) % settings.hero_images.length);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-blue-50 to-slate-50">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-green-100/20 to-blue-100/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-8 sm:py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Slider First on Mobile */}
          <div className="relative order-1 lg:order-2">
            <div className="relative z-10 h-64 sm:h-96 lg:h-[500px] overflow-hidden rounded-2xl shadow-2xl">
              {settings.hero_images.map((image, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
                    index === currentSlide ? 'translate-x-0' :
                    index < currentSlide ? '-translate-x-full' : 'translate-x-full'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Hero slide ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}

              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-200"
              >
                <ChevronLeft className="w-5 h-5 text-slate-700" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-200"
              >
                <ChevronRight className="w-5 h-5 text-slate-700" />
              </button>

              {/* Dots Indicator */}
              <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                {settings.hero_images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      index === currentSlide ? 'bg-white shadow-lg' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="absolute -inset-4 bg-gradient-to-r from-green-200/30 to-blue-200/30 rounded-3xl blur-xl pointer-events-none"></div>
          </div>

          {/* Text Content */}
          <div className="space-y-6 order-2 lg:order-1 text-center lg:text-left">
            <div className="inline-flex items-center px-3 py-1 bg-green-100/80 text-green-700 rounded-full text-xs sm:text-sm font-medium backdrop-blur-sm border border-green-200/50 mb-4 justify-center lg:justify-start">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              {settings.site_description}
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-slate-800 leading-tight">
              {settings.hero_title || settings.site_name}{' '}
              <span className="block bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                {settings.hero_main_text || 'Store'}
              </span>{' '}
              {settings.hero_secondary_text || 'for Modern Living'}
            </h1>

            <p className="text-base sm:text-xl text-slate-600 leading-relaxed max-w-md sm:max-w-lg mx-auto lg:mx-0">
              {settings.hero_subtitle || 'Discover high-quality products that combine style, functionality, and reliability for your everyday needs.'}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                asChild
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 sm:py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <Link to="/products" className="flex items-center justify-center sm:justify-start">
                  Shop Now
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-3 sm:py-4 text-lg rounded-xl backdrop-blur-sm bg-white/80"
              >
                <Link to="/about">Learn More</Link>
              </Button>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 pt-6">
              <div className="text-center group">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 group-hover:bg-green-200 transition-colors duration-200">
                  <Leaf className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-xs sm:text-sm font-medium text-slate-700">100% Eco-Friendly</p>
              </div>

              <div className="text-center group">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 group-hover:bg-blue-200 transition-colors duration-200">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-xs sm:text-sm font-medium text-slate-700">Quality Guaranteed</p>
              </div>

              <div className="text-center group">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 group-hover:bg-green-200 transition-colors duration-200">
                  <Recycle className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-xs sm:text-sm font-medium text-slate-700">Sustainable Impact</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
