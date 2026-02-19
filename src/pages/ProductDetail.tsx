import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { WishlistButton } from '@/components/WishlistButton';
import { ProductCard } from '@/components/ProductCard';
import { ProductCardMobile } from '@/components/ProductCardMobile';
import { ProductComments } from '@/components/ProductComments';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { MobileProductDetail } from '@/components/MobileProductDetail';
import { StarRating } from '@/components/StarRating';
import { useProductRatings } from '@/hooks/useProductRatings';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ProductDetailSkeleton } from '@/components/skeletons/PageSkeletons';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  ShoppingCart,
  Star,
  Truck,
  Shield,
  ChevronRight,
  X,
  BadgeCheck,
  Minus,
  Plus,
  Store,
  MessageCircle,
} from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { products, loading } = useProducts();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [vendorName, setVendorName] = useState<string>('');
  const [vendorPhone, setVendorPhone] = useState<string>('');
  const [vendorUserId, setVendorUserId] = useState<string>('');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const isMobile = useIsMobile();
  const { stats: ratingStats, rateProduct } = useProductRatings(id || '');

  const product = products?.find(p => p.id === id);
  const similarProducts = product
    ? products.filter(p => p.id !== id && p.category === product.category).slice(0, 6)
    : [];

  useEffect(() => {
    const fetchVendorInfo = async () => {
      if (product?.vendor_id) {
        const { data: vendorData } = await supabase
          .from('approved_vendors')
          .select('store_name, application_id, user_id')
          .eq('id', product.vendor_id)
          .limit(1);

        if (vendorData && vendorData.length > 0) {
          setVendorName(vendorData[0].store_name);
          setVendorUserId(vendorData[0].user_id);

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

  const hasDiscount = product?.has_discount && product?.discount_percentage && product?.original_price;
  const discountPercentage = hasDiscount ? product!.discount_percentage : 0;
  const originalPrice = hasDiscount ? product!.original_price : 0;

  const handleAddToCart = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login or sign up to add items to your cart.",
      });
      navigate('/auth');
      return;
    }

    if (product && (product.stock_count || 0) > 0) {
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
      toast({
        title: "Added to cart",
        description: `${quantity} x ${product.name} added to your cart.`,
      });
    } else {
      toast({
        title: "Out of Stock",
        description: "This product is currently out of stock.",
        variant: "destructive",
      });

      if (product?.vendor_user_id) {
        await supabase.from('user_notifications').insert({
          user_id: product.vendor_user_id,
          title: 'Product Out of Stock',
          message: `Your product "${product.name}" is out of stock and a customer tried to purchase it.`,
          type: 'stock_alert',
          related_id: product.id,
        });
      }
    }
  };

  // Parse product images
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

  const images = product ? getImages() : [];
  const currentImage = images[selectedImageIndex] || images[0] || '/placeholder.svg';

  // Calculate rating distribution (simulated from real data)
  const getRatingDistribution = () => {
    const baseRating = product?.rating || 3;
    const reviews = product?.reviews || 0;
    if (reviews === 0) return [0, 0, 0, 0, 0];
    
    // Distribute based on actual rating
    const distribution = [0, 0, 0, 0, 0];
    distribution[Math.floor(baseRating) - 1] = 70;
    distribution[Math.min(4, Math.floor(baseRating))] = 20;
    distribution[Math.max(0, Math.floor(baseRating) - 2)] = 10;
    return distribution;
  };

  const ratingDistribution = getRatingDistribution();

  if (loading) return <ProductDetailSkeleton />;

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Product not found</h2>
          <Link to="/products">
            <Button className="bg-primary hover:bg-primary/90">Back to Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Render mobile version
  if (isMobile) {
    return <MobileProductDetail product={product as any} similarProducts={similarProducts as any} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/products" className="hover:text-foreground transition-colors">{product.category}</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div
              className="relative aspect-square overflow-hidden rounded-2xl bg-muted cursor-pointer group border"
              onClick={() => setIsImageModalOpen(true)}
            >
              <img
                src={currentImage}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <img src={img} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Full Image Modal */}
          <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
            <DialogContent className="max-w-4xl w-full p-0 bg-transparent border-none">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10 bg-background/90 hover:bg-background rounded-full"
                onClick={() => setIsImageModalOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
              <img src={currentImage} alt={product.name} className="w-full h-auto max-h-[90vh] object-contain rounded-lg" />
            </DialogContent>
          </Dialog>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Badge */}
            <div className="flex items-center gap-3 flex-wrap">
              {hasDiscount && (
                <Badge className="bg-primary text-primary-foreground">NEW ARRIVAL</Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2 flex-wrap">
              {product.name}
              {(product as any).vendor_subscription_plan === 'first_class' && (
                <BadgeCheck className="w-6 h-6 text-amber-500 flex-shrink-0" aria-label="Verified First Class Vendor" />
              )}
              {(product as any).vendor_subscription_plan === 'economy' && (
                <BadgeCheck className="w-6 h-6 text-blue-500 flex-shrink-0" aria-label="Verified Economy Vendor" />
              )}
              {(product as any).vendor_is_registered && (product as any).vendor_subscription_plan === 'free' && (
                <BadgeCheck className="w-6 h-6 text-primary flex-shrink-0" aria-label="Registered Business" />
              )}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating || 0)
                        ? 'fill-primary text-primary'
                        : 'fill-muted text-muted'
                    }`}
                  />
                ))}
              </div>
              <span className="font-semibold">{(product.rating || 0).toFixed(1)}</span>
              <span className="text-muted-foreground text-sm">
                {product.reviews || 0} Customer Reviews
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-3xl font-bold text-foreground">
                ₦{product.price.toLocaleString()}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    ₦{Number(originalPrice).toLocaleString()}
                  </span>
                  <Badge variant="destructive" className="text-xs">
                    Save {discountPercentage}%
                  </Badge>
                </>
              )}
            </div>

            {/* Vendor Info */}
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl border">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Store className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {vendorName || 'Alphadom Official Store'}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <BadgeCheck className="w-3 h-3 text-primary" aria-hidden="true" />
                  VERIFIED MERCHANT
                </p>
              </div>
              {vendorUserId && (
                <Link to={`/vendor/${vendorUserId}`}>
                  <Button variant="ghost" size="sm" className="text-primary">
                    Visit Store →
                  </Button>
                </Link>
              )}
            </div>

            {/* Quantity & Add to Cart */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Quantity</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border rounded-lg">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 h-10"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="px-6 font-medium">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 h-10"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {(product.stock_count || 0) > 0
                      ? `${product.stock_count} in stock`
                      : 'Out of stock'}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={(product.stock_count || 0) <= 0}
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
                <WishlistButton productId={product.id} size="lg" className="w-full h-12" />
              </div>

              {/* Star Rating for Users */}
              <div className="p-4 bg-muted/50 rounded-xl border">
                <p className="text-sm font-medium mb-3">Rate this product</p>
                <StarRating
                  rating={product.rating || 0}
                  userRating={ratingStats.userRating}
                  interactive={!!user}
                  onRate={(stars) => rateProduct(stars)}
                  size="lg"
                />
                {!user && (
                  <p className="text-xs text-muted-foreground mt-2">
                    <Link to="/auth" className="text-primary hover:underline">Sign in</Link> to rate this product
                  </p>
                )}
              </div>
            </div>

            {/* WhatsApp Chat Button */}
            {vendorPhone && (
              <WhatsAppButton
                phoneNumber={vendorPhone}
                vendorName={vendorName}
                productName={product.name}
                variant="product"
                className="w-full h-12"
              />
            )}

            {/* Trust Badges */}
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center gap-3 text-sm">
                <Truck className="w-5 h-5 text-primary" />
                <span>Free nationwide shipping on orders over ₦50,000</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield className="w-5 h-5 text-primary" />
                <span>24-month official manufacturer warranty</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-12">
          <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0 gap-8">
            <TabsTrigger
              value="description"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3"
            >
              Description
            </TabsTrigger>
            <TabsTrigger
              value="specifications"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3"
            >
              Specifications
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3"
            >
              Customer Reviews ({product.reviews || 0})
            </TabsTrigger>
            <TabsTrigger
              value="shipping"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3"
            >
              Shipping & Returns
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h3 className="text-xl font-bold mb-4">{product.name}</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {product.full_description || product.description || 'No description available.'}
                </p>

                {/* Feature highlights */}
                {product.eco_features && product.eco_features.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    {product.eco_features.filter(f => f?.trim()).slice(0, 4).map((feature, i) => (
                      <Card key={i} className="p-4">
                        <h4 className="font-semibold text-sm mb-1">Feature {i + 1}</h4>
                        <p className="text-xs text-muted-foreground">{feature}</p>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Rating Summary */}
              <Card className="p-6 h-fit">
                <h4 className="font-semibold mb-4">Rating Summary</h4>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold">{(product.rating || 0).toFixed(1)}</div>
                  <div className="flex justify-center my-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating || 0) ? 'fill-primary text-primary' : 'fill-muted text-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">Based on {product.reviews || 0} reviews</p>
                </div>

                {/* Rating Bars */}
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((star, i) => (
                    <div key={star} className="flex items-center gap-2 text-sm">
                      <span className="w-3">{star}</span>
                      <Progress value={ratingDistribution[star - 1]} className="h-2 flex-1" />
                      <span className="w-10 text-right text-muted-foreground">{ratingDistribution[star - 1]}%</span>
                    </div>
                  ))}
                </div>

                <Button 
                  variant="outline" 
                  className="w-full mt-4 border-primary text-primary hover:bg-primary/5"
                  onClick={() => setActiveTab('reviews')}
                >
                  Write a Review
                </Button>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="specifications" className="pt-6">
            {product.specifications ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(product.specifications as Record<string, any>).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-3 border-b">
                    <span className="font-medium capitalize">{key.replace('_', ' ')}</span>
                    <span className="text-muted-foreground">{String(value)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No specifications available.</p>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="pt-6">
            <ProductComments productId={product.id} />
          </TabsContent>

          <TabsContent value="shipping" className="pt-6">
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-start gap-3">
                <Truck className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-semibold">Shipping</h4>
                  <p className="text-sm text-muted-foreground">
                    We offer nationwide delivery. Shipping fees vary by location and are calculated at checkout.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-semibold">Returns</h4>
                  <p className="text-sm text-muted-foreground">
                    7-day return policy. Items must be unused and in original packaging.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">You Might Also Like</h2>
              <Link to="/products" className="text-sm text-primary hover:underline">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {similarProducts.map(p =>
                isMobile ? (
                  <ProductCardMobile key={p.id} product={p as any} />
                ) : (
                  <ProductCard key={p.id} product={p as any} />
                )
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
