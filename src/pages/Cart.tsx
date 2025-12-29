import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, Leaf, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { PlatformAd } from "@/components/PlatformAd";

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

const Cart = () => {
  const { items, removeFromCart, updateQuantity, totalPrice, totalSustainabilityImpact, clearCart } = useCart();

  const calculateTotals = () => {
    let subtotal = totalPrice;
    let shipping = 0;

    // Using a Set for tracking one-time fees by ID and Type.
    // This ensures that products with 'one_time' shipping fees are only charged once.
    const shippingGroups = new Set();

    for (const item of items) {
      // Ensure shippingFee is a number
      const shippingFee = parseFloat(item.shipping_fee?.toString() || "0");
      const shippingType = item.shipping_type || "one_time";
      // Create a unique key using product ID and shipping type for 'one_time' tracking
      const uniqueShippingKey = `${item.id}-${shippingType}`;

      // FIX APPLIED: Only check if a specific shipping fee is defined (shippingFee > 0).
      // The restrictive 'item.price >= 10' condition is removed.
      if (shippingFee > 0) {
        if (shippingType === "per_product") {
          // Per product: multiply the fee by the quantity
          shipping += shippingFee * item.quantity;
        } else {
          // One-time: applied once per unique product ID and shipping type
          if (!shippingGroups.has(uniqueShippingKey)) {
            shippingGroups.add(uniqueShippingKey);
            shipping += shippingFee;
          }
        }
      }
    }

    // Secondary shipping logic (e.g., small order fee) - this acts as a fallback if no custom shipping was applied
    if (shipping === 0 && subtotal < 30) {
      shipping = subtotal * 0.05;
    }

    const VAT_RATE = 0.025;
    const vat = subtotal * VAT_RATE; // 2.5% VAT
    const total = subtotal + shipping + vat;

    return { subtotal, shipping, vat, total };
  };

  const { subtotal, shipping, vat, total } = calculateTotals();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Card className="p-8">
            <CardContent>
              <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
              <p className="text-gray-600 mb-8">
                Looks like you haven't added any products yet. Start shopping to make a positive impact!
              </p>
              <Link to="/products">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">Review your product selections</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="bg-white">
                <CardContent className="p-3 sm:p-6">
                  <div className="flex gap-3 sm:gap-4">
                    <img
                      src={getDisplayImage(item.image)}
                      alt={item.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{item.name}</h3>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {item.category}
                          </Badge>
                        </div>
                        <div className="text-left sm:text-right flex-shrink-0">
                          <div className="text-base sm:text-lg font-bold text-green-600">
                            ₦{(item.price * item.quantity).toLocaleString()}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500">₦{item.price.toLocaleString()} each</div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1.5 sm:p-2 hover:bg-gray-100 transition-colors"
                            >
                              <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>
                            <span className="px-2 sm:px-4 py-1 sm:py-2 border-x border-gray-300 min-w-[40px] sm:min-w-[60px] text-center text-sm">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1.5 sm:p-2 hover:bg-gray-100 transition-colors"
                            >
                              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>
                          </div>

                          <Badge className="bg-green-100 text-green-800 flex items-center gap-1 text-xs">
                            <Leaf className="h-3 w-3" />
                            <span>{item.sustainabilityScore}/10</span>
                          </Badge>
                        </div>

                        {/* Remove Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 self-start sm:self-center"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Clear Cart */}
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={clearCart}
                className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Cart
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Items ({items.reduce((sum, item) => sum + item.quantity, 0)})</span>
                    <span className="font-medium">₦{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">₦{shipping.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Service Charge</span>
                    <span className="font-medium">₦{vat.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-4 border-t border-gray-200">
                    <span>Total</span>
                    <span className="text-green-600">₦{total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Sustainability Impact */}
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Leaf className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-800">Sustainability Impact</span>
                    </div>
                    <div className="text-sm text-green-700">
                      <p>
                        Total Impact Score: <span className="font-bold">{totalSustainabilityImpact}/10</span>
                      </p>
                      <p className="mt-1">🌱 You're making a positive environmental impact!</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Checkout Buttons */}
                <div className="space-y-3 pt-4">
                  <Link to="/checkout" className="block">
                    <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white">
                      Proceed to Checkout
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/products" className="block">
                    <Button variant="outline" size="lg" className="w-full">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>

                {/* Security Features */}
                <div className="text-xs text-gray-500 space-y-1 pt-4 border-t border-gray-200">
                  <p>✓ Secure checkout with SSL encryption</p>
                  <p>✓ 7-day return policy</p>
                  <p>✓ Carbon-neutral shipping included</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <PlatformAd targetPage="cart" />
    </div>
  );
};

export default Cart;
