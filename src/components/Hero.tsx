
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
    <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-blue-50 to-slate-50 min-h-[90vh] flex items-center pb-16">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-green-100/20 to-blue-100/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center px-4 py-2 bg-green-100/80 text-green-700 rounded-full text-sm font-medium backdrop-blur-sm border border-green-200/50">
                <Shield className="w-4 h-4 mr-2" />
                {settings.site_description}
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-800 leading-tight">
                {settings.hero_title || settings.site_name}
                <span className="block bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  {settings.hero_main_text || "Store"}
                </span>
                {settings.hero_secondary_text || "for Modern Living"}
              </h1>
              
              <p className="text-xl text-slate-600 leading-relaxed max-w-lg">
                {settings.hero_subtitle || "Discover high-quality products that combine style, functionality, and reliability for your everyday needs."}
              </p>
            </div>
            
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
              
              <Button 
                asChild 
                variant="outline" 
                size="lg"
                className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-4 text-lg rounded-xl backdrop-blur-sm bg-white/80"
              >
                <Link to="/about">Learn More</Link>
              </Button>
            </div>
            
            {/* Feature highlights */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center group">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-green-200 transition-colors duration-200">
                  <Leaf className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-sm font-medium text-slate-700">100% Eco-Friendly</p>
              </div>
              
              <div className="text-center group">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-200 transition-colors duration-200">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-slate-700">Quality Guaranteed</p>
              </div>
              
              <div className="text-center group">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-green-200 transition-colors duration-200">
                  <Recycle className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-sm font-medium text-slate-700">Sustainable Impact</p>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="relative z-10 h-96 lg:h-[500px] overflow-hidden rounded-2xl shadow-2xl">
              <div className="relative w-full h-full">
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
            </div>
            <div className="absolute -inset-4 bg-gradient-to-r from-green-200/30 to-blue-200/30 rounded-3xl blur-xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};
