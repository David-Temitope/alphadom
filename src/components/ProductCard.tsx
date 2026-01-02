
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

  // Needed for correct multi-vendor checkout + shipping calculation
  vendor_id?: string | null;
  shipping_fee?: number | null;
  shipping_type?: 'per_product' | 'one_time' | null;
  
  // Subscription and registration info
  vendor_subscription_plan?: string;
  vendor_is_registered?: boolean;
}

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Require login to add to cart
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
      
      // Notify vendor about out of stock
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

  // Use admin-set discount if available
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

  // Extract first image from potential JSON array
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
    <Card className="group h-full flex flex-col transition-all duration-300 hover:shadow-lg border bg-white dark:bg-card">
      <Link to={`/products/${product.id}`} className="flex-1 flex flex-col">
        <div className="relative overflow-hidden bg-muted aspect-square">
          <img
            src={displayImage}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            decoding="async"
            onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
          />
          
          {/* Discount badge - only the percentage */}
          {hasDiscount && (
            <Badge className="absolute top-2 left-2 bg-orange-500 hover:bg-orange-600 text-white border-0 text-xs px-2 py-1">
              {discountPercentage}% off
            </Badge>
          )}

          <div className="absolute top-2 right-2">
            <WishlistButton productId={product.id} size="sm" />
          </div>
          
          {product.sustainability_score != null && product.sustainability_score > 7 && (
            <Badge className="absolute bottom-2 left-2 bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-100">
              <Leaf className="w-3 h-3 mr-1" />
              Eco-Friendly
            </Badge>
          )}
        </div>
        
        <CardContent className="flex-1 p-4">
          {/* Rating first (Amazon style) */}
          <div className="flex items-center gap-1 mb-2">
            {product.rating && product.rating > 0 ? (
              <>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.floor(product.rating!)
                          ? 'fill-yellow-400 text-yellow-400'
                          : i < product.rating!
                          ? 'fill-yellow-200 text-yellow-200'
                          : 'fill-gray-200 text-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  ({product.rating.toFixed(1)})
                </span>
              </>
            ) : (
              <span className="text-xs text-muted-foreground">New</span>
            )}
          </div>
          
          <h3 className="font-medium text-sm mb-2 line-clamp-3 group-hover:text-primary transition-colors leading-tight flex items-center gap-1">
            {product.name}
            {/* Subscription badge - Gold for first class, Blue for economy */}
            {product.vendor_subscription_plan === 'first_class' && (
              <BadgeCheck className="w-4 h-4 text-yellow-500 flex-shrink-0" />
            )}
            {product.vendor_subscription_plan === 'economy' && (
              <BadgeCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
            )}
            {/* Only show green registered badge if no subscription badge */}
            {product.vendor_is_registered && product.vendor_subscription_plan === 'free' && (
              <BadgeCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
            )}
          </h3>
          
          {/* Pricing */}
          <div className="mt-auto">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-lg font-bold text-foreground">
                {formatNaira(product.price)}
              </span>

              {hasDiscount && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatNaira(originalPrice)}
                </span>
              )}
            </div>

            
            <div className="flex items-center justify-between">
              {product.sustainability_score != null && product.sustainability_score > 0 && (
                <div className="flex items-center gap-1">
                  <Leaf className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-green-600">
                    {product.sustainability_score}/10
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Link>
      
      <CardFooter className="p-4 pt-0">
        <Button 
          onClick={handleAddToCart}
          disabled={(product.stock_count || 0) <= 0}
          className="w-full bg-green-600 hover:bg-green-700 text-white border-0 disabled:opacity-50"
          size="sm"
        >
          <ShoppingCart className="w-4 h-4 mr-1" />
          {(product.stock_count || 0) <= 0 ? 'Out of Stock' : 'Add'}
        </Button>
      </CardFooter>
    </Card>
  );
};
