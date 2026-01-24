import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Heart, Star, BadgeCheck } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  rating?: number;
  stock_count?: number;
  has_discount?: boolean;
  discount_percentage?: number;
  original_price?: number;
  vendor_id?: string | null;
  shipping_fee?: number | null;
  shipping_type?: 'per_product' | 'one_time' | null;
  sustainability_score?: number;
  vendor_user_id?: string | null;
  vendor_subscription_plan?: string;
  vendor_is_registered?: boolean;
}

interface ProductCardMobileProps {
  product: Product;
}

export const ProductCardMobile: React.FC<ProductCardMobileProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const productInWishlist = isInWishlist(product.id);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login or sign up to add items to your cart.",
      });
      navigate('/auth');
      return;
    }
    
    if ((product.stock_count || 0) <= 0) {
      toast({
        title: "Out of Stock",
        description: "This product is out of stock. The vendor has been notified to restock.",
        variant: "destructive",
      });
      
      if (product.vendor_user_id) {
        try {
          await supabase.from('user_notifications').insert({
            user_id: product.vendor_user_id,
            title: 'Product Out of Stock - Restock Required!',
            message: `Your product "${product.name}" is out of stock and a customer tried to purchase it. Please restock within 7 days or the product will be automatically deleted.`,
            type: 'stock_alert',
            related_id: product.id,
          });
        } catch (error) {
          console.error('Failed to notify vendor:', error);
        }
      }
      return;
    }
    
    addToCart(product as any);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const truncateName = (name: string, maxLength: number = 30) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + '...';
  };

  const formatNaira = (amount: number) => {
    return '₦' + amount.toLocaleString();
  };

  const hasDiscount = product.has_discount && product.discount_percentage && product.original_price;

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

  const displayImage = getDisplayImage(product.image);

  return (
    <Card className="group h-full flex flex-col transition-all duration-200 hover:shadow-lg border-border/50 bg-card overflow-hidden rounded-2xl">
      <Link to={`/products/${product.id}`} className="flex-1 flex flex-col">
        <div className="relative bg-muted aspect-square overflow-hidden">
          <img
            src={displayImage}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            decoding="async"
            onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
          />
          
          {/* Rating badge */}
          <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm text-foreground text-[10px] px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
            {product.rating && product.rating > 0 ? (
              <>
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {product.rating.toFixed(1)}
              </>
            ) : (
              <span className="text-muted-foreground">New</span>
            )}
          </div>

          {/* Discount badge */}
          {hasDiscount && (
            <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-[10px] px-2 py-1 rounded-lg font-medium shadow-sm">
              -{product.discount_percentage}%
            </div>
          )}
        </div>
        
        <CardContent className="p-3 flex-1 flex flex-col">
          {/* Badge Logic:
              - Gold (amber-500): First Class subscription vendors
              - Blue (sky-500): Economy subscription vendors  
              - Green (primary): Registered business (has TIN) on Free plan
          */}
          <h3 className="font-medium text-xs leading-tight mb-1.5 line-clamp-2 flex items-start gap-1">
            <span className="flex-1">{truncateName(product.name)}</span>
            <span className="flex items-center gap-0.5 flex-shrink-0">
              {product.vendor_subscription_plan === 'first_class' ? (
                <BadgeCheck className="w-3.5 h-3.5 text-amber-500" />
              ) : product.vendor_subscription_plan === 'economy' ? (
                <BadgeCheck className="w-3.5 h-3.5 text-sky-500" />
              ) : product.vendor_is_registered ? (
                <BadgeCheck className="w-3.5 h-3.5 text-primary" />
              ) : null}
            </span>
          </h3>
          
          <div className="mt-auto">
            <div className="flex items-baseline gap-1.5">
              <span className={`text-sm font-bold ${hasDiscount ? 'text-destructive' : 'text-foreground'}`}>
                {formatNaira(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-[10px] text-muted-foreground line-through">
                  {formatNaira(product.original_price!)}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Link>
      
      {/* Action buttons */}
      <div className="p-3 pt-0 flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0 rounded-xl border-border/50"
          onClick={handleWishlistToggle}
        >
          <Heart className={`h-4 w-4 ${productInWishlist ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`} />
        </Button>
        
        <Button
          onClick={handleAddToCart}
          disabled={(product.stock_count || 0) <= 0}
          className="flex-1 h-8 text-xs rounded-xl"
          size="sm"
        >
          <ShoppingCart className="w-3.5 h-3.5 mr-1" />
          {(product.stock_count || 0) <= 0 ? 'Out' : 'Add'}
        </Button>
      </div>
    </Card>
  );
};
