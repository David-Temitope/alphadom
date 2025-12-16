import React, { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/ProductCard";
import { ProductCardMobile } from "@/components/ProductCardMobile";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Search, ArrowLeft, X, Filter } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const CategoryProducts = () => {
  const { category } = useParams<{ category: string }>();
  const { products, loading, error } = useProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const isMobile = useIsMobile();
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    types: [] as string[],
    genders: [] as string[],
    colors: [] as string[],
    sizes: [] as string[],
    materials: [] as string[],
    thickness: [] as string[],
    priceRange: [0, 1000000] as [number, number]
  });

  // Get products for this category
  const categoryProducts = useMemo(() => {
    return products.filter(p => p.category === category);
  }, [products, category]);

  // Extract unique filter options from category products
  const filterOptions = useMemo(() => {
    const productTypes = [...new Set(categoryProducts.map(p => p.product_type).filter(Boolean))];
    const colors = [...new Set(categoryProducts.flatMap(p => p.colors || []))];
    const sizes = [...new Set(categoryProducts.flatMap(p => p.sizes || []))];
    const materials = [...new Set(categoryProducts.map(p => p.material).filter(Boolean))];
    const maxPrice = Math.max(...categoryProducts.map(p => Number(p.price)), 100000);

    return { productTypes, colors, sizes, materials, maxPrice };
  }, [categoryProducts]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return categoryProducts
      .filter(product => {
        const matchesSearch = !searchTerm || 
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesType = filters.types.length === 0 || 
          (product.product_type && filters.types.includes(product.product_type));

        const matchesGender = filters.genders.length === 0 || 
          (product.gender && filters.genders.includes(product.gender.toLowerCase()));

        const matchesColor = filters.colors.length === 0 || 
          (product.colors && product.colors.some(c => filters.colors.includes(c)));

        const matchesSize = filters.sizes.length === 0 || 
          (product.sizes && product.sizes.some(s => filters.sizes.includes(s)));

        const matchesMaterial = filters.materials.length === 0 || 
          (product.material && filters.materials.includes(product.material));

        const matchesThickness = filters.thickness.length === 0 || 
          (product.thickness && filters.thickness.includes(product.thickness));

        const price = Number(product.price);
        const matchesPrice = price >= filters.priceRange[0] && price <= filters.priceRange[1];

        return matchesSearch && matchesType && matchesGender && 
               matchesColor && matchesSize && matchesMaterial && matchesThickness && matchesPrice;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "price-low": return Number(a.price) - Number(b.price);
          case "price-high": return Number(b.price) - Number(a.price);
          case "rating": return (Number(b.rating) || 0) - (Number(a.rating) || 0);
          case "newest": return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
          default: return a.name.localeCompare(b.name);
        }
      });
  }, [categoryProducts, searchTerm, filters, sortBy]);

  const hasActiveFilters = useMemo(() => {
    return filters.types.length > 0 || 
      filters.genders.length > 0 || 
      filters.colors.length > 0 || 
      filters.sizes.length > 0 || 
      filters.materials.length > 0 || 
      filters.thickness.length > 0 || 
      searchTerm !== '';
  }, [filters, searchTerm]);

  const clearAllFilters = () => {
    setFilters({
      types: [],
      genders: [],
      colors: [],
      sizes: [],
      materials: [],
      thickness: [],
      priceRange: [0, filterOptions.maxPrice]
    });
    setSearchTerm('');
  };

  const toggleFilter = (type: keyof typeof filters, value: string) => {
    if (type === 'priceRange') return;
    setFilters(prev => ({
      ...prev,
      [type]: (prev[type] as string[]).includes(value)
        ? (prev[type] as string[]).filter(v => v !== value)
        : [...(prev[type] as string[]), value]
    }));
  };

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

  const FilterContent = () => (
    <div className="space-y-6">
      {filterOptions.productTypes.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Type</h4>
          <div className="space-y-2">
            {filterOptions.productTypes.map(type => (
              <div key={type} className="flex items-center gap-2">
                <Checkbox 
                  id={`type-${type}`}
                  checked={filters.types.includes(type as string)}
                  onCheckedChange={() => toggleFilter('types', type as string)}
                />
                <Label htmlFor={`type-${type}`} className="text-sm">{type}</Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {filterOptions.colors.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Color</h4>
          <div className="space-y-2">
            {filterOptions.colors.map(color => (
              <div key={color} className="flex items-center gap-2">
                <Checkbox 
                  id={`color-${color}`}
                  checked={filters.colors.includes(color)}
                  onCheckedChange={() => toggleFilter('colors', color)}
                />
                <Label htmlFor={`color-${color}`} className="text-sm">{color}</Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {filterOptions.sizes.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Size</h4>
          <div className="space-y-2">
            {filterOptions.sizes.map(size => (
              <div key={size} className="flex items-center gap-2">
                <Checkbox 
                  id={`size-${size}`}
                  checked={filters.sizes.includes(size)}
                  onCheckedChange={() => toggleFilter('sizes', size)}
                />
                <Label htmlFor={`size-${size}`} className="text-sm">{size}</Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {filterOptions.materials.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Material</h4>
          <div className="space-y-2">
            {filterOptions.materials.map(material => (
              <div key={material} className="flex items-center gap-2">
                <Checkbox 
                  id={`material-${material}`}
                  checked={filters.materials.includes(material as string)}
                  onCheckedChange={() => toggleFilter('materials', material as string)}
                />
                <Label htmlFor={`material-${material}`} className="text-sm">{material}</Label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <Link to="/products" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Products</span>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold">{category}</h1>
          <p className="text-muted-foreground">{filteredProducts.length} products</p>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search in this category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32 md:w-40">
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
          {isMobile ? (
            <Sheet open={showFilters} onOpenChange={setShowFilters}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterContent />
                  {hasActiveFilters && (
                    <Button variant="link" className="mt-4 p-0" onClick={clearAllFilters}>
                      Clear all filters
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          ) : null}
        </div>

        {/* Active Filter Badges */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-4">
            {filters.types.map(type => (
              <Badge key={type} variant="secondary" className="cursor-pointer" onClick={() => toggleFilter('types', type)}>
                {type} <X className="h-3 w-3 ml-1" />
              </Badge>
            ))}
            {filters.colors.map(color => (
              <Badge key={color} variant="secondary" className="cursor-pointer" onClick={() => toggleFilter('colors', color)}>
                {color} <X className="h-3 w-3 ml-1" />
              </Badge>
            ))}
            {filters.sizes.map(size => (
              <Badge key={size} variant="secondary" className="cursor-pointer" onClick={() => toggleFilter('sizes', size)}>
                {size} <X className="h-3 w-3 ml-1" />
              </Badge>
            ))}
            {filters.materials.map(mat => (
              <Badge key={mat} variant="secondary" className="cursor-pointer" onClick={() => toggleFilter('materials', mat)}>
                {mat} <X className="h-3 w-3 ml-1" />
              </Badge>
            ))}
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>Clear all</Button>
          </div>
        )}

        <div className="flex gap-6">
          {/* Desktop Sidebar Filters */}
          {!isMobile && (
            <aside className="w-56 flex-shrink-0">
              <div className="sticky top-4">
                <h3 className="font-semibold mb-4">Filters</h3>
                <FilterContent />
                {hasActiveFilters && (
                  <Button variant="link" className="mt-4 p-0" onClick={clearAllFilters}>
                    Clear all filters
                  </Button>
                )}
              </div>
            </aside>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No products found.</p>
                {hasActiveFilters && (
                  <Button variant="link" onClick={clearAllFilters}>Clear all filters</Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
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
      </div>
    </div>
  );
};

export default CategoryProducts;
