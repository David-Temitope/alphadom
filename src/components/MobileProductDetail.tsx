import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Star, 
  Heart,
  ShoppingCart,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/hooks/useWishlist';
import { useProductRatings } from '@/hooks/useProductRatings';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { StarRating } from '@/components/StarRating';
import { ProductComments } from '@/components/ProductComments';

interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number | null;
  description?: string | null;
  full_description?: string | null;
  image?: string | null;
  category: string;
  rating?: number | null;
  reviews?: number | null;
  stock_count?: number | null;
  has_discount?: boolean | null;
  discount_percentage?: number | null;
  vendor_id?: string | null;
  vendor_user_id?: string | null;
  shipping_fee?: number | null;
  shipping_type?: string | null;
  vendor_subscription_plan?: string;
}

interface MobileProductDetailProps {
  product: Product;
  similarProducts: Product[];
}

export const MobileProductDetail: React.FC<MobileProductDetailProps> = ({ 
  product, 
  similarProducts 
}) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const navigate = useNavigate();
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [vendorName, setVendorName] = useState<string>('');
  const [vendorPhone, setVendorPhone] = useState<string>('');
  
  const { stats: ratingStats, rateProduct } = useProductRatings(product.id);

  const inWishlist = isInWishlist(product.id);

  useEffect(() => {
    const fetchVendorInfo = async () => {
      if (product?.vendor_id) {
        const { data: vendorData } = await supabase
          .from('approved_vendors')
          .select('store_name, application_id')
          .eq('id', product.vendor_id)
          .limit(1);

        if (vendorData && vendorData.length > 0) {
          setVendorName(vendorData[0].store_name);

          if (vendorData[0].application_id) {
            const { data: appData } = await supabase
              .from('shop_applications')
              .select('contact_phone')
              .eq('id', vendorData[0].application_id)
              .limit(1);

            if (appData && appData.length > 0 && appData[0].contact_phone) {
              setVendorPhone(appData[0].contact_phone);
            }
          }
        }
      }
    };
    fetchVendorInfo();
  }, [product?.vendor_id]);

  // Parse images
  const getImages = (): string[] => {
    if (!product?.image) return ['/placeholder.svg'];
    try {
      if (product.image.startsWith('[')) {
        return JSON.parse(product.image);
      }
      return [product.image];
    } catch {
      return [product.image];
    }
  };

  const images = getImages();
  const currentImage = images[selectedImageIndex] || images[0] || '/placeholder.svg';

  const hasDiscount = product?.has_discount && product?.discount_percentage && product?.original_price;
  const discountPercentage = hasDiscount ? product.discount_percentage : 0;
  const isOutOfStock = (product.stock_count || 0) <= 0;

  const formatPrice = (price: number) => {
    return '₦' + price.toLocaleString();
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to add items to cart.",
      });
      navigate('/auth');
      return;
    }

    if (isOutOfStock) {
      toast({
        title: "Out of Stock",
        description: "This product is currently out of stock.",
        variant: "destructive",
      });
      return;
    }

    addToCart(product as any);
    toast({
      title: "Added to cart",
      description: `${product.name} added to your cart.`,
    });
  };

  const handleBuyNow = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to continue.",
      });
      navigate('/auth');
      return;
    }

    if (isOutOfStock) {
      toast({
        title: "Out of Stock",
        description: "This product is currently out of stock.",
        variant: "destructive",
      });
      return;
    }

    addToCart(product as any);
    navigate('/checkout');
  };

  const handleRateProduct = async (stars: number) => {
    await rateProduct(stars);
  };

  const getDisplayImage = (imageField: string | null | undefined): string => {
    if (!imageField) return '/placeholder.svg';
    try {
      if (imageField.startsWith('[')) {
        const imgs = JSON.parse(imageField);
        return imgs[0] || '/placeholder.svg';
      }
      return imageField;
    } catch {
      return imageField;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center justify-between px-4 h-14">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => toggleWishlist(product.id)}
              className="p-2"
            >
              <Heart className={`w-5 h-5 ${inWishlist ? 'fill-destructive text-destructive' : ''}`} />
            </button>
            <button 
              className="p-2"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: product.name,
                    text: `Check out ${product.name} on Alphadom!`,
                    url: window.location.href,
                  }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  toast({
                    title: "Link Copied",
                    description: "Product link copied to clipboard!",
                  });
                }
              }}
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Image */}
      <div className="relative aspect-square bg-muted">
        <img
          src={currentImage}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        
        {/* Image Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === selectedImageIndex 
                    ? 'bg-primary w-5' 
                    : 'bg-white/60'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="px-4 py-5 space-y-5">
        {/* Verified Vendor - Clickable */}
        {vendorName && product.vendor_user_id && (
          <Link to={`/vendor/${product.vendor_user_id}`} className="text-xs text-muted-foreground inline-block">
            Sold by <span className="text-primary font-medium hover:underline">{vendorName}</span>
          </Link>
        )}
        {vendorName && !product.vendor_user_id && (
          <p className="text-xs text-muted-foreground">
            Sold by <span className="text-primary font-medium">{vendorName}</span>
          </p>
        )}

        {/* Product Name */}
        <h1 className="text-xl font-bold text-foreground leading-tight">
          {product.name}
        </h1>

        {/* Price */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-2xl font-bold text-foreground">
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <>
              <span className="text-base text-muted-foreground line-through">
                {formatPrice(Number(product.original_price))}
              </span>
              <Badge variant="destructive" className="text-xs">
                -{discountPercentage}%
              </Badge>
            </>
          )}
        </div>

        {/* Rating Info */}
        <div className="flex items-center gap-2 text-sm">
          <Star className="w-4 h-4 fill-primary text-primary" />
          <span className="font-medium">{(product.rating || 0).toFixed(1)}/5</span>
          <span className="text-muted-foreground">
            ({product.reviews || 0} reviews)
          </span>
        </div>

        {/* WhatsApp Button */}
        {vendorPhone && (
          <WhatsAppButton
            phoneNumber={vendorPhone}
            vendorName={vendorName}
            productName={product.name}
            variant="product"
            className="w-full"
          />
        )}

        {/* Product Description */}
        <div className="space-y-3">
          <h3 className="font-semibold text-base">Product Description</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {product.full_description || product.description || 
              `Experience ultimate comfort and quality with ${product.name}. Designed specifically for modern users, featuring premium materials and exceptional craftsmanship.`}
          </p>
        </div>

        {/* User Rating Section */}
        <div className="space-y-4 pt-2 border-t border-border/30">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-base">Rate this product</h3>
            {ratingStats.userRating && (
              <span className="text-xs text-primary">You rated: {ratingStats.userRating} stars</span>
            )}
          </div>
          <StarRating
            rating={ratingStats.averageRating}
            interactive={true}
            onRate={handleRateProduct}
            userRating={ratingStats.userRating}
            size="lg"
          />
        </div>

        {/* Reviews Section */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-base">Reviews</h3>
            <span className="text-xs text-muted-foreground">
              {ratingStats.totalRatings} ratings
            </span>
          </div>
          
          {/* Rating Bars */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-8">
                  <span className="text-sm font-medium">{star}</span>
                  <Star className="w-3 h-3 fill-primary text-primary" />
                </div>
                <Progress 
                  value={ratingStats.distribution[star - 1]} 
                  className="h-2 flex-1" 
                />
                <span className="text-xs text-muted-foreground w-10 text-right">
                  {ratingStats.distribution[star - 1]}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Comments Section */}
        <ProductComments productId={product.id} />

        {/* You Might Also Like */}
        {similarProducts.length > 0 && (
          <div className="space-y-4 pt-4">
            <h3 className="font-semibold text-base">You might also like</h3>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
              {similarProducts.slice(0, 4).map((p) => (
                <Link
                  key={p.id}
                  to={`/products/${p.id}`}
                  className="flex-shrink-0 w-36"
                >
                  <div className="bg-card rounded-xl overflow-hidden border border-border/50">
                    <div className="aspect-square bg-muted">
                      <img
                        src={getDisplayImage(p.image)}
                        alt={p.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                      />
                    </div>
                    <div className="p-2.5 space-y-1">
                      <h4 className="text-xs font-medium text-foreground line-clamp-1">
                        {p.name}
                      </h4>
                      <p className="text-sm font-bold text-foreground">
                        {formatPrice(p.price)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Bar - positioned above bottom nav */}
      <div className="fixed bottom-16 left-0 right-0 z-40 bg-background border-t border-border/50 px-4 py-3">
        <div className="flex gap-3">
          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            variant="outline"
            className="flex-1 h-12 rounded-xl font-semibold"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Add to Cart
          </Button>
          <Button
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            className="flex-1 h-12 rounded-xl font-semibold"
          >
            Buy Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileProductDetail;
