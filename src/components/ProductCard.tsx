
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
    addToCart(product);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <Card className="group h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-0 shadow-md hover:shadow-xl">
      <Link to={`/products/${product.id}`} className="flex-1 flex flex-col">
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={product.image || '/placeholder.svg'}
            alt={product.name}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute top-2 right-2 flex gap-1">
            <WishlistButton productId={product.id} size="sm" />
            <LikeButton productId={product.id} size="sm" />
          </div>
          {product.sustainability_score && product.sustainability_score > 7 && (
            <Badge className="absolute top-2 left-2 bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-100">
              <Leaf className="w-3 h-3 mr-1" />
              Eco-Friendly
            </Badge>
          )}
        </div>
        
        <CardContent className="flex-1 p-4">
          <div className="flex justify-between items-start mb-2">
            <Badge variant="secondary" className="text-xs">
              {product.category}
            </Badge>
            {product.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-muted-foreground">
                  {product.rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>
          
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          
          {product.description && (
            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
              {product.description}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">
              ${product.price.toFixed(2)}
            </span>
            {product.sustainability_score && (
              <div className="flex items-center gap-1">
                <Leaf className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">
                  {product.sustainability_score}/10
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Link>
      
      <CardFooter className="p-4 pt-0">
        <Button 
          onClick={handleAddToCart}
          className="w-full transition-all duration-200 hover:scale-105"
          size="sm"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};
