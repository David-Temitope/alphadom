import React, { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import { useVendors } from "@/hooks/useVendors";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, Search, X, ChevronRight, Grid, LayoutGrid, 
  Star, Heart, Home 
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileShopPage } from "@/components/MobileShopPage";

const Products = () => {
  const { products, loading, error } = useProducts();
  const { vendors } = useVendors();
  const { wishlistItems, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showSearch, setShowSearch] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [filters, setFilters] = useState({
    categories: [] as string[],
    vendors: [] as string[],
    rating: 0,
    priceRange: [0, 500000] as [number, number]
  });

  // Extract unique filter options from products
  const filterOptions = useMemo(() => {
    const categories = [...new Set(products.map(p => p.category))];
    const maxPrice = Math.max(...products.map(p => Number(p.price)), 500000);
    
    // Get top vendors from products
    const vendorIds = [...new Set(products.map(p => p.vendor_id).filter(Boolean))];
    const topVendors = vendors
      .filter(v => vendorIds.includes(v.id))
      .slice(0, 5);

    return { categories, topVendors, maxPrice };
  }, [products, vendors]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter(product => {
        // Search filter
        const matchesSearch = !searchTerm || 
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase());

        // Category filter
        const matchesCategory = filters.categories.length === 0 || 
          filters.categories.includes(product.category);

        // Vendor filter
        const matchesVendor = filters.vendors.length === 0 || 
          (product.vendor_id && filters.vendors.includes(product.vendor_id));

        // Rating filter
        const matchesRating = filters.rating === 0 || 
          (Number(product.rating) || 0) >= filters.rating;

        // Price filter
        const price = Number(product.price);
        const matchesPrice = price >= filters.priceRange[0] && price <= filters.priceRange[1];

        return matchesSearch && matchesCategory && matchesVendor && matchesRating && matchesPrice;
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

  const toggleCategory = (category: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const toggleVendor = (vendorId: string) => {
    setFilters(prev => ({
      ...prev,
      vendors: prev.vendors.includes(vendorId)
        ? prev.vendors.filter(v => v !== vendorId)
        : [...prev.vendors, vendorId]
    }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getDisplayImage = (imageField: string | null) => {
    if (!imageField) return '/placeholder.svg';
    try {
      const images = JSON.parse(imageField);
      return Array.isArray(images) && images.length > 0 ? images[0] : imageField;
    } catch {
      return imageField;
    }
  };

  const handleAddToCart = (product: any) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be logged in to add items to cart",
        variant: "destructive"
      });
      return;
    }
    
    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image: getDisplayImage(product.image),
      quantity: 1
    });
    
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`
    });
  };

  // Render mobile version
  if (isMobile) {
    return <MobileShopPage />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex">
          <aside className="hidden lg:block w-64 flex-shrink-0 border-r border-border/50 bg-card min-h-screen p-6">
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-8 bg-muted rounded animate-pulse"></div>
              ))}
            </div>
          </aside>
          <main className="flex-1 p-4 lg:p-8">
            <div className="h-10 bg-muted rounded w-1/4 mb-8 animate-pulse"></div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-square bg-muted rounded-2xl animate-pulse" />
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
        <div className="text-center p-8 rounded-2xl bg-card border border-border/50">
          <X className="w-12 h-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive font-medium mb-2">Error loading products</p>
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar Filters - Desktop */}
        <aside className="hidden lg:block w-64 flex-shrink-0 border-r border-border/50 bg-card min-h-screen sticky top-0">
          <div className="p-6 space-y-6">
            {/* Categories */}
            <div>
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-4">
                Categories
              </h3>
              <div className="space-y-3">
                {filterOptions.categories.map((category) => (
                  <div key={category} className="flex items-center gap-3">
                    <Checkbox
                      id={`cat-${category}`}
                      checked={filters.categories.includes(category)}
                      onCheckedChange={() => toggleCategory(category)}
                      className="rounded-full"
                    />
                    <Label 
                      htmlFor={`cat-${category}`} 
                      className="text-sm cursor-pointer text-foreground"
                    >
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-4">
                Price Range
              </h3>
              <div className="px-1">
                <Slider
                  value={filters.priceRange}
                  onValueChange={(value) => setFilters(prev => ({ 
                    ...prev, 
                    priceRange: value as [number, number] 
                  }))}
                  max={filterOptions.maxPrice}
                  step={1000}
                  className="w-full"
                />
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>{formatPrice(filters.priceRange[0])}</span>
                  <span>{formatPrice(filters.priceRange[1])}</span>
                </div>
              </div>
            </div>

            {/* Top Vendors */}
            {filterOptions.topVendors.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-4">
                  Top Vendors
                </h3>
                <div className="space-y-3">
                  {filterOptions.topVendors.map((vendor) => (
                    <div key={vendor.id} className="flex items-center gap-3">
                      <Checkbox
                        id={`vendor-${vendor.id}`}
                        checked={filters.vendors.includes(vendor.id)}
                        onCheckedChange={() => toggleVendor(vendor.id)}
                        className="rounded-full"
                      />
                      <Label 
                        htmlFor={`vendor-${vendor.id}`} 
                        className="text-sm cursor-pointer text-foreground"
                      >
                        {vendor.store_name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ratings */}
            <div>
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-4">
                Ratings
              </h3>
              <button
                onClick={() => setFilters(prev => ({ ...prev, rating: prev.rating === 4 ? 0 : 4 }))}
                className={`flex items-center gap-2 p-2 rounded-lg w-full transition-colors ${
                  filters.rating === 4 ? 'bg-primary/10' : 'hover:bg-muted'
                }`}
              >
                <div className="flex items-center">
                  {[...Array(4)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-primary fill-primary" />
                  ))}
                  <Star className="h-4 w-4 text-muted-foreground/30" />
                </div>
                <span className="text-sm text-muted-foreground">& up</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 min-w-0">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="flex items-center gap-1 hover:text-foreground">
              <Home className="h-4 w-4" />
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">Shop All Products</span>
          </nav>

          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Shop All Products</h1>
              <p className="text-muted-foreground mt-1">
                Showing <span className="font-medium text-foreground">1-{Math.min(12, filteredProducts.length)}</span> of {filteredProducts.length} products
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Sort Dropdown */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-44 rounded-xl border-border/50 bg-background">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest Arrivals</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Best Rating</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode Toggle */}
              <div className="hidden lg:flex items-center gap-1 border border-border/50 rounded-xl p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  onClick={() => setViewMode('list')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg mb-2">No products found</p>
              <p className="text-muted-foreground text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {filteredProducts.map((product) => {
                const isInWishlist = wishlistItems.some(item => item.product_id === product.id);
                const hasDiscount = product.has_discount && product.discount_percentage;
                const isNew = product.created_at && 
                  new Date(product.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

                return (
                  <div 
                    key={product.id} 
                    className="group bg-card rounded-2xl border border-border/50 overflow-hidden hover:shadow-lg transition-all"
                  >
                    {/* Product Image */}
                    <div className="relative aspect-square bg-muted">
                      {/* Badges */}
                      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                        {hasDiscount && (
                          <Badge className="bg-destructive text-destructive-foreground text-xs">
                            SALE
                          </Badge>
                        )}
                        {isNew && !hasDiscount && (
                          <Badge className="bg-primary text-primary-foreground text-xs">
                            NEW
                          </Badge>
                        )}
                      </div>

                      {/* Wishlist Button */}
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                          isInWishlist 
                            ? 'bg-destructive/10 text-destructive' 
                            : 'bg-background/80 text-muted-foreground hover:text-destructive'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} />
                      </button>

                      <Link to={`/products/${product.id}`}>
                        <img
                          src={getDisplayImage(product.image)}
                          alt={product.name}
                          className="w-full h-full object-contain p-4"
                        />
                      </Link>
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      {/* Category */}
                      <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1">
                        {product.category}
                      </p>

                      {/* Name */}
                      <Link to={`/products/${product.id}`}>
                        <h3 className="font-medium text-foreground line-clamp-2 mb-2 hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                      </Link>

                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-3">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < Math.floor(Number(product.rating) || 0)
                                  ? 'text-primary fill-primary'
                                  : 'text-muted-foreground/30'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          ({product.reviews || 0})
                        </span>
                      </div>

                      {/* Price and Wishlist */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-primary text-lg">
                            {formatPrice(Number(product.price))}
                          </span>
                          {product.original_price && (
                            <span className="text-xs text-muted-foreground line-through">
                              {formatPrice(Number(product.original_price))}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => toggleWishlist(product.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-destructive text-destructive' : ''}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Products;
