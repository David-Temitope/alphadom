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
  
  // Determine which products to display based on the selected category
  const productsToDisplay = selectedCategory === 'all' 
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

        {/* Products Grid or No Products Message */}
        {productsToDisplay.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4">
            {productsToDisplay.map(product => (
              // Cast product type to 'any' as per the original component structure
              isMobile ? (
                <ProductCardMobile key={product.id} product={product as any} />
              ) : (
                <ProductCard key={product.id} product={product as any} />
              )
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No products found for the selected category.</p>
          </div>
        )}
      </div>
    </section>
  );
};