import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Leaf, Star, BadgeCheck } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { WishlistButton } from './WishlistButton';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description?: string;
  sustainability_score?: number;
  rating?: number;
  eco_features?: string[];
  has_discount?: boolean;
  discount_percentage?: number;
  original_price?: number;
  stock_count?: number;
  initial_stock_count?: number;
  vendor_user_id?: string | null;
  vendor_id?: string | null;
  shipping_fee?: number | null;
  shipping_type?: 'per_product' | 'one_time' | null;
  vendor_subscription_plan?: string;
  vendor_is_registered?: boolean;
}

interface ProductCardProps {
  product: Product;
}

export const ProductCard = React.memo(({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

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
    
    addToCart(product);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const hasDiscount = product.has_discount && product.discount_percentage && product.original_price;
  const discountPercentage = hasDiscount ? product.discount_percentage : 0;
  const originalPrice = hasDiscount ? product.original_price : 0;
  
  const formatNaira = (amount: number) => {
    return amount.toLocaleString("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    });
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

  const displayImage = getDisplayImage(product.image);

  return (
    <Card className="group h-full flex flex-col transition-all duration-300 hover:shadow-xl border-border/50 bg-card rounded-2xl overflow-hidden">
      <Link to={`/products/${product.id}`} className="flex-1 flex flex-col">
        <div className="relative overflow-hidden bg-muted aspect-square">
          <img
            src={displayImage}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            decoding="async"
            onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
          />
          
          {/* Discount badge */}
          {hasDiscount && (
            <Badge className="absolute top-3 left-3 bg-destructive hover:bg-destructive text-destructive-foreground border-0 text-xs px-2.5 py-1 rounded-lg">
              {discountPercentage}% off
            </Badge>
          )}

          <div className="absolute top-3 right-3">
            <WishlistButton productId={product.id} size="sm" />
          </div>
          
          {product.sustainability_score != null && product.sustainability_score > 7 && (
            <Badge className="absolute bottom-3 left-3 bg-primary/90 text-primary-foreground border-0 rounded-lg">
              <Leaf className="w-3 h-3 mr-1" />
              Eco-Friendly
            </Badge>
          )}
        </div>
        
        <CardContent className="flex-1 p-4">
          {/* Rating - only show if rating exists and is greater than 0 */}
          {product.rating != null && product.rating > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.floor(product.rating!)
                        ? 'fill-amber-400 text-amber-400'
                        : i < product.rating!
                        ? 'fill-amber-200 text-amber-200'
                        : 'fill-muted text-muted'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground ml-1">
                ({product.rating.toFixed(1)})
              </span>
            </div>
          )}
          
          {/* Product name with badges
              Badge Logic:
              - Gold (amber-500): First Class subscription vendors
              - Blue (sky-500): Economy subscription vendors  
              - Green (primary): Registered business (has TIN) on Free plan
          */}
          <h3 className="font-medium text-sm mb-3 line-clamp-2 group-hover:text-primary transition-colors leading-snug flex items-start gap-1">
            <span className="flex-1">{product.name}</span>
            <span className="flex items-center gap-0.5 flex-shrink-0 mt-0.5">
              {product.vendor_subscription_plan === 'first_class' ? (
                <BadgeCheck className="w-4 h-4 text-amber-500" />
              ) : product.vendor_subscription_plan === 'economy' ? (
                <BadgeCheck className="w-4 h-4 text-sky-500" />
              ) : product.vendor_is_registered ? (
                <BadgeCheck className="w-4 h-4 text-primary" />
              ) : null}
            </span>
          </h3>
          
          {/* Pricing */}
          <div className="mt-auto">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-foreground">
                {formatNaira(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatNaira(originalPrice)}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Link>
      
      <CardFooter className="p-4 pt-0">
        <Button 
          onClick={handleAddToCart}
          disabled={(product.stock_count || 0) <= 0}
          className="w-full rounded-xl disabled:opacity-50"
          size="sm"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {(product.stock_count || 0) <= 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </CardFooter>
    </Card>
  );
});

ProductCard.displayName = 'ProductCard';
