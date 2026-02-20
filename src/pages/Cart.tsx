import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Lock, Truck, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { useProducts } from "@/hooks/useProducts";
import { useVendors } from "@/hooks/useVendors";
import { ProductCard } from "@/components/ProductCard";
import { ProductCardMobile } from "@/components/ProductCardMobile";
import { useState, useEffect, useMemo } from "react";
import { useSEO } from "@/hooks/useSEO";

// Helper function to extract first image from JSON array or single image
const getDisplayImage = (image: string | null | undefined): string => {
  if (!image) return '/placeholder.svg';
  try {
    const parsed = JSON.parse(image);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed[0];
    }
    return image;
  } catch {
    return image;
  }
};

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isMobile;
};

const Cart = () => {
  useSEO({
    title: "Shopping Cart",
    noindex: true,
  });
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const { products } = useProducts();
  const { vendors } = useVendors();
  const [promoCode, setPromoCode] = useState('');
  const isMobile = useIsMobile();

  // Create vendor lookup map using both id and user_id for matching
  const vendorLookup = useMemo(() => {
    const map = new Map<string, string>();
    vendors.forEach(v => {
      map.set(v.id, v.store_name);
      map.set(v.user_id, v.store_name);
    });
    return map;
  }, [vendors]);

  // Find vendor name for an item - check vendor_id first, then look up in products
  const getVendorName = (vendorId: string | null | undefined, productId?: string) => {
    if (vendorId && vendorLookup.has(vendorId)) {
      return vendorLookup.get(vendorId) || 'Vendor';
    }
    
    // Try to find from product's vendor_id in products array
    if (productId) {
      const product = products.find(p => p.id === productId);
      if (product?.vendor_id && vendorLookup.has(product.vendor_id)) {
        return vendorLookup.get(product.vendor_id) || 'Vendor';
      }
    }
    
    // No vendor found means it's a platform product
    if (!vendorId) return 'Alphadom Store';
    
    return 'Vendor';
  };

  // Get frequently bought together products (random products from different categories)
  const frequentlyBoughtTogether = products
    ?.filter(p => !items.some(item => item.id === p.id) && (p.stock_count || 0) > 0)
    .slice(0, 4) || [];

  const calculateTotals = () => {
    let subtotal = totalPrice;
    let shipping = 0;

    const shippingGroups = new Set();

    for (const item of items) {
      const shippingFee = parseFloat(item.shipping_fee?.toString() || "0");
      const shippingType = item.shipping_type || "one_time";
      const uniqueShippingKey = `${item.id}-${shippingType}`;

      if (shippingFee > 0) {
        if (shippingType === "per_product") {
          shipping += shippingFee * item.quantity;
        } else {
          if (!shippingGroups.has(uniqueShippingKey)) {
            shippingGroups.add(uniqueShippingKey);
            shipping += shippingFee;
          }
        }
      }
    }

    if (shipping === 0 && subtotal < 30) {
      shipping = subtotal * 0.05;
    }

    const TAX_RATE = 0.025;
    const tax = subtotal * TAX_RATE;
    const total = subtotal + shipping + tax;

    return { subtotal, shipping, tax, total };
  };

  const { subtotal, shipping, tax, total } = calculateTotals();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background py-16">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <Card className="p-12">
            <CardContent className="pt-6">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                <ShoppingBag className="h-10 w-10 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Your cart is empty</h2>
              <p className="text-muted-foreground mb-8">
                Looks like you haven't added any products yet. Start shopping to find great deals!
              </p>
              <Link to="/products">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Continue Shopping
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">Shopping Cart</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Shopping Cart</h1>
          <p className="text-muted-foreground">
            You have {items.length} {items.length === 1 ? 'item' : 'items'} ready for checkout
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex gap-4">
                    <Link to={`/products/${item.id}`} className="flex-shrink-0">
                      <img
                        src={getDisplayImage(item.image)}
                        alt={item.name}
                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border"
                      />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link to={`/products/${item.id}`}>
                            <h3 className="font-semibold text-foreground hover:text-primary transition-colors truncate">
                              {item.name}
                            </h3>
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            Sold by: <span className="text-primary">{getVendorName(item.vendor_id, item.id)}</span>
                          </p>
                          <p className="text-lg font-bold text-foreground mt-1">
                            ₦{item.price.toLocaleString()}
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          {/* Quantity Controls */}
                          <div className="flex items-center border rounded-lg">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-2 hover:bg-muted transition-colors"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="px-4 py-2 min-w-[50px] text-center font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-2 hover:bg-muted transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-destructive hover:text-destructive/80 text-sm font-medium uppercase tracking-wide"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Clear Cart */}
            <div className="flex justify-end">
              <Button
                variant="ghost"
                onClick={clearCart}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Cart
              </Button>
            </div>
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Cart Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">₦{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Estimated Shipping</span>
                    <span className="font-medium">₦{shipping.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-medium">₦{tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-3 border-t">
                    <span>Order Total</span>
                    <span>₦{total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Promo Code */}
                <div className="pt-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
                    Promo Code
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Enter code"
                      className="flex-1"
                    />
                    <Button variant="outline" size="sm" className="px-4">
                      Apply
                    </Button>
                  </div>
                </div>

                {/* Checkout Button */}
                <Link to="/checkout" className="block pt-2">
                  <Button size="lg" className="w-full bg-primary hover:bg-primary/90">
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>

                {/* Security Badges */}
                <div className="space-y-2 pt-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-primary" />
                    <span>Secure checkout with SSL encryption</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-primary" />
                    <span>Free shipping on orders over ₦50,000</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Frequently Bought Together */}
        {frequentlyBoughtTogether.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl font-bold mb-6">Frequently Bought Together</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {frequentlyBoughtTogether.map((product) =>
                isMobile ? (
                  <ProductCardMobile key={product.id} product={product as any} />
                ) : (
                  <ProductCard key={product.id} product={product as any} />
                )
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Cart;
