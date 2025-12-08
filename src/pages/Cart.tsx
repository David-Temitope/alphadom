import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, Leaf, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";

const Cart = () => {
  const { items, removeFromCart, updateQuantity, totalPrice, totalSustainabilityImpact, clearCart } = useCart();

  const calculateTotals = () => {
    let subtotal = totalPrice;
    let shipping = 0;
    
    // Using a Set for tracking one-time fees by ID and Type.
    const shippingGroups = new Set(); 

    for (const item of items) {
      // FIX 1: Robustly parse shippingFee and ensure it's a finite positive number.
      // Use Number() conversion and fall back to 0 if NaN.
      const rawShippingFee = item.shipping_fee;
      const shippingFee = isFinite(Number(rawShippingFee)) ? Number(rawShippingFee) : 0;
      
      const shippingType = item.shipping_type || 'one_time';
      const uniqueShippingKey = `${item.id}-${shippingType}`;

      if (shippingFee > 0) {
        if (shippingType === 'per_product') {
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

    // Secondary shipping logic (e.g., small order fee)
    if (shipping === 0 && subtotal < 30) {
      shipping = subtotal * 0.05;
    }

    const VAT_RATE = 0.025;
    const vat = subtotal * VAT_RATE; // 2.5% VAT
    const total = subtotal + shipping + vat;

    // FIX 2: Round all currency outputs to 2 decimal places to prevent floating point errors
    return { 
      subtotal: parseFloat(subtotal.toFixed(2)), 
      shipping: parseFloat(shipping.toFixed(2)), 
      vat: parseFloat(vat.toFixed(2)), 
      total: parseFloat(total.toFixed(2)) 
    };
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
  };

  

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
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                    />
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {item.category}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            ₦{(item.price * item.quantity).toLocaleString()}
                          </div>

                          <div className="text-sm text-gray-500">
                            ₦{item.price.toLocaleString()} each
                          </div>

                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-2 hover:bg-gray-100 transition-colors"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="px-4 py-2 border-x border-gray-300 min-w-[60px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-2 hover:bg-gray-100 transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          <Badge className="bg-green-100 text-green-800 flex items-center space-x-1">
                            <Leaf className="h-3 w-3" />
                            <span>Score: {item.sustainabilityScore}/10</span>
                          </Badge>
                        </div>

                        {/* Remove Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
                    <span className="font-medium text-green-600">
                      {/* Using the calculated shipping fee */}
                      {shipping > 0 ? `₦${shipping.toLocaleString()}` : 'FREE'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
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
                      <p>Total Impact Score: <span className="font-bold">{totalSustainabilityImpact}/10</span></p>
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
    </div>
  );
};

export default Cart;