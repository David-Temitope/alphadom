import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
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
}

interface JumiaProductCardProps {
  product: Product;
}

export const JumiaProductCard: React.FC<JumiaProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const discountPercentage = Math.floor(Math.random() * 30) + 5; // Random discount for demo
  const originalPrice = product.price * (1 + discountPercentage / 100);

  return (
    <Card className="group relative h-full flex flex-col bg-card hover:shadow-lg transition-all duration-300 border border-border/20 rounded-lg overflow-hidden">
      <Link to={`/products/${product.id}`} className="flex-1 flex flex-col">
        {/* Image Section */}
        <div className="relative overflow-hidden bg-muted/30">
          <img
            src={product.image || '/placeholder.svg'}
            alt={product.name}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          
          {/* Discount Badge */}
          {discountPercentage > 0 && (
            <Badge className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
              -{discountPercentage}%
            </Badge>
          )}
          
          {/* Heart Icon */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 h-8 w-8 p-0 bg-background/80 hover:bg-background border border-border/20"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Content Section */}
        <CardContent className="flex-1 p-3 flex flex-col">
          {/* Product Name */}
          <h3 className="font-medium text-sm text-foreground mb-2 line-clamp-2 min-h-[2.5rem] leading-tight">
            {product.name}
          </h3>
          
          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < Math.floor(product.rating || 0)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                ({product.rating.toFixed(1)})
              </span>
            </div>
          )}
          
          {/* Price Section */}
          <div className="mt-auto">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg font-bold text-foreground">
                ₦ {product.price.toLocaleString()}
              </span>
              {discountPercentage > 0 && (
                <span className="text-sm text-muted-foreground line-through">
                  ₦ {originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            
            {/* Add to Cart Button */}
            <Button 
              onClick={handleAddToCart}
              className="w-full h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground"
              size="sm"
            >
              <ShoppingCart className="w-3 h-3 mr-1" />
              Add to Cart
            </Button>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};