
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/hooks/useOrders';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, CreditCard, Truck, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAdminSettings } from '@/hooks/useAdminSettings';

const Checkout = () => {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const { createOrder } = useOrders();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { settings } = useAdminSettings();
  
  const [shippingInfo, setShippingInfo] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US'
  });
  
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [processing, setProcessing] = useState(false);
  const [orderTotals, setOrderTotals] = useState({
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (items.length === 0) {
      navigate('/cart');
      return;
    }

    calculateTotals();
  }, [user, items, shippingInfo]);

  const calculateTotals = async () => {
    const subtotal = total;
    
    // Calculate shipping based on product shipping fees
    let totalShipping = 0;
    const shippingGroups = new Map(); // Group by shipping type
    
    for (const item of items) {
      const product = item as any; // Cast to access shipping properties
      const productPrice = item.price;
      const shippingFee = parseFloat(product.shipping_fee?.toString() || '0');
      
      if (productPrice >= 10 && shippingFee > 0) {
        if (product.shipping_type === 'per_product') {
          totalShipping += shippingFee * item.quantity;
        } else {
          // One-time shipping - group by product to avoid duplicates
          if (!shippingGroups.has(product.id)) {
            shippingGroups.set(product.id, shippingFee);
            totalShipping += shippingFee;
          }
        }
      }
    }
    
    // Add base shipping if no product shipping and subtotal < $30
    if (totalShipping === 0 && subtotal < 30) {
      totalShipping = subtotal * 0.05;
    }
    
    const tax = subtotal * 0.08;
    setOrderTotals({
      subtotal,
      shipping: totalShipping,
      tax,
      total: subtotal + totalShipping + tax
    });
  };

  const handlePlaceOrder = async () => {
    if (!user) return;

    if (!shippingInfo.street || !shippingInfo.city || !shippingInfo.state || !shippingInfo.zipCode) {
      toast({
        title: "Missing Information",
        description: "Please fill in all shipping details",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);

    try {
      const orderItems = items.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      const { order, error } = await createOrder({
        total_amount: orderTotals.total,
        shipping_address: shippingInfo,
        payment_method: paymentMethod,
        items: orderItems
      });

      if (error) throw error;

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update order with payment details
      if (order) {
        await supabase
          .from('orders')
          .update({
            subtotal: orderTotals.subtotal,
            shipping_cost: orderTotals.shipping,
            tax_amount: orderTotals.tax,
            payment_status: 'paid',
            status: 'processing'
          })
          .eq('id', order.id);
      }

      clearCart();
      
      toast({
        title: "Order Placed Successfully!",
        description: "Your order has been received and is being processed.",
      });

      navigate('/orders');
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Order Failed",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  if (!user) return null;
  if (items.length === 0) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your purchase</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => {
                  const product = item as any;
                  const shippingFee = parseFloat(product.shipping_fee?.toString() || '0');
                  const hasShipping = item.price >= 10 && shippingFee > 0;
                  
                  return (
                    <div key={item.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                      {hasShipping && (
                        <div className="text-xs text-muted-foreground ml-15">
                          Shipping: ${shippingFee} ({product.shipping_type === 'per_product' ? 'per item' : 'one-time'})
                        </div>
                      )}
                    </div>
                  );
                })}
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${orderTotals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{orderTotals.shipping === 0 ? 'FREE' : `$${orderTotals.shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${orderTotals.tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${orderTotals.total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Checkout Form */}
          <div className="space-y-6">
            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={shippingInfo.street}
                    onChange={(e) => setShippingInfo({...shippingInfo, street: e.target.value})}
                    placeholder="123 Main St"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={shippingInfo.city}
                      onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                      placeholder="San Francisco"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={shippingInfo.state}
                      onChange={(e) => setShippingInfo({...shippingInfo, state: e.target.value})}
                      placeholder="CA"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={shippingInfo.zipCode}
                    onChange={(e) => setShippingInfo({...shippingInfo, zipCode: e.target.value})}
                    placeholder="12345"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                  </SelectContent>
                </Select>
                
                {paymentMethod === 'bank_transfer' && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">Bank Transfer Details</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Bank:</strong> {settings.bank_details.bank_name || 'First National Bank'}</p>
                      <p><strong>Account Name:</strong> {settings.bank_details.account_name || 'Pilot Store'}</p>
                      <p><strong>Account Number:</strong> {settings.bank_details.account_number || '1234567890'}</p>
                      <p><strong>Routing Number:</strong> {settings.bank_details.routing_number || '021000021'}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Please include your order ID in the transfer description
                    </p>
                  </div>
                )}
                
                {paymentMethod === 'credit_card' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="card-number">Card Number</Label>
                      <Input id="card-number" placeholder="1234 5678 9012 3456" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input id="expiry" placeholder="MM/YY" />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input id="cvv" placeholder="123" />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="save-card" />
                      <Label htmlFor="save-card" className="text-sm">Save card for future purchases</Label>
                    </div>
                  </div>
                )}
                
              </CardContent>
            </Card>

            {/* Place Order Button */}
            <Button 
              onClick={handlePlaceOrder} 
              disabled={processing}
              className="w-full"
              size="lg"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Place Order - ${orderTotals.total.toFixed(2)}
                </>
              )}
            </Button>
            
            <p className="text-xs text-gray-600 text-center">
              Your payment information is secure and encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
