
import { Link } from "react-router-dom";
import { ShoppingCart, Heart, Star, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  sustainabilityScore: number;
  ecoFeatures: string[];
  description: string;
}

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      sustainabilityScore: product.sustainabilityScore,
      category: product.category,
    });
  };

  const getSustainabilityColor = (score: number) => {
    if (score >= 8) return "bg-green-500";
    if (score >= 6) return "bg-yellow-500";
    return "bg-orange-500";
  };

  return (
    <Link to={`/products/${product.id}`}>
      <div className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100">
        <div className="relative">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Sustainability Score Badge */}
          <div className="absolute top-2 left-2">
            <Badge className={`${getSustainabilityColor(product.sustainabilityScore)} text-white flex items-center space-x-1`}>
              <Leaf className="h-3 w-3" />
              <span>{product.sustainabilityScore}/10</span>
            </Badge>
          </div>

          {/* Wishlist Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 bg-white/80 hover:bg-white group opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 space-y-3">
          <div className="space-y-1">
            <Badge variant="secondary" className="text-xs">
              {product.category}
            </Badge>
            <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-2">
              {product.name}
            </h3>
          </div>

          <p className="text-sm text-gray-600 line-clamp-2">
            {product.description}
          </p>

          {/* Eco Features */}
          <div className="flex flex-wrap gap-1">
            {product.ecoFeatures.slice(0, 2).map((feature, index) => (
              <Badge key={index} variant="outline" className="text-xs text-green-600 border-green-200">
                {feature}
              </Badge>
            ))}
            {product.ecoFeatures.length > 2 && (
              <Badge variant="outline" className="text-xs text-gray-500">
                +{product.ecoFeatures.length - 2}
              </Badge>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center space-x-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {product.rating} ({product.reviews})
            </span>
          </div>

          {/* Price and Add to Cart */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-xl font-bold text-green-600">
              ${product.price.toFixed(2)}
            </div>
            <Button
              onClick={handleAddToCart}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 flex items-center space-x-2"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Add</span>
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
};
