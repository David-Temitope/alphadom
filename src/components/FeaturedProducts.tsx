import { useProducts } from "@/hooks/useProducts";
import { ProductCardMobile } from "./ProductCardMobile";
import { ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from 'react';
import { useIsMobile } from "@/hooks/use-mobile";

export const FeaturedProducts = () => {
  const { products, loading } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const isMobile = useIsMobile();

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(products?.map(p => p.category) || []))];
  
  // Show 6 recently added products (2 rows x 3 columns)
  const recentProducts = products?.slice(0, 6) || [];
  const filteredProducts = selectedCategory === 'all' 
    ? recentProducts
    : products?.filter(p => p.category === selectedCategory).slice(0, 6) || [];

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

        {/* Category Filter - Dropdown on mobile, buttons on desktop */}
        {isMobile ? (
          <div className="mb-6">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Products' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
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
        )}

        {/* Products Grid - 2 columns on mobile, more on larger screens */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4">
          {filteredProducts.map((product) => (
            <div key={product.id} className="w-full">
              <ProductCardMobile product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};