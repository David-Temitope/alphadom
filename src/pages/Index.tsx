import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Welcome to <span className="text-green-600">Pilot</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Discover sustainable products that make a difference. Shop eco-friendly items 
              that are good for you and the planet.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/products">Shop Now</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-green-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 4v-2m3-2v-2M6 13h12a2 2 0 002-2V5a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path>
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Sustainable Materials</h3>
              <p className="text-gray-600">Our products are made from eco-friendly and sustainable materials.</p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-green-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4v-4a2 2 0 00-2-2H5.095c-1.426 0-2.293 1.427-1.836 2.853l.4 2.293m0 0L9 15m13.905-9.5c.574-.931.164-2.007-.931-2.581m0 0a3.001 3.001 0 00-3.758 3.758c-.931.574-2.007.164-2.581-.931"></path>
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Ethical Production</h3>
              <p className="text-gray-600">We ensure fair labor practices and ethical production methods.</p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-green-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.042A8.967 8.967 0 006 3.462m6 12.08a8.967 8.967 0 016-2.58m-6-9.46a8.967 8.967 0 016 2.58m-6 12.08A8.967 8.967 0 006 20.538m6-12.08a8.967 8.967 0 016 2.58m-6-9.46A8.967 8.967 0 0118 3.462"></path>
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Eco-Friendly Packaging</h3>
              <p className="text-gray-600">Our packaging is designed to minimize environmental impact.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to make a change?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Explore our products and start your journey towards a sustainable lifestyle.
          </p>
          <Button asChild size="lg">
            <Link to="/products">Explore Products</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
