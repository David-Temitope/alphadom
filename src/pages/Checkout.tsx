import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

// --- Types & Constants ---
const VAT_RATE = 0.025; // 2.5% VAT

declare global {
  interface Window {
    PaystackPop?: any;
  }
}

type ShippingInfo = {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string; // Assuming 'NG'
  phone: string;
};

type OrderTotals = {
  subtotal: number;
  shipping: number;
  vat: number;
  total: number;
};

type PaymentMethod = 'bank_transfer' | 'paystack';

// --- Utility Functions ---

/**
 * Calculates the shipping cost for all items in the cart.
 * @param items - The items in the shopping cart.
 * @param subtotal - The subtotal of all items.
 * @returns The total shipping cost.
 */
const calculateShipping = (items: any[], subtotal: number): number => {
  let totalShipping = 0;
  const shippingGroups = new Map<string | number, number>(); // Group by product ID for one-time shipping

  for (const item of items) {
    const product = item as any;
    const shippingFee = parseFloat(product.shipping_fee?.toString() || '0');

    // Only apply shipping fee if product price is reasonable and fee > 0
    if (item.price >= 10 && shippingFee > 0) {
      if (product.shipping_type === 'per_product') {
        totalShipping += shippingFee * item.quantity;
      } else {
        // One-time shipping per product type/vendor (simplified to per product ID here)
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

  return totalShipping;
};


// --- Component ---
const Checkout: React.FC = () => {
  // --- Hooks and Context ---
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const { createOrder } = useOrders();
  const navigate = useNavigate();
  const { toast } = useToast();
  // const { settings } = useAdminSettings(); // Not used in provided logic, keeping for context

  // --- State ---
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'NG',
    phone: ''
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [orderTotals, setOrderTotals] = useState<OrderTotals>({
    subtotal: 0,
    shipping: 0,
    vat: 0,
    total: 0
  });
  const [vendorBankDetails, setVendorBankDetails] = useState<any>(null);
  // const [productVendor, setProductVendor] = useState<any>(null); // Not used in provided logic

  // --- Derived Values ---
  const isBankTransferAvailable = !!vendorBankDetails;
  
  const validateShippingInfo = useMemo(() => {
    return (
      shippingInfo.street &&
      shippingInfo.city &&
      shippingInfo.state &&
      shippingInfo.zipCode &&
      shippingInfo.phone
    );
  }, [shippingInfo]);

  // --- Effects and Callbacks ---

  /**
   * Calculates all order totals (subtotal, shipping, VAT, total).
   */
  const calculateTotals = useCallback(() => {
    const subtotal = total;
    const totalShipping = calculateShipping(items, subtotal);
    const vat = subtotal * VAT_RATE; // 2.5% VAT

    setOrderTotals({
      subtotal,
      shipping: totalShipping,
      vat,
      total: subtotal + totalShipping + vat
    });
  }, [items, total]);

  /**
   * Fetches vendor's bank details for bank transfer option.
   */
  const fetchVendorBankDetails = useCallback(async () => {
    if (items.length === 0) return;

    // Assuming single vendor checkout: get the first product's vendor
    const firstProduct = items[0] as any;

    if (firstProduct.vendor_id) {
      try {
        const { data, error } = await supabase
          .from('approved_vendors')
          .select('*, shop_applications!inner(vendor_bank_details)')
          .eq('id', firstProduct.vendor_id)
          .single();

        if (error || !data) {
          console.warn('Vendor fetch error or not found:', error);
          setVendorBankDetails(null);
          // setProductVendor(null);
          return;
        }

        // setProductVendor(data);
        const shopApp = (data as any).shop_applications;
        if (shopApp && shopApp.vendor_bank_details) {
          setVendorBankDetails(shopApp.vendor_bank_details);
        } else {
          setVendorBankDetails(null);
        }
      } catch (err) {
        console.error('fetchVendorBankDetails error:', err);
        setVendorBankDetails(null);
        // setProductVendor(null);
      }
    } else {
      // Product added by admin - use admin bank details (or disable bank transfer if not set)
      setVendorBankDetails(null);
    }
  }, [items]);

  // Initial load and dependency monitoring
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
  }, [user, items, navigate, calculateTotals, fetchVendorBankDetails]);

  // Disable bank_transfer if vendor details are missing
  useEffect(() => {
    if (!isBankTransferAvailable && paymentMethod === 'bank_transfer') {
      setPaymentMethod('paystack');
    }
  }, [isBankTransferAvailable, paymentMethod]);

  // Load Paystack script
  useEffect(() => {
    if (window.PaystackPop) return;

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => console.log('Paystack script loaded');
    script.onerror = () => console.error('Failed to load Paystack script');
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  /**
   * Uploads the payment receipt file to Supabase storage.
   */
  const uploadReceipt = async (file: File): Promise<string> => {
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

  /**
   * Handles the successful creation and update of an order in the database.
   */
  const finalizeOrder = async (
    paymentStatus: 'paid' | 'pending',
    orderStatus: 'processing' | 'pending',
    uploadedReceiptUrl: string = ''
  ) => {
    const orderItems = items.map(item => ({
      product_id: item.id,
      quantity: item.quantity,
      price: item.price
    }));

    const { order, error: createError } = await createOrder({
      total_amount: orderTotals.total,
      shipping_address: shippingInfo,
      payment_method: paymentMethod,
      items: orderItems
    });

    if (createError) throw createError;
    
    if (order) {
      const updateData: any = {
        subtotal: orderTotals.subtotal,
        shipping_cost: orderTotals.shipping,
        tax_amount: orderTotals.vat,
        payment_status: paymentStatus,
        status: orderStatus
      };

      if (uploadedReceiptUrl) {
        updateData.receipt_image = uploadedReceiptUrl;
      }

      const { error: updateError } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', order.id);
        
      if (updateError) throw updateError;
    }

    clearCart();
  };

  /**
   * Initiates the Paystack payment process.
   */
  const handlePaystackPayment = useCallback(() => {
    if (!user) return toast({ title: 'Sign in required', variant: 'destructive' });
    if (!window.PaystackPop) return toast({ title: 'Paystack not loaded. Please refresh the page.', variant: 'destructive' });
    if (orderTotals.total <= 0) return toast({ title: 'Invalid amount', variant: 'destructive' });

    setProcessing(true); // Set processing early for UI feedback

    const handler = window.PaystackPop.setup({
      // Use environment variable for production key
      key: 'pk_test_138ebaa183ec16342d00c7eee0ad68862d438581', 
      email: user.email,
      amount: Math.round(orderTotals.total * 100), // amount in kobo
      currency: 'NGN',
      ref: `ALPHADOM_${Date.now()}`,
      metadata: {
        custom_fields: [{ display_name: 'Phone', variable_name: 'phone', value: shippingInfo.phone }]
      },
      callback: async function() { // response is available but not strictly needed for order finalization
        try {
          // Finalize order with paid status
          await finalizeOrder('paid', 'processing');

          toast({
            title: 'Order Placed Successfully!',
            description: 'Your payment was successful and your order is being processed.'
          });

          navigate('/orders');
        } catch (err) {
          console.error('Error creating order after payment:', err);
          toast({
            title: 'Order Creation Failed',
            description: 'Payment was successful but order creation failed. Please contact support.',
            variant: 'destructive'
          });
        } finally {
          setProcessing(false);
        }
      },
      onClose: function() {
        setProcessing(false); // Reset processing if payment is closed
        toast({ title: 'Payment cancelled' });
      }
    });

    handler.openIframe();
  }, [user, orderTotals, shippingInfo, navigate, toast, clearCart, createOrder, items, paymentMethod]);


  /**
   * Main handler for placing the order.
   */
  const handlePlaceOrder = async () => {
    if (!user) return;

    if (!validateShippingInfo) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all shipping details including phone number.',
        variant: 'destructive'
      });
      return;
    }

    // 1. Paystack Flow
    if (paymentMethod === 'paystack') {
      handlePaystackPayment();
      return;
    }

    // 2. Bank Transfer Flow
    if (paymentMethod === 'bank_transfer') {
      if (!isBankTransferAvailable) {
        toast({
          title: 'Payment Method Unavailable',
          description: 'Bank transfer is not available for this vendor. Choose Paystack instead.',
          variant: 'destructive'
        });
        setPaymentMethod('paystack');
        return;
      }

      if (!receiptFile) {
        toast({
          title: 'Missing Receipt',
          description: 'Please upload your payment receipt.',
          variant: 'destructive'
        });
        return;
      }
    }

    // Proceed with order creation (Bank Transfer)
    setProcessing(true);

    try {
      let uploadedReceiptUrl = '';
      
      // Upload receipt if bank transfer
      if (paymentMethod === 'bank_transfer' && receiptFile) {
        uploadedReceiptUrl = await uploadReceipt(receiptFile);
      }

      // Finalize order with pending status
      await finalizeOrder('pending', 'pending', uploadedReceiptUrl);

      toast({
        title: 'Order Placed Successfully!',
        description: 'Your order has been received and is awaiting payment confirmation.'
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

  // --- Render Logic ---
  if (!user) return null; // Redirect handled in useEffect
  if (!items || items.length === 0) return null; // Redirect handled in useEffect

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your purchase</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 1. Order Summary */}
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
                    <span>VAT ({VAT_RATE * 100}%)</span>
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

          {/* 2. Checkout Form (Shipping & Payment) */}
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
                {/* ... Shipping Input Fields ... */}
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
                <Select
                  value={paymentMethod}
                  onValueChange={(value: PaymentMethod) => setPaymentMethod(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paystack">Pay with Paystack (Card/Bank/USSD)</SelectItem>
                    {isBankTransferAvailable && (
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    )}
                  </SelectContent>
                </Select>

                {paymentMethod === 'bank_transfer' && isBankTransferAvailable && (
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <h4 className="font-medium">Bank Transfer Details</h4>
                    <p className="text-sm">Bank: **{vendorBankDetails.bank_name}**</p>
                    <p className="text-sm">Account Name: **{vendorBankDetails.account_name}**</p>
                    <p className="text-sm">Account Number: **{vendorBankDetails.account_number}**</p>
                    <p className="text-sm font-medium text-primary mt-3">
                      Amount to Transfer: ₦{orderTotals.total.toLocaleString()}
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
                      You'll be redirected to Paystack to complete your payment securely via Card, Bank, or USSD.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Button
              onClick={handlePlaceOrder}
              disabled={processing || orderTotals.total <= 0}
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