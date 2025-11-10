
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Leaf, Star } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { WishlistButton } from './WishlistButton';
import { LikeButton } from './LikeButton';
import { useToast } from '@/hooks/use-toast';

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
}

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.stock_count <= 0) {
      toast({
        title: "Out of stock",
        description: "This product is currently out of stock.",
        variant: "destructive",
      });
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

  return (
    <Card className="group h-full flex flex-col transition-all duration-300 hover:shadow-lg border bg-white dark:bg-card">
      <Link to={`/products/${product.id}`} className="flex-1 flex flex-col">
        <div className="relative overflow-hidden">
          <img
            src={product.image || '/placeholder.svg'}
            alt={product.name}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          
          {/* Discount badges - only show if admin set discount */}
          {hasDiscount && (
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-0 text-xs px-2 py-1">
                {discountPercentage}% off
              </Badge>
              <Badge className="bg-white text-orange-600 border border-orange-200 text-xs px-2 py-1 font-medium">
                Special offer
              </Badge>
            </div>
          )}

          <div className="absolute top-2 right-2 flex gap-1">
            <WishlistButton productId={product.id} size="sm" />
            <LikeButton productId={product.id} size="sm" />
          </div>
          
          {product.sustainability_score && product.sustainability_score > 7 && (
            <Badge className="absolute bottom-2 left-2 bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-100">
              <Leaf className="w-3 h-3 mr-1" />
              Eco-Friendly
            </Badge>
          )}
        </div>
        
        <CardContent className="flex-1 p-4">
          {/* Rating first (Amazon style) */}
          {product.rating && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.floor(product.rating!)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-200 text-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                ({product.rating.toFixed(1)})
              </span>
            </div>
          )}
          
          <h3 className="font-medium text-sm mb-2 line-clamp-3 group-hover:text-primary transition-colors leading-tight">
            {product.name}
          </h3>
          
          {/* Pricing */}
          <div className="mt-auto">
            <div className="flex items-baseline gap-2 mb-1">
              <span className={`text-lg font-bold ${hasDiscount ? 'text-orange-600' : 'text-foreground'}`}>
                ₦{product.price.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-sm text-muted-foreground line-through">
                  ₦{originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs border-green-200 text-green-700">
                {product.category}
              </Badge>
              {product.sustainability_score && (
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
          <ShoppingCart className="w-4 h-4 mr-2" />
          {(product.stock_count || 0) <= 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </CardFooter>
    </Card>
  );
};
