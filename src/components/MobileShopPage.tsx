import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Star, 
  Heart,
  ShoppingCart,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useProducts } from '@/hooks/useProducts';
import { useWishlist } from '@/hooks/useWishlist';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useAdminSettings } from '@/hooks/useAdminSettings';
import { supabase } from '@/integrations/supabase/client';

type SortOption = 'all' | 'price' | 'rating' | 'category';

export const MobileShopPage: React.FC = () => {
  const { products, loading } = useProducts();
  const { wishlistItems, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const { settings } = useAdminSettings();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSort, setActiveSort] = useState<SortOption>('all');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // Auto-slide banner - use hero_slides if available, fallback to hero_images
  const slideCount = settings.hero_slides.length > 0 ? settings.hero_slides.length : settings.hero_images.length;
  
  useEffect(() => {
    if (slideCount <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex(prev => 
        prev === slideCount - 1 ? 0 : prev + 1
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [slideCount]);

  // Get unique categories
  const categories = useMemo(() => {
    return [...new Set(products.map(p => p.category))];
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = products.filter(product => {
      const matchesSearch = !searchTerm || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategories.length === 0 || 
        selectedCategories.includes(product.category);
      return matchesSearch && matchesCategory;
    });

    // Sort based on active sort
    switch (activeSort) {
      case 'price':
        result = [...result].sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case 'rating':
        result = [...result].sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
        break;
      case 'category':
        result = [...result].sort((a, b) => a.category.localeCompare(b.category));
        break;
      default:
        // 'all' - keep default order
        break;
    }

    return result;
  }, [products, searchTerm, activeSort, selectedCategories]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price).replace('NGN', '₦');
  };

  const getDisplayImage = (imageField: string | null | undefined): string => {
    if (!imageField) return '/placeholder.svg';
    try {
      if (imageField.startsWith('[')) {
        const images = JSON.parse(imageField);
        return images[0] || '/placeholder.svg';
      }
      return imageField;
    } catch {
      return imageField;
    }
  };

  const handleAddToCart = async (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to add items to cart.",
      });
      navigate('/auth');
      return;
    }
    
    if ((product.stock_count || 0) <= 0) {
      toast({
        title: "Out of Stock",
        description: "This product is currently out of stock.",
        variant: "destructive",
      });
      
      // Notify vendor
      if (product.vendor_user_id) {
        try {
          await supabase.from('user_notifications').insert({
            user_id: product.vendor_user_id,
            title: 'Product Out of Stock',
            message: `Your product "${product.name}" is out of stock.`,
            type: 'stock_alert',
            related_id: product.id,
          });
        } catch (error) {
          console.error('Failed to notify vendor:', error);
        }
      }
      return;
    }
    
    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image: getDisplayImage(product.image),
      quantity: 1,
      vendor_id: product.vendor_id,
      shipping_fee: product.shipping_fee,
      shipping_type: product.shipping_type,
    });
    
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleWishlistToggle = (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(productId);
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setActiveSort('all');
    setSearchTerm('');
  };

  const sortOptions: { key: SortOption; label: string }[] = [
    { key: 'all', label: 'All Items' },
    { key: 'price', label: 'Price' },
    { key: 'rating', label: 'Rating' },
    { key: 'category', label: 'Category' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background px-4 py-4 space-y-4">
        <Skeleton className="w-full h-12 rounded-xl" />
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-9 w-20 rounded-full" />
          ))}
        </div>
        <Skeleton className="w-full h-32 rounded-2xl" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header with Search */}
      <div className="sticky top-0 z-40 bg-background border-b border-border/50 px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10 h-11 rounded-xl bg-muted border-0"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 py-3 border-b border-border/30">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {sortOptions.map((option) => (
            <button
              key={option.key}
              onClick={() => setActiveSort(option.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeSort === option.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {option.label}
            </button>
          ))}
          
          {/* Filter Button */}
          <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
            <SheetTrigger asChild>
              <button className="flex-shrink-0 px-3 py-2 rounded-full bg-muted text-muted-foreground flex items-center gap-1.5">
                <SlidersHorizontal className="h-4 w-4" />
                <ChevronDown className="h-3 w-3" />
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[60vh] rounded-t-3xl">
              <SheetHeader className="mb-4">
                <SheetTitle>Filter Products</SheetTitle>
              </SheetHeader>
              
              <div className="space-y-6">
                {/* Categories */}
                <div>
                  <h4 className="font-medium text-sm mb-3">Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => toggleCategory(category)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                          selectedCategories.includes(category)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Filters */}
                {selectedCategories.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Active:</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedCategories.map((cat) => (
                        <Badge 
                          key={cat} 
                          variant="secondary"
                          className="flex items-center gap-1 cursor-pointer"
                          onClick={() => toggleCategory(cat)}
                        >
                          {cat}
                          <X className="h-3 w-3" />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Apply Button */}
                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1 rounded-xl"
                    onClick={clearFilters}
                  >
                    Clear All
                  </Button>
                  <Button 
                    className="flex-1 rounded-xl"
                    onClick={() => setFilterOpen(false)}
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Promo Banner with Admin Slide Configuration - synced with MobileHomepage */}
      <div className="px-4 py-4">
        {settings.hero_slides.length > 0 ? (
          <div className="relative rounded-2xl overflow-hidden">
            <Link to={settings.hero_slides[currentBannerIndex]?.buttonLink || '/products'}>
              <img 
                src={settings.hero_slides[currentBannerIndex]?.image}
                alt="Promo Banner"
                className="w-full h-40 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-center px-4">
                <Badge className="bg-primary/90 text-primary-foreground border-0 text-xs font-semibold mb-2 w-fit">
                  {settings.hero_slides[currentBannerIndex]?.tag || 'SPECIAL OFFER'}
                </Badge>
                <h3 className="text-lg font-bold text-white mb-1">
                  {settings.hero_slides[currentBannerIndex]?.title || settings.hero_title}
                </h3>
                <p className="text-sm text-white/80">
                  {settings.hero_slides[currentBannerIndex]?.subtitle || settings.hero_main_text}
                </p>
              </div>
            </Link>
            
            {/* Banner Navigation */}
            {settings.hero_slides.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentBannerIndex(prev => 
                    prev === 0 ? settings.hero_slides.length - 1 : prev - 1
                  )}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 flex items-center justify-center text-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentBannerIndex(prev => 
                    prev === settings.hero_slides.length - 1 ? 0 : prev + 1
                  )}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 flex items-center justify-center text-white"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                
                {/* Dots */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {settings.hero_slides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentBannerIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === currentBannerIndex ? 'bg-white w-4' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : settings.hero_images.length > 0 ? (
          <div className="relative rounded-2xl overflow-hidden">
            <Link to="/products">
              <img 
                src={settings.hero_images[currentBannerIndex]}
                alt="Promo Banner"
                className="w-full h-40 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-center px-4">
                <Badge className="bg-primary/90 text-primary-foreground border-0 text-xs font-semibold mb-2 w-fit">
                  {settings.hero_subtitle || 'SPECIAL OFFER'}
                </Badge>
                <h3 className="text-lg font-bold text-white mb-1">
                  {settings.hero_title}
                </h3>
                <p className="text-sm text-white/80">
                  {settings.hero_main_text}
                </p>
              </div>
            </Link>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-4 border border-primary/20">
            <Badge className="bg-primary/20 text-primary border-0 text-xs font-semibold mb-2">
              SUMMER SALE
            </Badge>
            <h3 className="text-lg font-bold text-foreground mb-1">
              Eco-Friendly Essentials
            </h3>
            <p className="text-sm text-muted-foreground">
              Save up to 40% on all green products this week.
            </p>
          </div>
        )}
      </div>

      {/* Active Filter Chips */}
      {selectedCategories.length > 0 && (
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {selectedCategories.map((cat) => (
              <Badge 
                key={cat} 
                variant="outline"
                className="flex items-center gap-1 cursor-pointer shrink-0"
                onClick={() => toggleCategory(cat)}
              >
                {cat}
                <X className="h-3 w-3" />
              </Badge>
            ))}
            <button 
              onClick={clearFilters}
              className="text-xs text-primary font-medium shrink-0"
            >
              Clear all
            </button>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="px-4 pb-8">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No products found</p>
            <Button 
              variant="link" 
              onClick={clearFilters}
              className="mt-2"
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((product) => {
              const isInWishlist = wishlistItems.some(item => item.product_id === product.id);
              const displayImage = getDisplayImage(product.image);
              const isOutOfStock = (product.stock_count || 0) <= 0;

              return (
                <div
                  key={product.id}
                  className="group bg-card rounded-2xl overflow-hidden border border-border/50"
                >
                  {/* Product Image */}
                  <Link to={`/products/${product.id}`}>
                    <div className="relative aspect-square bg-muted overflow-hidden">
                      <img
                        src={displayImage}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                      />
                      
                      {/* Wishlist Button */}
                      <button
                        onClick={(e) => handleWishlistToggle(e, product.id)}
                        className={`absolute top-2 right-2 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                          isInWishlist 
                            ? 'bg-destructive/10 text-destructive' 
                            : 'bg-background/80 text-muted-foreground'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} />
                      </button>

                      {/* Discount Badge */}
                      {product.has_discount && product.discount_percentage && (
                        <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-[10px]">
                          -{product.discount_percentage}%
                        </Badge>
                      )}

                      {/* Out of Stock Overlay */}
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                          <span className="text-xs font-medium text-muted-foreground">Out of Stock</span>
                        </div>
                      )}
                    </div>
                  </Link>
                  
                  {/* Product Info */}
                  <div className="p-3 space-y-2">
                    <Link to={`/products/${product.id}`}>
                      <h4 className="text-sm font-medium text-foreground line-clamp-2 leading-tight">
                        {product.name}
                      </h4>
                    </Link>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-primary text-primary" />
                      <span className="text-xs font-medium text-foreground">
                        {product.rating?.toFixed(1) || '0.0'}
                      </span>
                    </div>
                    
                    {/* Price */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">
                        {formatPrice(Number(product.price))}
                      </span>
                      {product.original_price && (
                        <span className="text-[10px] text-muted-foreground line-through">
                          {formatPrice(Number(product.original_price))}
                        </span>
                      )}
                    </div>

                    {/* Add to Cart Button */}
                    <Button
                      onClick={(e) => handleAddToCart(e, product)}
                      disabled={isOutOfStock}
                      size="sm"
                      className="w-full h-9 rounded-xl text-xs font-medium"
                    >
                      <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
                      {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Explore More */}
        {filteredProducts.length > 0 && (
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">Explore More</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileShopPage;
