import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Heart, ThumbsUp, Star } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/hooks/useWishlist';
import { useProductLikes } from '@/hooks/useProductLikes';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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

  // Needed for correct multi-vendor checkout + shipping calculation
  vendor_id?: string | null;
  shipping_fee?: number | null;
  shipping_type?: 'per_product' | 'one_time' | null;
  sustainability_score?: number;
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
  const { toggleLike, isLiked } = useProductLikes();

  const productInWishlist = isInWishlist(product.id);
  const productIsLiked = isLiked(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
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
        title: "Out of stock",
        description: "This product is currently out of stock.",
        variant: "destructive",
      });
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

  const handleLikeToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleLike(product.id);
  };

  const truncateName = (name: string, maxLength: number = 30) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + '...';
  };

  const formatNaira = (amount: number) => {
    return '₦' + amount.toLocaleString();
  };

  const hasDiscount = product.has_discount && product.discount_percentage && product.original_price;

  return (
    <Card className="group h-full flex flex-col transition-all duration-200 hover:shadow-md border bg-card overflow-hidden">
      <Link to={`/products/${product.id}`} className="flex-1 flex flex-col">
        <div className="relative bg-muted">
          <img
            src={product.image || '/placeholder.svg'}
            alt={product.name}
            className="w-full h-28 object-cover"
            loading="lazy"
            decoding="async"
            onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
          />
          
          {/* Rating at top right */}
          <div className="absolute top-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5">
            {product.rating && product.rating > 0 ? (
              <>
                <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                {product.rating.toFixed(1)}
              </>
            ) : (
              <span>New</span>
            )}
          </div>

          {/* Discount badge */}
          {hasDiscount && (
            <div className="absolute top-1 left-1 bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
              -{product.discount_percentage}%
            </div>
          )}
        </div>
        
        <CardContent className="p-2 flex-1 flex flex-col">
          <h3 className="font-medium text-xs leading-tight mb-1 line-clamp-1">
            {truncateName(product.name)}
          </h3>
          
          <div className="mt-auto">
            <div className="flex items-baseline gap-1 mb-1.5">
              <span className={`text-sm font-bold ${hasDiscount ? 'text-orange-600' : 'text-foreground'}`}>
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
      
      {/* Action buttons row */}
      <div className="p-2 pt-0 flex items-center justify-between gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={handleWishlistToggle}
        >
          <Heart className={`h-3.5 w-3.5 ${productInWishlist ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={handleLikeToggle}
        >
          <ThumbsUp className={`h-3.5 w-3.5 ${productIsLiked ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
        </Button>
        
        <Button
          onClick={handleAddToCart}
          disabled={(product.stock_count || 0) <= 0}
          className="flex-1 h-7 text-[10px] bg-green-600 hover:bg-green-700 text-white"
          size="sm"
        >
          <ShoppingCart className="w-3 h-3 mr-1" />
          {(product.stock_count || 0) <= 0 ? 'Out' : 'Add'}
        </Button>
      </div>
    </Card>
  );
};