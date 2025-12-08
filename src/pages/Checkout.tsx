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
 * @returns The total shipping cost.
 */
const calculateShipping = (items: any[]): number => {
  let totalShipping = 0;
  // Use a map to track which product IDs have already had their one-time fee applied
  const shippingGroups = new Map<string, number>(); 

  for (const item of items) {
    // Ensure item structure aligns with calculation
    const shippingFee = Number(item.shipping_fee) || 0;
    const shippingType = item.shipping_type || 'one_time';

    // Only apply shipping fee if fee > 0
    if (shippingFee > 0) {
      if (shippingType === 'per_product') {
        // Per product: multiply by quantity
        totalShipping += shippingFee * item.quantity;
      } else {
        // One-time shipping per product type (using product ID as the key)
        if (!shippingGroups.has(item.id)) {
          shippingGroups.set(item.id, shippingFee);
          totalShipping += shippingFee;
        }
      }
    }
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
    const totalShipping = calculateShipping(items);
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
   * FIX: Replaced .single() with .limit(1) and array indexing to prevent HTTP 406 error
   * if no vendor is found or if the query structure is slightly off.
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
          .limit(1); // Use limit(1) to handle the possibility of 0 rows gracefully

        if (error || !data || data.length === 0) {
          console.warn('Vendor fetch error or not found:', error);
          setVendorBankDetails(null);
          return;
        }

        const vendorData = data[0]; // Get the first (and only) item
        const shopApp = (vendorData as any).shop_applications;
        if (shopApp && shopApp.vendor_bank_details) {
          setVendorBankDetails(shopApp.vendor_bank_details);
        } else {
          setVendorBankDetails(null);
        }
      } catch (err) {
        console.error('fetchVendorBankDetails error:', err);
        setVendorBankDetails(null);
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

    // Supabase public URL logic may need adjustment based on your setup.
    // If the path is correct, the publicUrl should be valid.
    if (!data || !data.publicUrl) {
      throw new Error('Failed to get public URL for the uploaded receipt.');
    }
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

      // NOTE: You must ensure 'id' is a valid field on your 'orders' table
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
   * FIX: The callback is now defined correctly as a standard function accepting the response.
   */
  const handlePaystackPayment = useCallback(() => {
    if (!user) {
      toast({ title: 'Sign in required', variant: 'destructive' });
      return;
    }
    
    if (!window.PaystackPop) {
      toast({ title: 'Paystack not loaded. Please refresh the page.', variant: 'destructive' });
      return;
    }
    
    if (orderTotals.total <= 0) {
      toast({ title: 'Invalid amount', variant: 'destructive' });
      return;
    }
    
    setProcessing(true); // Set processing here, and reset in final or onClose

    try {
      // NOTE: You should use your LIVE Paystack key here. Using a test key for development.
      const PAYSTACK_PUBLIC_KEY = 'pk_test_138ebaa183ec16342d00c7eee0ad68862d438581';

      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: user.email,
        amount: Math.round(orderTotals.total * 100), // amount in kobo
        currency: 'NGN',
        ref: `ALPHADOM_${Date.now()}`,
        metadata: {
          custom_fields: [{ display_name: 'Phone', variable_name: 'phone', value: shippingInfo.phone }]
        },
        
        // --- FIXED PAYSTACK CALLBACK ---
        callback: async function(response: any) { 
          // Note: Response object contains payment verification details (response.reference)
          // For a production app, verification should happen on the server using response.reference.
          
          setProcessing(true); // Keep processing true until final result is known
          try {
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
          setProcessing(false);
          toast({ title: 'Payment cancelled', description: 'You closed the payment window.' });
        }
      });

      handler.openIframe();
    } catch (err) {
      console.error('Paystack setup error:', err);
      toast({ title: 'Payment initialization failed', variant: 'destructive' });
      setProcessing(false);
    }
  }, [user, orderTotals, shippingInfo, navigate, toast, finalizeOrder]);


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
      // Paystack handler sets/resets processing itself
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
                  const shippingFee = Number(item.shipping_fee) || 0;
                  const shippingType = item.shipping_type || 'one_time';
                  const hasShipping = shippingFee > 0;
                  // The line below should be handled carefully if you use a combination of one_time and per_product.
                  // Since `calculateShipping` handles the aggregation, this cost display is mainly for per-item context.
                  const itemShippingCost = shippingType === 'per_product' 
                    ? shippingFee * item.quantity 
                    : shippingFee;

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
                          Shipping: ₦{itemShippingCost.toLocaleString()} ({shippingType === 'per_product' ? `₦${shippingFee.toLocaleString()} × ${item.quantity}` : 'one-time'})
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