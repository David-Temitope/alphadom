import React, { useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/ProductCard";
import { ProductCardMobile } from "@/components/ProductCardMobile";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Search, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const Products = () => {
  const { products, loading, error } = useProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [showSearch, setShowSearch] = useState(false);
  const isMobile = useIsMobile();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading products: {error}</p>
        </div>
      </div>
    );
  }

  // Filter and sort products
  const categories = [...new Set(products.map(p => p.category))];
  
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return Number(a.price) - Number(b.price);
        case "price-high":
          return Number(b.price) - Number(a.price);
        case "rating":
          return (Number(b.rating) || 0) - (Number(a.rating) || 0);
        case "sustainability":
          return (b.sustainability_score || 0) - (a.sustainability_score || 0);
        default:
          return a.name.localeCompare(b.name);
      }
    });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="mb-6 md:mb-8">
          {/* Header with Search Toggle */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl md:text-4xl font-bold">Our Products</h1>
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSearch(!showSearch)}
              >
                {showSearch ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
              </Button>
            )}
          </div>
          
          {/* Mobile Search Bar (toggleable) */}
          {(showSearch || !isMobile) && (
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          )}
          
          {/* Filters - Side by side on mobile, row on desktop */}
          <div className="flex gap-2 md:gap-4 mb-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="flex-1 md:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="flex-1 md:w-48">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="price-low">Price ↑</SelectItem>
                <SelectItem value="price-high">Price ↓</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="sustainability">Eco Score</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No products found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
            {filteredProducts.map((product) => (
              isMobile ? (
                <ProductCardMobile
                  key={product.id}
                  product={{
                    id: product.id,
                    name: product.name,
                    price: Number(product.price),
                    image: product.image || '/placeholder.svg',
                    category: product.category,
                    rating: Number(product.rating) || 0,
                    stock_count: product.stock_count || 0,
                    has_discount: product.has_discount,
                    discount_percentage: product.discount_percentage,
                    original_price: product.original_price
                  }}
                />
              ) : (
                <ProductCard
                  key={product.id}
                  product={{
                    id: product.id,
                    name: product.name,
                    price: Number(product.price),
                    image: product.image || '/placeholder.svg',
                    category: product.category,
                    rating: Number(product.rating) || 0,
                    sustainability_score: product.sustainability_score || 0,
                    eco_features: product.eco_features || [],
                    description: product.description || '',
                    stock_count: product.stock_count || 0,
                    has_discount: product.has_discount,
                    discount_percentage: product.discount_percentage,
                    original_price: product.original_price
                  }}
                />
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
