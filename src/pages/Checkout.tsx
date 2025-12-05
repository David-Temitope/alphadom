import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/hooks/useOrders';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, CreditCard, Truck, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAdminSettings } from '@/hooks/useAdminSettings';

const VAT_RATE = 0.025; // 2.5% VAT

declare global {
  interface Window {
    PaystackPop?: any;
  }
}

const Checkout: React.FC = () => {
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
    country: 'NG',
    phone: ''
  });

  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'paystack'>('bank_transfer');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [orderTotals, setOrderTotals] = useState({
    subtotal: 0,
    shipping: 0,
    vat: 0,
    total: 0
  });
  const [vendorBankDetails, setVendorBankDetails] = useState<any>(null);
  const [productVendor, setProductVendor] = useState<any>(null);

  // Fetch vendor bank details (single-vendor checkout assumed)
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!items || items.length === 0) {
      navigate('/cart');
      return;
    }

    calculateTotals();
    fetchVendorBankDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, items, shippingInfo]);

  // If there are no vendor bank details (admin product), hide/disable bank_transfer
  useEffect(() => {
    if (!vendorBankDetails && paymentMethod === 'bank_transfer') {
      setPaymentMethod('paystack');
    }
  }, [vendorBankDetails, paymentMethod]);

  const fetchVendorBankDetails = async () => {
    if (items.length === 0) return;

    // Get the first product's vendor (assuming single vendor checkout for now)
    const firstProduct = items[0] as any;
    if (firstProduct.vendor_id) {
      try {
        // Product added by vendor - fetch vendor's bank details
        const { data, error } = await supabase
          .from('approved_vendors')
          .select('*, shop_applications!inner(vendor_bank_details)')
          .eq('id', firstProduct.vendor_id)
          .single();

        if (error) {
          console.warn('Vendor fetch error:', error);
          setVendorBankDetails(null);
          setProductVendor(null);
          return;
        }

        setProductVendor(data);
        const shopApp = (data as any).shop_applications;
        if (shopApp && shopApp.vendor_bank_details) {
          setVendorBankDetails(shopApp.vendor_bank_details);
        } else {
          setVendorBankDetails(null);
        }
      } catch (err) {
        console.error('fetchVendorBankDetails error:', err);
        setVendorBankDetails(null);
        setProductVendor(null);
      }
    } else {
      // Product added by admin - use admin bank details from settings
      setVendorBankDetails(null); // Will fall back to admin settings
    }
  };

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
    
    const vat = subtotal * VAT_RATE; // 2.5% VAT
    setOrderTotals({
      subtotal,
      shipping: totalShipping,
      vat,
      total: subtotal + totalShipping + vat
    });
  };

  const uploadReceipt = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const filePath = `receipts/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  // -------------------------
  // Paystack integration
  // -------------------------
  const handlePaystackPayment = () => {
    if (!user) {
      toast({ title: 'Not signed in', description: 'Please sign in to continue', variant: 'destructive' });
      return;
    }

    if (!window.PaystackPop) {
      toast({ title: 'Payment Error', description: 'Paystack script not loaded. Please refresh and try again.', variant: 'destructive' });
      return;
    }

    const handler = window.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email: user.email || (user?.user_metadata?.email ?? ''),
      amount: Math.round((orderTotals.total || 0) * 100), // kobo
      currency: 'NGN',
      ref: `ALPHADOM_${Date.now()}`,
      metadata: {
        custom_fields: [
          {
            display_name: 'Customer Phone',
            variable_name: 'phone',
            value: shippingInfo.phone
          }
        ]
      },
      callback: function(response: any) {
  setProcessing(true);
  createOrder({
    total_amount: orderTotals.total,
    shipping_address: shippingInfo,
    payment_method: 'paystack',
    items: items.map(it => ({ product_id: it.id, quantity: it.quantity, price: it.price }))
  })
    .then(({ order, error }) => {
      if (error) throw error;

      return supabase
        .from('orders')
        .update({ payment_status: 'paid', status: 'processing' })
        .eq('id', order.id);
    })
    .then(() => {
      clearCart();
      toast({ title: 'Payment Successful', description: 'Your order has been placed.' });
      navigate('/orders');
    })
    .catch(err => {
      console.error('post-paystack-order error:', err);
      toast({ title: 'Order Error', description: 'Failed to create order after payment', variant: 'destructive' });
    })
    .finally(() => setProcessing(false));
}
,
      onClose: function () {
        toast({ title: 'Payment Cancelled', description: 'You closed the payment window', variant: 'destructive' });
      }
    });

    handler.openIframe();
  };

  // -------------------------
  // Main place order handler
  // -------------------------
  const handlePlaceOrder = async () => {
    if (!user) return;

    // Validate shipping info
    if (!shippingInfo.street || !shippingInfo.city || !shippingInfo.state || !shippingInfo.zipCode || !shippingInfo.phone) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all shipping details including phone number',
        variant: 'destructive'
      });
      return;
    }

    // If payment method is paystack -> open paystack flow
    if (paymentMethod === 'paystack') {
      handlePaystackPayment();
      return;
    }

    // Bank transfer route (only shown when vendor has bank details)
    if (paymentMethod === 'bank_transfer') {
      if (!vendorBankDetails) {
        toast({
          title: 'Payment Method Unavailable',
          description: 'Bank transfer is not available for this product. Choose Paystack instead.',
          variant: 'destructive'
        });
        setPaymentMethod('paystack');
        return;
      }

      if (!receiptFile) {
        toast({
          title: 'Missing Receipt',
          description: 'Please upload your payment receipt',
          variant: 'destructive'
        });
        return;
      }
    }

    setProcessing(true);

    try {
      let uploadedReceiptUrl = '';
      
      // Upload receipt if bank transfer
      if (paymentMethod === 'bank_transfer' && receiptFile) {
        uploadedReceiptUrl = await uploadReceipt(receiptFile);
      }

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

      // Update order with payment details and receipt
      if (order) {
        const updateData: any = {
          subtotal: orderTotals.subtotal,
          shipping_cost: orderTotals.shipping,
          tax_amount: orderTotals.vat,
          payment_status: paymentMethod === 'bank_transfer' ? 'pending' : 'paid',
          status: paymentMethod === 'bank_transfer' ? 'pending' : 'processing'
        };

        if (uploadedReceiptUrl) {
          updateData.receipt_image = uploadedReceiptUrl;
        }

        await supabase
          .from('orders')
          .update(updateData)
          .eq('id', order.id);
      }

      clearCart();

      toast({
        title: 'Order Placed Successfully!',
        description: 'Your order has been received and is being processed.'
      });

      navigate('/orders');
    } catch (err) {
      console.error('Error placing order:', err);
      toast({
        title: 'Order Failed',
        description: 'There was an error processing your order. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setProcessing(false);
    }
  };

  if (!user) return null;
  if (!items || items.length === 0) return null;

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
                        <p className="font-medium">₦{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                      {hasShipping && (
                        <div className="text-xs text-muted-foreground ml-15">
                          Shipping: ₦{shippingFee.toLocaleString()} ({product.shipping_type === 'per_product' ? 'per item' : 'one-time'})
                        </div>
                      )}
                    </div>
                  );
                })}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₦{orderTotals.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{orderTotals.shipping === 0 ? 'FREE' : `₦${orderTotals.shipping.toLocaleString()}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VAT (2.5%)</span>
                    <span>₦{orderTotals.vat.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₦{orderTotals.total.toLocaleString()}</span>
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
                    onChange={(e) => setShippingInfo({ ...shippingInfo, street: e.target.value })}
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

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={shippingInfo.phone}
                    onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                    placeholder="+234 800 000 0000"
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
                <Select value={paymentMethod} onValueChange={(value: 'bank_transfer' | 'paystack') => setPaymentMethod(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paystack">Pay with Paystack (Card/Bank/USSD)</SelectItem>
                    {vendorBankDetails && (
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    )}
                  </SelectContent>
                </Select>

                {paymentMethod === 'bank_transfer' && vendorBankDetails && (
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <h4 className="font-medium">Bank Transfer Details</h4>
                    <p className="text-sm">Bank: {vendorBankDetails.bank_name}</p>
                    <p className="text-sm">Account Name: {vendorBankDetails.account_name}</p>
                    <p className="text-sm">Account Number: {vendorBankDetails.account_number}</p>
                    <p className="text-sm font-medium text-primary">
                      Amount: ₦{orderTotals.total.toLocaleString()}
                    </p>
                    <Separator className="my-3" />
                    <div>
                      <Label htmlFor="receipt">Upload Payment Receipt</Label>
                      <Input
                        id="receipt"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                        className="mt-2"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'paystack' && (
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      You'll be redirected to Paystack to complete your payment securely.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Button
              onClick={handlePlaceOrder}
              disabled={processing}
              className="w-full"
              size="lg"
            >
              {processing ? (
                'Processing...'
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  {paymentMethod === 'paystack' ? 'Pay Now' : 'Place Order'}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
