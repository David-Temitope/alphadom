import { useProducts } from "@/hooks/useProducts";
import { JumiaProductCard } from "./JumiaProductCard";
import { Button } from "@/components/ui/button";
import { useState } from 'react';

export const FeaturedProducts = () => {
  const { products, loading } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(products?.map(p => p.category) || []))];
  
  // Filter products by category and show more products (at least 24 for multiple rows)
  const filteredProducts = selectedCategory === 'all' 
    ? products?.slice(0, 24) || []
    : products?.filter(p => p.category === selectedCategory).slice(0, 24) || [];

  if (loading) {
    return (
      <section className="py-12 px-4 bg-background">
        <div className="container mx-auto">
          <div className="bg-gradient-to-r from-primary to-primary/80 rounded-lg p-6 mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-primary-foreground mb-2">
              Top Deals on Products
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-card rounded-lg h-80 animate-pulse border border-border/20" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 px-4 bg-background">
      <div className="container mx-auto">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-lg p-6 mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-primary-foreground mb-2">
            Top Deals on Products
          </h2>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              className="whitespace-nowrap"
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'all' ? 'All Products' : category}
            </Button>
          ))}
        </div>

        {/* Products Grid - Multiple Rows */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {filteredProducts.map((product) => (
            <div key={product.id} className="w-full">
              <JumiaProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};