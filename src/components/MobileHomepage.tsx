import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Laptop, 
  Shirt, 
  Home as HomeIcon, 
  Sparkles,
  ChevronRight,
  Star,
  BadgeCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useProducts } from '@/hooks/useProducts';

const categoryIcons: Record<string, React.ComponentType<any>> = {
  electronics: Laptop,
  fashion: Shirt,
  home: HomeIcon,
  beauty: Sparkles,
};

export const MobileHomepage: React.FC = () => {
  const { products, loading } = useProducts();

  // Get categories from products
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map(p => p.category))];
    return uniqueCategories.slice(0, 4).map(cat => {
      const normalizedCat = cat.toLowerCase();
      const IconComponent = categoryIcons[normalizedCat] || Laptop;
      return {
        name: cat,
        icon: IconComponent,
        href: `/products?category=${encodeURIComponent(cat)}`
      };
    });
  }, [products]);

  // Get recommended products (top rated or featured)
  const recommendedProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 4);
  }, [products]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price).replace('NGN', '₦');
  };

  const getDisplayImage = (imageField: string | undefined | null): string => {
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

  const formatRating = (rating: number | null | undefined, reviews?: number | null) => {
    if (!rating) return null;
    const reviewCount = reviews || 0;
    const formattedCount = reviewCount >= 1000 
      ? `${(reviewCount / 1000).toFixed(1)}k` 
      : reviewCount.toString();
    return { rating: rating.toFixed(1), count: formattedCount };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background px-4 py-6 space-y-8">
        <Skeleton className="w-full h-48 rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="flex gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="w-16 h-20 rounded-xl flex-shrink-0" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <section className="px-4 pt-4 pb-2">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-6">
          {/* Background pattern overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full blur-2xl" />
          </div>
          
          <div className="relative z-10">
            <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs font-medium mb-3">
              LIMITED OFFER
            </Badge>
            
            <h2 className="text-2xl font-bold text-white leading-tight mb-1">
              Summer Tech
            </h2>
            <h2 className="text-2xl font-bold text-white leading-tight mb-2">
              Mega Sale
            </h2>
            
            <p className="text-white/90 text-sm mb-4">
              Upto 40% off electronics
            </p>
            
            <Button 
              asChild 
              size="sm"
              className="bg-white text-primary hover:bg-white/90 font-semibold rounded-full px-6"
            >
              <Link to="/products?category=electronics">
                Shop Now
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Categories</h3>
          <Link 
            to="/products" 
            className="text-sm text-primary font-medium flex items-center gap-0.5"
          >
            See All
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
          {categories.map((category) => (
            <Link
              key={category.name}
              to={category.href}
              className="flex flex-col items-center gap-2 min-w-[64px]"
            >
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                <category.icon className="w-6 h-6 text-foreground" />
              </div>
              <span className="text-xs font-medium text-foreground text-center">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recommended Products Section */}
      <section className="px-4 pb-8">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-semibold text-foreground">Recommended for You</h3>
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 text-[10px] font-semibold">
            TOP RATED
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {recommendedProducts.map((product) => {
            const displayImage = getDisplayImage(product.image);
            const ratingInfo = formatRating(product.rating, product.reviews);
            const isVendorPick = product.vendor_subscription_plan === 'first_class';
            
            return (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className="group bg-card rounded-2xl overflow-hidden border border-border/50 hover:border-primary/30 transition-all"
              >
                {/* Product Image */}
                <div className="relative aspect-square bg-muted overflow-hidden">
                  <img
                    src={displayImage}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                  />
                  
                  {/* Vendor Pick Badge */}
                  {isVendorPick && (
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-[9px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                      <BadgeCheck className="w-3 h-3" />
                      Vendor Pick
                    </div>
                  )}
                </div>
                
                {/* Product Info */}
                <div className="p-3 space-y-1.5">
                  {/* Vendor Name - uppercased, muted */}
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium line-clamp-1">
                    {product.category} Store
                  </p>
                  
                  {/* Product Name */}
                  <h4 className="text-sm font-medium text-foreground line-clamp-2 leading-tight">
                    {product.name}
                  </h4>
                  
                  {/* Rating */}
                  {ratingInfo && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-primary text-primary" />
                      <span className="text-xs font-medium text-foreground">
                        {ratingInfo.rating}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({ratingInfo.count})
                      </span>
                    </div>
                  )}
                  
                  {/* Price */}
                  <p className="text-sm font-bold text-foreground pt-0.5">
                    {formatPrice(product.price)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default MobileHomepage;
