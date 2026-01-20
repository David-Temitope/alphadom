import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Heart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/hooks/useWishlist';
import { Skeleton } from '@/components/ui/skeleton';

interface FlashSalesProps {
  title?: string;
  subtitle?: string;
}

export const FlashSales: React.FC<FlashSalesProps> = ({ 
  title = "Flash Sales",
  subtitle = "Don't miss out on these amazing deals"
}) => {
  const { products, loading } = useProducts();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Filter products with discounts
  const flashProducts = products
    .filter(p => p.discount_percentage && p.discount_percentage > 0)
    .slice(0, 10);

  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    window.addEventListener('resize', checkScrollButtons);
    return () => window.removeEventListener('resize', checkScrollButtons);
  }, [flashProducts]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScrollButtons, 300);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-8">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="w-64 h-80 flex-shrink-0 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (flashProducts.length === 0) return null;

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{title}</h2>
            {/* Countdown Timer Placeholder */}
            <div className="hidden sm:flex items-center gap-1.5">
              <div className="bg-foreground text-background px-2 py-1 rounded text-sm font-mono font-bold">92</div>
              <span className="text-foreground font-bold">:</span>
              <div className="bg-foreground text-background px-2 py-1 rounded text-sm font-mono font-bold">45</div>
              <span className="text-foreground font-bold">:</span>
              <div className="bg-foreground text-background px-2 py-1 rounded text-sm font-mono font-bold">12</div>
            </div>
          </div>
          
          {/* Navigation Arrows */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="rounded-full w-10 h-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="rounded-full w-10 h-10"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Products Scroll */}
        <div 
          ref={scrollRef}
          onScroll={checkScrollButtons}
          className="flex gap-5 overflow-x-auto scrollbar-hide pb-4"
        >
          {flashProducts.map((product) => {
            const inWishlist = isInWishlist(product.id);
            const displayImage = Array.isArray(product.image) 
              ? product.image[0] 
              : typeof product.image === 'string' && product.image.startsWith('[')
              ? JSON.parse(product.image)[0]
              : product.image;

            return (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="group flex-shrink-0 w-56 lg:w-64 bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300"
              >
                {/* Image Container */}
                <div className="relative aspect-square bg-secondary overflow-hidden">
                  <img
                    src={displayImage || '/placeholder.svg'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  
                  {/* Discount Badge */}
                  {product.discount_percentage && (
                    <Badge className="absolute top-3 left-3 bg-destructive hover:bg-destructive text-destructive-foreground font-semibold">
                      {product.discount_percentage}% OFF
                    </Badge>
                  )}

                  {/* Wishlist Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleWishlist(product.id);
                    }}
                    className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                      inWishlist 
                        ? 'bg-destructive/10 text-destructive' 
                        : 'bg-background/80 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm text-muted-foreground">
                      {product.rating || '4.5'}
                    </span>
                  </div>

                  {/* Name */}
                  <h3 className="font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>

                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(product.price)}
                    </span>
                    {product.original_price && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(product.original_price)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
