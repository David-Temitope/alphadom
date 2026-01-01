import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Star, Heart, Leaf, BadgeCheck } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

type Variant = "desktop" | "mobile" | "compact";

interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  has_discount?: boolean;
  discount_percentage?: number;
  image: string;
  category: string;
  rating?: number;
  stock_count?: number;
  sustainability_score?: number;
  vendor_subscription_plan?: "first_class" | "economy" | "free";
  vendor_is_registered?: boolean;
}

interface Props {
  product: Product;
  variant?: Variant;
}

export const ProductCard: React.FC<Props> = ({ product, variant = "desktop" }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const isMobile = variant !== "desktop";
  const hasDiscount = product.has_discount && product.discount_percentage && product.original_price;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to add items to your cart.",
      });
      navigate("/auth");
      return;
    }

    if ((product.stock_count ?? 1) <= 0) {
      toast({
        title: "Sold Out",
        description: "This product is currently unavailable.",
        variant: "destructive",
      });
      return;
    }

    addToCart(product);
    toast({
      title: "Added to cart",
      description: `${product.name} added successfully.`,
    });
  };

  const formatNaira = (amount: number) =>
    amount.toLocaleString("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    });

  return (
    <Card className="group h-full flex flex-col border bg-white hover:shadow-lg transition-all">
      <Link to={`/products/${product.id}`} className="flex-1 flex flex-col">
        {/* IMAGE */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
          />

          {/* Discount */}
          {hasDiscount && (
            <Badge className="absolute top-2 left-2 bg-orange-500 text-white text-xs">
              -{product.discount_percentage}%
            </Badge>
          )}

          {/* Vendor Trust Badge */}
          {(product.vendor_subscription_plan || product.vendor_is_registered) && (
            <div className="absolute top-2 right-2">
              <BadgeCheck
                className={`w-5 h-5 ${
                  product.vendor_subscription_plan === "first_class"
                    ? "text-yellow-500"
                    : product.vendor_subscription_plan === "economy"
                      ? "text-blue-500"
                      : "text-green-500"
                }`}
              />
            </div>
          )}

          {/* Eco Badge */}
          {product.sustainability_score && product.sustainability_score >= 8 && (
            <Badge className="absolute bottom-2 left-2 bg-green-100 text-green-800 text-xs">
              <Leaf className="w-3 h-3 mr-1" />
              Eco
            </Badge>
          )}

          {/* Wishlist */}
          <button
            className="absolute bottom-2 right-2 bg-white/90 p-1.5 rounded-full"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <Heart className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <CardContent className={`flex-1 flex flex-col ${isMobile ? "p-2" : "p-4"}`}>
          {/* Rating */}
          {product.rating && product.rating > 0 && (
            <div className="flex items-center gap-1 mb-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                  }`}
                />
              ))}
              <span className="text-xs text-muted-foreground">({product.rating.toFixed(1)})</span>
            </div>
          )}

          {/* Name */}
          <h3 className={`font-medium leading-tight mb-2 line-clamp-${isMobile ? "2" : "3"}`}>{product.name}</h3>

          {/* Price */}
          <div className="mt-auto">
            <div className="flex items-baseline gap-2">
              <span
                className={`font-bold ${isMobile ? "text-sm" : "text-lg"} ${
                  hasDiscount ? "text-orange-600" : "text-foreground"
                }`}
              >
                {formatNaira(product.price)}
              </span>

              {hasDiscount && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatNaira(product.original_price!)}
                </span>
              )}
            </div>

            {/* Meta */}
            <div className="flex items-center justify-between mt-1">
              <Badge variant="outline" className="text-xs text-muted-foreground">
                {product.category}
              </Badge>

              {product.sustainability_score && product.sustainability_score > 0 && (
                <span className="text-xs text-green-600">{product.sustainability_score}/10</span>
              )}
            </div>
          </div>
        </CardContent>
      </Link>

      {/* ACTION */}
      <CardFooter className={`${isMobile ? "p-2" : "p-4 pt-0"}`}>
        <Button
          onClick={handleAddToCart}
          disabled={(product.stock_count ?? 1) <= 0}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
          size={isMobile ? "sm" : "default"}
        >
          <ShoppingCart className="w-4 h-4 mr-1" />
          {(product.stock_count ?? 1) <= 0 ? "Sold Out" : isMobile ? "Add" : "Add to Cart"}
        </Button>
      </CardFooter>
    </Card>
  );
};
