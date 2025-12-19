import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import { WishlistButton } from '@/components/WishlistButton';
import { LikeButton } from '@/components/LikeButton';
// NOTE: ProductCardMobile and ProductCard were imported but not used, 
// since 'isMobile' hook was missing in the original file.
// If the hook is available, ensure it is imported: import { useIsMobile } from '@/hooks/use-mobile'; 
import { ProductCard } from '@/components/ProductCard'; 
import { ProductCardMobile } from '@/components/ProductCardMobile';
import { ProductComments } from '@/components/ProductComments';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  ShoppingCart, 
  Leaf, 
  Star, 
  Truck, 
  Shield, 
  RotateCcw,
  ArrowLeft,
  Share2,
  X
} from 'lucide-react';

// NOTE: Since the useIsMobile hook was missing, I'm providing a simple placeholder 
// to ensure the component compiles. Replace this with your actual hook if needed.
const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return isMobile;
};

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { products, loading } = useProducts();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [vendorName, setVendorName] = useState<string>('');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const isMobile = useIsMobile(); // ✅ FIX: Added missing hook call

  // FIX: Ensure 'products' is treated as an array before using find
  const product = products?.find(p => p.id === id); 
  const similarProducts = product
    ? products.filter(p => p.id !== id && p.category === product.category).slice(0, 4)
    : [];

  useEffect(() => {
    const fetchVendorName = async () => {
      if (product?.vendor_id) {
        // ✅ Supabase fetch fix: Use limit(1) instead of single() for safer queries if vendor might not exist
        const { data, error } = await supabase 
          .from('approved_vendors')
          .select('store_name')
          .eq('id', product.vendor_id)
          .limit(1); 
        
        if (error) console.error("Error fetching vendor:", error);
        
        // Check if data is an array and has content, then use the first item
        if (data && data.length > 0) setVendorName(data[0].store_name);
      }
    };
    
    fetchVendorName();
  }, [product?.vendor_id]);

  // Use admin-set discount if available
  const hasDiscount = product?.has_discount && product?.discount_percentage && product?.original_price;
  const discountPercentage = hasDiscount ? product!.discount_percentage : 0;
  const originalPrice = hasDiscount ? product!.original_price : 0;

  const handleAddToCart = () => {
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
        title: "Out of stock",
        description: "This product is currently out of stock.",
        variant: "destructive",
      });
    }
  };
  
  // ✅ FIX: Added null check for product
  const amountSaved = hasDiscount && product 
    ? Number(originalPrice) - Number(product.price) 
    : 0;

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareText = `Check out ${product?.name} on Alphadom!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link Copied!",
        description: "Product link copied to clipboard.",
      });
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Product not found</h2>
          <Link to="/products">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-foreground transition-colors">Products</Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Image */}
          <div className="space-y-4">
            <div 
              className="relative overflow-hidden rounded-2xl bg-white shadow-lg cursor-pointer group"
              onClick={() => setIsImageModalOpen(true)}
            >
              <img
                src={product.image || '/placeholder.svg'}
                alt={product.name}
                className="w-full h-96 lg:h-[500px] object-cover transition-transform duration-300 group-hover:scale-90"
              />
              {product.sustainability_score != null && product.sustainability_score > 7 && (
                <Badge className="absolute top-4 left-4 bg-green-100 text-green-800 border-green-200">
                  <Leaf className="w-3 h-3 mr-1" />
                  Eco-Friendly
                </Badge>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 px-4 py-2 rounded-lg text-sm">
                  Click to view full image
                </span>
              </div>
            </div>
          </div>

          {/* Full Image Modal */}
          <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
            <DialogContent className="max-w-4xl w-full p-0 bg-transparent border-none">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10 bg-white/90 hover:bg-white rounded-full"
                onClick={() => setIsImageModalOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
              <img
                src={product.image || '/placeholder.svg'}
                alt={product.name}
                className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
              />
            </DialogContent>
          </Dialog>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-3">
                {product.category}
              </Badge>
              <h1 className="text-2xl lg:text-3xl font-bold mb-4 leading-tight">{product.name}</h1>
              
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {hasDiscount && (
                  <>
                    <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-0 text-sm px-3 py-1">
                      {discountPercentage}% off
                    </Badge>
                    <Badge className="bg-white text-orange-600 border border-orange-200 text-sm px-3 py-1 font-medium">
                      Special offer
                    </Badge>
                  </>
                )}
                {product.sustainability_score != null && product.sustainability_score > 7 && (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <Leaf className="w-3 h-3 mr-1" />
                    Eco-Friendly
                  </Badge>
                )}
              </div>

              {product.rating && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(product.rating!)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-gray-200 text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({product.rating.toFixed(1)}) • {product.reviews || 1247} reviews
                  </span>
                </div>
              )}

              {/* Pricing */}
              <div className="mb-6">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className={`text-3xl lg:text-4xl font-bold ${hasDiscount ? 'text-orange-600' : 'text-foreground'}`}>
                    ₦{product.price.toLocaleString()}
                  </span>

                  {hasDiscount && (
                    <span className="text-lg text-muted-foreground line-through">
                      ₦{originalPrice.toLocaleString()} {/* FIX: Changed to NGN and used toLocaleString */}
                    </span>
                  )}
                </div>
                {hasDiscount && (
                  <p className="text-sm text-green-600 font-medium">
                    You save: ₦{amountSaved.toLocaleString()} ({discountPercentage}%)
                  </p>

                )}
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                {product.full_description || product.description}
              </p>
              
              {/* Vendor Info */}
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold">Product From: </span>
                  {product.vendor_user_id ? (
                  <Link to={`/vendor/${product.vendor_user_id}`} className="text-primary hover:underline">
                    {vendorName || 'Vendor'}
                  </Link>
                  ) : (
                    <span className="text-primary font-semibold">Alphadom</span>
                  )}
                </p>
              </div>

              {product.eco_features && product.eco_features.length > 0 && product.eco_features.some(f => f && f.trim()) && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center">
                    <Leaf className="w-4 h-4 mr-2 text-green-600" />
                    Eco Features
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.eco_features.filter(f => f && f.trim()).map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-green-700 border-green-200">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {product.sustainability_score != null && product.sustainability_score > 0 && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Sustainability Score:</span>
                  <div className="flex items-center gap-1">
                    <Leaf className="w-4 h-4 text-green-600" />
                    <span className="font-bold text-green-600">
                      {product.sustainability_score}/10
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3"
                  >
                    -
                  </Button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3"
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <Button 
                  onClick={handleAddToCart}
                  disabled={(product.stock_count || 0) <= 0}
                  className="w-full h-12 text-lg bg-green-600 hover:bg-green-700 text-white border-0 transition-all duration-200 disabled:opacity-50"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {(product.stock_count || 0) <= 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
                <div className="flex gap-3 justify-center">
                  <WishlistButton productId={product.id} size="lg" className="flex-1 h-11" />
                  <LikeButton productId={product.id} size="lg" className="flex-1 h-11" />
                  <Button 
                    onClick={handleShare}
                    variant="outline"
                    className="flex-1 h-11"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              <div className="text-center">
                <Truck className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Fast Delivery</p>
                <p className="text-xs text-muted-foreground">Nationwide coverage</p>
              </div>
              <div className="text-center">
                <Shield className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Secure Payment</p>
                <p className="text-xs text-muted-foreground">SSL encrypted</p>
              </div>
              <div className="text-center">
                <RotateCcw className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Easy Returns</p>
                <p className="text-xs text-muted-foreground">7-days policy</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Specifications */}
        {product.specifications && (
          <Card className="mb-16">
            <CardHeader>
              <CardTitle>Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(product.specifications as Record<string, any>).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-muted">
                    <span className="font-medium capitalize">{key.replace('_', ' ')}</span>
                    <span className="text-muted-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Product Comments */}
        <ProductComments productId={product.id} />

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold mb-8">Similar Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4">
              {/* ✅ FIX: Correctly mapping over the 'similarProducts' array */}
              {similarProducts.map(similarProduct => (
                isMobile ? (
                  <ProductCardMobile key={similarProduct.id} product={similarProduct as any} />
                ) : (
                  <ProductCard key={similarProduct.id} product={similarProduct as any} />
                )
              ))}
            </div>
          </section>
        )}
        {/* Removed redundant and incorrect closing tags */}
      </div>
    </div>
  );
};

export default ProductDetail;