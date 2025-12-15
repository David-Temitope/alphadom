import React, { useState, useMemo } from "react";
import { useProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/ProductCard";
import { ProductCardMobile } from "@/components/ProductCardMobile";
import { ProductFilters } from "@/components/ProductFilters";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Search, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const Products = () => {
  const { products, loading, error } = useProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [showSearch, setShowSearch] = useState(false);
  const isMobile = useIsMobile();

  const [filters, setFilters] = useState({
    categories: [] as string[],
    types: [] as string[],
    genders: [] as string[],
    colors: [] as string[],
    sizes: [] as string[],
    materials: [] as string[],
    thickness: [] as string[],
    priceRange: [0, 1000000] as [number, number]
  });

  // Extract unique filter options from products
  const filterOptions = useMemo(() => {
    const categories = [...new Set(products.map(p => p.category))];
    const productTypes = [...new Set(products.map(p => p.product_type).filter(Boolean))];
    const colors = [...new Set(products.flatMap(p => p.colors || []))];
    const sizes = [...new Set(products.flatMap(p => p.sizes || []))];
    const materials = [...new Set(products.map(p => p.material).filter(Boolean))];
    const maxPrice = Math.max(...products.map(p => Number(p.price)), 100000);

    return { categories, productTypes, colors, sizes, materials, maxPrice };
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter(product => {
        // Search filter
        const matchesSearch = !searchTerm || 
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

        // Category filter
        const matchesCategory = filters.categories.length === 0 || 
          filters.categories.includes(product.category);

        // Type filter
        const matchesType = filters.types.length === 0 || 
          (product.product_type && filters.types.includes(product.product_type));

        // Gender filter
        const matchesGender = filters.genders.length === 0 || 
          (product.gender && filters.genders.includes(product.gender.toLowerCase()));

        // Color filter
        const matchesColor = filters.colors.length === 0 || 
          (product.colors && product.colors.some(c => filters.colors.includes(c)));

        // Size filter
        const matchesSize = filters.sizes.length === 0 || 
          (product.sizes && product.sizes.some(s => filters.sizes.includes(s)));

        // Material filter
        const matchesMaterial = filters.materials.length === 0 || 
          (product.material && filters.materials.includes(product.material));

        // Thickness filter
        const matchesThickness = filters.thickness.length === 0 || 
          (product.thickness && filters.thickness.includes(product.thickness));

        // Price filter
        const price = Number(product.price);
        const matchesPrice = price >= filters.priceRange[0] && price <= filters.priceRange[1];

        return matchesSearch && matchesCategory && matchesType && matchesGender && 
               matchesColor && matchesSize && matchesMaterial && matchesThickness && matchesPrice;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "price-low":
            return Number(a.price) - Number(b.price);
          case "price-high":
            return Number(b.price) - Number(a.price);
          case "rating":
            return (Number(b.rating) || 0) - (Number(a.rating) || 0);
          case "newest":
            return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
          default:
            return a.name.localeCompare(b.name);
        }
      });
  }, [products, searchTerm, filters, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Error loading products: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="mb-6">
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
          
          {/* Search Bar */}
          {(showSearch || !isMobile) && (
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products, tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          )}
          
          {/* Mobile Filter & Sort Row */}
          {isMobile && (
            <div className="flex gap-2 mb-4">
              <ProductFilters
                categories={filterOptions.categories}
                productTypes={filterOptions.productTypes}
                colors={filterOptions.colors}
                sizes={filterOptions.sizes}
                materials={filterOptions.materials}
                filters={filters}
                onFiltersChange={setFilters}
                maxPrice={filterOptions.maxPrice}
              />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Desktop Layout with Sidebar */}
        <div className="flex gap-6">
          {/* Sidebar Filters - Desktop Only */}
          {!isMobile && (
            <aside className="w-64 flex-shrink-0">
              <div className="sticky top-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold">Filters</h2>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="price-low">Price ↑</SelectItem>
                      <SelectItem value="price-high">Price ↓</SelectItem>
                      <SelectItem value="rating">Rating</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <ProductFilters
                  categories={filterOptions.categories}
                  productTypes={filterOptions.productTypes}
                  colors={filterOptions.colors}
                  sizes={filterOptions.sizes}
                  materials={filterOptions.materials}
                  filters={filters}
                  onFiltersChange={setFilters}
                  maxPrice={filterOptions.maxPrice}
                />
              </div>
            </aside>
          )}

          {/* Products Grid */}
          <main className="flex-1">
            <p className="text-sm text-muted-foreground mb-4">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
            </p>
            
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No products found matching your criteria.</p>
                <Button variant="link" onClick={() => setFilters({
                  categories: [],
                  types: [],
                  genders: [],
                  colors: [],
                  sizes: [],
                  materials: [],
                  thickness: [],
                  priceRange: [0, filterOptions.maxPrice]
                })}>
                  Clear all filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
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
          </main>
        </div>
      </div>
    </div>
  );
};

export default Products;
