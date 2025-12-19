import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useMultiVendorCheckout } from '@/hooks/useMultiVendorCheckout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ShoppingCart, 
  CreditCard, 
  Truck, 
  Lock, 
  Store, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ShippingInfo, VAT_RATE, VendorGroup } from '@/types/checkout';

declare global {
  interface Window {
    PaystackPop?: any;
  }
}

const Checkout: React.FC = () => {
  const { user } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    vendorGroups,
    grandTotals,
    loading,
    processing,
    currentPaymentIndex,
    processAllPayments,
    retryPayment,
    allPaymentsComplete,
    failedGroups
  } = useMultiVendorCheckout();

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'NG',
    phone: ''
  });

  const [paystackLoaded, setPaystackLoaded] = useState(false);

  // Validate shipping info
  const isShippingValid = useMemo(() => {
    return (
      shippingInfo.street.trim() &&
      shippingInfo.city.trim() &&
      shippingInfo.state.trim() &&
      shippingInfo.zipCode.trim() &&
      shippingInfo.phone.trim()
    );
  }, [shippingInfo]);

  // Redirect if not authenticated or no items
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!items || items.length === 0) {
      navigate('/cart');
    }
  }, [user, items, navigate]);

  // Load Paystack script
  useEffect(() => {
    if (window.PaystackPop) {
      setPaystackLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => setPaystackLoaded(true);
    script.onerror = () => {
      console.error('Failed to load Paystack script');
      toast({
        title: 'Payment Error',
        description: 'Failed to load payment system. Please refresh.',
        variant: 'destructive'
      });
    };
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        document.body.removeChild(script);
      }
    };
  }, [toast]);

  // Navigate to orders when all payments complete
  useEffect(() => {
    if (allPaymentsComplete && !processing) {
      toast({
        title: 'All Orders Placed Successfully!',
        description: `${vendorGroups.length} order(s) have been created.`
      });
      navigate('/orders');
    }
  }, [allPaymentsComplete, processing, vendorGroups.length, navigate, toast]);

  // Handle payment initiation
  const handlePayNow = async () => {
    if (!isShippingValid) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all shipping details.',
        variant: 'destructive'
      });
      return;
    }

    if (!paystackLoaded) {
      toast({
        title: 'Payment Not Ready',
        description: 'Please wait for payment system to load.',
        variant: 'destructive'
      });
      return;
    }

    const result = await processAllPayments(shippingInfo);
    
    if (!result.success && failedGroups.length > 0) {
      toast({
        title: 'Some Payments Failed',
        description: result.message,
        variant: 'destructive'
      });
    }
  };

  // Handle retry for failed payment
  const handleRetry = async (vendorId: string | null) => {
    const success = await retryPayment(vendorId, shippingInfo);
    if (success) {
      toast({ title: 'Payment Successful!' });
    } else {
      toast({
        title: 'Payment Failed',
        description: 'Please try again.',
        variant: 'destructive'
      });
    }
  };

  // Get status badge for vendor group
  const getStatusBadge = (group: VendorGroup, index: number) => {
    switch (group.payment_status) {
      case 'paid':
        return (
          <Badge className="bg-green-500">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Paid
          </Badge>
        );
      case 'processing':
        return (
          <Badge className="bg-blue-500">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Processing
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        if (processing && index === currentPaymentIndex) {
          return (
            <Badge className="bg-yellow-500">
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Paying...
            </Badge>
          );
        }
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (vendorGroups.length === 0) {
    return null;
  }

  const progress = processing 
    ? ((currentPaymentIndex + 1) / vendorGroups.length) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">
            {vendorGroups.length > 1 
              ? `Your cart contains items from ${vendorGroups.length} vendors. Each vendor will be processed separately.`
              : 'Complete your purchase'
            }
          </p>
        </div>

        {/* Progress bar during multi-payment */}
        {processing && vendorGroups.length > 1 && (
          <Card className="mb-6">
            <CardContent className="py-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Processing Payments</span>
                <span className="text-sm text-muted-foreground">
                  {currentPaymentIndex + 1} of {vendorGroups.length}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Vendor Groups (hide paid vendors) */}
          <div className="lg:col-span-2 space-y-6">
            {vendorGroups.filter(g => g.payment_status !== 'paid').map((group, index) => (
              <Card key={group.vendor_id || 'platform'} className={
                group.payment_status === 'paid' ? 'border-green-200 bg-green-50/50' :
                group.payment_status === 'failed' ? 'border-red-200 bg-red-50/50' :
                ''
              }>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Store className="h-5 w-5" />
                      {group.vendor_name}
                      {group.vendor_id && (
                        <Badge variant="outline" className="text-xs">
                          {group.subscription_plan}
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(group, index)}
                      {group.payment_status === 'failed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRetry(group.vendor_id)}
                          disabled={processing}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Retry
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Items */}
                  {group.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-medium">₦{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}

                  <Separator />

                  {/* Group Totals */}
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>₦{group.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>{group.shipping === 0 ? 'FREE' : `₦${group.shipping.toLocaleString()}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">VAT ({VAT_RATE * 100}%)</span>
                      <span>₦{group.vat.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold pt-2 border-t">
                      <span>Vendor Total</span>
                      <span>₦{group.total.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Right Column: Shipping & Payment */}
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
                    onChange={(e) => setShippingInfo(prev => ({ ...prev, street: e.target.value }))}
                    placeholder="123 Main St"
                    disabled={processing}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={shippingInfo.city}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="Lagos"
                      disabled={processing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={shippingInfo.state}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, state: e.target.value }))}
                      placeholder="Lagos"
                      disabled={processing}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={shippingInfo.zipCode}
                    onChange={(e) => setShippingInfo(prev => ({ ...prev, zipCode: e.target.value }))}
                    placeholder="100001"
                    disabled={processing}
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={shippingInfo.phone}
                    onChange={(e) => setShippingInfo(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+234 800 000 0000"
                    disabled={processing}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Vendors</span>
                  <span>{vendorGroups.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Items</span>
                  <span>{vendorGroups.reduce((sum, g) => sum + g.items.length, 0)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₦{grandTotals.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Shipping</span>
                  <span>{grandTotals.shipping === 0 ? 'FREE' : `₦${grandTotals.shipping.toLocaleString()}`}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total VAT</span>
                  <span>₦{grandTotals.vat.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Grand Total</span>
                  <span>₦{grandTotals.total.toLocaleString()}</span>
                </div>

                {vendorGroups.length > 1 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    You will be charged {vendorGroups.length} separate transactions, one for each vendor.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Payment Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg mb-4">
                  <p className="text-sm text-muted-foreground">
                    Pay securely with Paystack (Card, Bank, or USSD).
                    {vendorGroups.length > 1 && (
                      <span className="block mt-1 text-xs">
                        Each vendor payment will open separately.
                      </span>
                    )}
                  </p>
                </div>

                <Button
                  onClick={handlePayNow}
                  disabled={processing || grandTotals.total <= 0 || !paystackLoaded}
                  className="w-full"
                  size="lg"
                >
                  {processing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing {currentPaymentIndex + 1} of {vendorGroups.length}...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Pay ₦{grandTotals.total.toLocaleString()}
                    </>
                  )}
                </Button>

                {failedGroups.length > 0 && !processing && (
                  <p className="text-xs text-destructive mt-2 text-center">
                    {failedGroups.length} payment(s) failed. Use the Retry button above.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
