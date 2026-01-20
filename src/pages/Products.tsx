import React, { useState, useMemo, useCallback } from "react";
import { useProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/ProductCard";
import { ProductCardMobile } from "@/components/ProductCardMobile";
import { ProductFilters } from "@/components/ProductFilters";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Search, X, ChevronRight, SlidersHorizontal, Grid, LayoutGrid } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "react-router-dom";

const Products = () => {
  const { products, loading, error } = useProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [showSearch, setShowSearch] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'category'>('category');
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

  // Group products by category for category view
  const productsByCategory = useMemo(() => {
    const grouped: Record<string, typeof products> = {};
    products.forEach(product => {
      if (!grouped[product.category]) {
        grouped[product.category] = [];
      }
      grouped[product.category].push(product);
    });
    return grouped;
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

  // Check if any filter is active (excluding default price range)
  const hasActiveFilters = useMemo(() => {
    return filters.categories.length > 0 || 
      filters.types.length > 0 || 
      filters.genders.length > 0 || 
      filters.colors.length > 0 || 
      filters.sizes.length > 0 || 
      filters.materials.length > 0 || 
      filters.thickness.length > 0 || 
      searchTerm !== '';
  }, [filters, searchTerm]);

  const clearAllFilters = useCallback(() => {
    setFilters({
      categories: [],
      types: [],
      genders: [],
      colors: [],
      sizes: [],
      materials: [],
      thickness: [],
      priceRange: [0, filterOptions.maxPrice]
    });
    setSearchTerm('');
  }, [filterOptions.maxPrice]);

  // Skeleton component for loading state
  const ProductSkeleton = () => (
    <div className="animate-pulse">
      <div className="bg-muted aspect-square rounded-xl mb-3"></div>
      <div className="h-4 bg-muted rounded-lg w-3/4 mb-2"></div>
      <div className="h-4 bg-muted rounded-lg w-1/2"></div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex">
          <aside className={`${isMobile ? 'w-16' : 'w-72'} flex-shrink-0 border-r border-border/50 bg-card h-screen sticky top-0`}>
            <div className="p-4 space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-8 bg-muted rounded-lg animate-pulse"></div>
              ))}
            </div>
          </aside>
          <main className="flex-1 p-4 md:p-8">
            <div className="h-10 bg-muted rounded-lg w-1/4 mb-8 animate-pulse"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8 rounded-2xl bg-card border border-border/50 shadow-lg">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-destructive" />
          </div>
          <p className="text-destructive font-medium mb-2">Error loading products</p>
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Mobile Category Row Component with proper scroll containment
  const CategoryRow = ({ category, items }: { category: string; items: typeof products }) => (
    <div className="mb-8 overflow-hidden">
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="font-semibold text-lg">{category}</h2>
        <Link 
          to={`/category/${encodeURIComponent(category)}`}
          className="text-sm text-primary flex items-center gap-1 hover:gap-2 transition-all font-medium"
        >
          See all <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="overflow-x-auto overflow-y-hidden scrollbar-hide -mx-4 px-4">
        <div className="flex gap-4 pb-2 w-max">
          {items.slice(0, 10).map((product) => (
            <div key={product.id} className="w-40 flex-shrink-0">
              <ProductCardMobile
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
                  original_price: product.original_price,
                  vendor_subscription_plan: product.vendor_subscription_plan,
                  vendor_is_registered: product.vendor_is_registered
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Determine what to show based on view mode and filters
  const showCategoryView = isMobile && viewMode === 'category' && !hasActiveFilters;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <div className="flex">
        {/* Sidebar Filters - Always visible */}
        <aside className={`${isMobile ? 'w-16' : 'w-72'} flex-shrink-0 border-r border-border/50 bg-card h-screen sticky top-0`}>
          <div className="p-3 md:p-6 h-full overflow-y-auto overscroll-contain">
            {!isMobile && (
              <>
                <div className="flex items-center gap-2 mb-6">
                  <SlidersHorizontal className="w-5 h-5 text-primary" />
                  <h2 className="font-semibold text-lg">Filters</h2>
                </div>
                
                {/* Search */}
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-background border-border/50 rounded-xl"
                    />
                  </div>
                </div>

                {/* Sort */}
                <div className="mb-6">
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Sort by</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full bg-background border-border/50 rounded-xl">
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
              </>
            )}
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

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 min-w-0 overflow-x-hidden">
          {/* Mobile Header */}
          {isMobile && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">Products</h1>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-xl border-border/50"
                    onClick={() => setShowSearch(!showSearch)}
                  >
                    {showSearch ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
              {showSearch && (
                <div className="mb-4">
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-xl bg-card border-border/50"
                  />
                </div>
              )}
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="flex-1 rounded-xl border-border/50 bg-card">
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
                <Button
                  variant={viewMode === 'category' && !hasActiveFilters ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-xl"
                  onClick={() => {
                    if (hasActiveFilters) {
                      clearAllFilters();
                    }
                    setViewMode(viewMode === 'grid' ? 'category' : 'grid');
                  }}
                >
                  {viewMode === 'category' && !hasActiveFilters ? (
                    <><Grid className="w-4 h-4 mr-1" /> Grid</>
                  ) : (
                    <><LayoutGrid className="w-4 h-4 mr-1" /> Categories</>
                  )}
                </Button>
              </div>
              {hasActiveFilters && (
                <Button 
                  variant="link" 
                  size="sm" 
                  className="mt-3 p-0 h-auto text-sm text-primary"
                  onClick={clearAllFilters}
                >
                  Clear all filters
                </Button>
              )}
            </div>
          )}

          {/* Desktop Header */}
          {!isMobile && (
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Our Products</h1>
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">
                  {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
                </p>
                {hasActiveFilters && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-primary hover:text-primary/80"
                    onClick={clearAllFilters}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear all filters
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Products Display */}
          {showCategoryView ? (
            // Category-based horizontal scroll for mobile (no filters active)
            <div className="overflow-hidden">
              {Object.entries(productsByCategory).map(([category, items]) => (
                <CategoryRow key={category} category={category} items={items} />
              ))}
            </div>
          ) : (
            // Grid view when filters are active or grid mode selected
            <>
              {isMobile && (
                <p className="text-sm text-muted-foreground mb-4">
                  {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
                </p>
              )}
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-lg mb-2">No products found</p>
                  <p className="text-muted-foreground text-sm mb-4">Try adjusting your filters</p>
                  <Button variant="outline" onClick={clearAllFilters} className="rounded-xl">
                    Clear all filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
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
                          original_price: product.original_price,
                          vendor_subscription_plan: product.vendor_subscription_plan,
                          vendor_is_registered: product.vendor_is_registered
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
                          original_price: product.original_price,
                          vendor_subscription_plan: product.vendor_subscription_plan,
                          vendor_is_registered: product.vendor_is_registered
                        }}
                      />
                    )
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Products;
