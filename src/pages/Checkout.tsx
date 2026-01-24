import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useMultiVendorCheckout } from "@/hooks/useMultiVendorCheckout";
import { useBanStatus } from "@/hooks/useBanStatus";
import { useAddresses } from "@/hooks/useAddresses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { OrderSuccessModal } from "@/components/OrderSuccessModal";
import { CheckoutSkeleton } from "@/components/skeletons/PageSkeletons";
import { loadPaystackScript } from "@/utils/loadPaystack";
import {
  Lock,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Truck,
  ShieldCheck,
  RotateCcw,
  ChevronRight,
  CreditCard,
  MapPin,
  Package,
  Home,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ShippingInfo, VAT_RATE, VendorGroup } from "@/types/checkout";

const Checkout: React.FC = () => {
  const { user } = useAuth();
  const { items } = useCart();
  const { isBanned } = useBanStatus();
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
    failedGroups,
    recalculateWithDeliveryMethod,
  } = useMultiVendorCheckout();

  const { addresses, getDefaultAddress, loading: addressesLoading } = useAddresses();
  const [useDefaultAddress, setUseDefaultAddress] = useState(true);

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "NG",
    phone: "",
    deliveryMethod: "on_campus",
    firstName: "",
    lastName: "",
  });

  const [paystackLoaded, setPaystackLoaded] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [openAccordion, setOpenAccordion] = useState("shipping");

  // Load default address on mount
  useEffect(() => {
    const defaultAddr = getDefaultAddress();
    if (defaultAddr && useDefaultAddress) {
      setShippingInfo(prev => ({
        ...prev,
        firstName: defaultAddr.first_name,
        lastName: defaultAddr.last_name,
        street: defaultAddr.street,
        city: defaultAddr.city,
        state: defaultAddr.state || '',
        zipCode: defaultAddr.postal_code || '',
        phone: defaultAddr.phone,
        country: defaultAddr.country,
      }));
    }
  }, [addresses, useDefaultAddress]);

  const handleUseDefaultAddress = (addr: any) => {
    setShippingInfo(prev => ({
      ...prev,
      firstName: addr.first_name,
      lastName: addr.last_name,
      street: addr.street,
      city: addr.city,
      state: addr.state || '',
      zipCode: addr.postal_code || '',
      phone: addr.phone,
      country: addr.country,
    }));
  };

  const isShippingValid = useMemo(() => {
    return (
      shippingInfo.firstName?.trim() &&
      shippingInfo.lastName?.trim() &&
      shippingInfo.street.trim() &&
      shippingInfo.city.trim() &&
      shippingInfo.zipCode.trim() &&
      shippingInfo.phone.trim()
    );
  }, [shippingInfo]);

  useEffect(() => {
    if (recalculateWithDeliveryMethod && shippingInfo.deliveryMethod) {
      recalculateWithDeliveryMethod(shippingInfo.deliveryMethod);
    }
  }, [shippingInfo.deliveryMethod, recalculateWithDeliveryMethod]);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (isBanned) {
      toast({
        title: "Account Restricted",
        description: "Your account has been suspended.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }
    if (!items || items.length === 0) {
      navigate("/cart");
    }
  }, [user, items, navigate, isBanned]);

  useEffect(() => {
    loadPaystackScript()
      .then(() => setPaystackLoaded(true))
      .catch(() => {
        toast({
          title: "Payment Error",
          description: "Failed to load payment system. Please refresh.",
          variant: "destructive",
        });
      });
  }, [toast]);

  useEffect(() => {
    if (allPaymentsComplete && !processing) {
      setShowSuccessModal(true);
    }
  }, [allPaymentsComplete, processing]);

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    toast({
      title: "All Orders Placed Successfully!",
      description: `${vendorGroups.length} order(s) have been created.`,
    });
    navigate("/orders");
  };

  const handlePayNow = async () => {
    if (!isShippingValid) {
      toast({
        title: "Missing Information",
        description: "Please fill in all shipping details.",
        variant: "destructive",
      });
      return;
    }

    if (!paystackLoaded) {
      toast({
        title: "Payment Not Ready",
        description: "Please wait for payment system to load.",
        variant: "destructive",
      });
      return;
    }

    const result = await processAllPayments(shippingInfo);

    if (!result.success && failedGroups.length > 0) {
      toast({
        title: "Some Payments Failed",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  const handleRetry = async (vendorId: string | null) => {
    const success = await retryPayment(vendorId, shippingInfo);
    if (success) {
      toast({ title: "Payment Successful!" });
    } else {
      toast({
        title: "Payment Failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeliverToAddress = () => {
    if (isShippingValid) {
      setOpenAccordion("payment");
    } else {
      toast({
        title: "Incomplete Address",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (group: VendorGroup, index: number) => {
    switch (group.payment_status) {
      case "paid":
        return <Badge className="bg-primary"><CheckCircle2 className="h-3 w-3 mr-1" />Paid</Badge>;
      case "processing":
        return <Badge className="bg-blue-500"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Processing</Badge>;
      case "failed":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        if (processing && index === currentPaymentIndex) {
          return <Badge className="bg-amber-500"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Paying...</Badge>;
        }
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  if (!user || loading) return <CheckoutSkeleton />;
  if (vendorGroups.length === 0) return null;

  const progress = processing ? ((currentPaymentIndex + 1) / vendorGroups.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/cart" className="hover:text-foreground transition-colors">Cart</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">Checkout</span>
        </nav>

        <div className="flex items-center gap-2 mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Secure Checkout</h1>
          <ShieldCheck className="w-6 h-6 text-primary" />
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
          {/* Left Column: Checkout Steps */}
          <div className="lg:col-span-2">
            <Accordion
              type="single"
              value={openAccordion}
              onValueChange={setOpenAccordion}
              className="space-y-4"
            >
              {/* Step 1: Shipping Address */}
              <AccordionItem value="shipping" className="border rounded-xl overflow-hidden">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                      1
                    </div>
                    <span className="font-semibold">Shipping Address</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  {/* Saved Addresses */}
                  {addresses.length > 0 && (
                    <div className="mb-6">
                      <Label className="text-base font-semibold">Saved Addresses</Label>
                      <p className="text-sm text-muted-foreground mb-3">
                        Select from your saved addresses or enter a new one
                      </p>
                      <div className="grid gap-2">
                        {addresses.map((addr) => (
                          <button
                            key={addr.id}
                            type="button"
                            onClick={() => handleUseDefaultAddress(addr)}
                            disabled={processing}
                            className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                              shippingInfo.street === addr.street && shippingInfo.phone === addr.phone
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Home className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm flex items-center gap-2">
                                {addr.label}
                                {addr.is_default && (
                                  <Badge variant="secondary" className="text-xs">Default</Badge>
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {addr.first_name} {addr.last_name} • {addr.street}, {addr.city}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                      <Separator className="my-4" />
                      <p className="text-sm text-muted-foreground mb-3">
                        Or edit/enter address details below:
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={shippingInfo.firstName || ""}
                        onChange={(e) => setShippingInfo(prev => ({ ...prev, firstName: e.target.value }))}
                        placeholder="Jane"
                        disabled={processing}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={shippingInfo.lastName || ""}
                        onChange={(e) => setShippingInfo(prev => ({ ...prev, lastName: e.target.value }))}
                        placeholder="Doe"
                        disabled={processing}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      value={shippingInfo.street}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, street: e.target.value }))}
                      placeholder="123 Evergreen Terrace"
                      disabled={processing}
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={shippingInfo.city}
                        onChange={(e) => setShippingInfo(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="Springfield"
                        disabled={processing}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">Postal Code</Label>
                      <Input
                        id="zipCode"
                        value={shippingInfo.zipCode}
                        onChange={(e) => setShippingInfo(prev => ({ ...prev, zipCode: e.target.value }))}
                        placeholder="62704"
                        disabled={processing}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={shippingInfo.phone}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+234 800 000 0000"
                      disabled={processing}
                      className="mt-1"
                    />
                  </div>

                  {/* Delivery Zone Selection */}
                  <div className="mt-6">
                    <Label className="text-base font-semibold">Delivery Zone</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Select your delivery zone based on your distance from the vendor(s)
                    </p>
                    <div className="grid gap-3">
                      {[
                        { value: 'on_campus', label: 'On-Campus Pickup', description: 'Free - Pick up at vendor location', price: 'FREE' },
                        { value: '2km_5km', label: 'Zone 1 - Local (Same City/State)', description: 'Buyer is in the same city or state as vendor', price: 'Varies' },
                        { value: 'over_5km', label: 'Zone 2 - Regional (Neighboring States)', description: 'Buyer is in a neighboring state', price: 'Varies' },
                      ].map((zone) => (
                        <button
                          key={zone.value}
                          type="button"
                          onClick={() => setShippingInfo(prev => ({ 
                            ...prev, 
                            deliveryMethod: zone.value as 'on_campus' | '2km_5km' | 'over_5km' 
                          }))}
                          disabled={processing}
                          className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                            shippingInfo.deliveryMethod === zone.value
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="text-left">
                            <p className="font-medium">{zone.label}</p>
                            <p className="text-sm text-muted-foreground">{zone.description}</p>
                          </div>
                          <Badge variant={zone.value === 'on_campus' ? 'default' : 'secondary'}>
                            {zone.price}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={handleDeliverToAddress}
                    className="w-full mt-6 bg-primary hover:bg-primary/90"
                    disabled={!isShippingValid || processing}
                  >
                    Continue to Payment
                  </Button>
                </AccordionContent>
              </AccordionItem>

              {/* Step 2: Payment Method */}
              <AccordionItem value="payment" className="border rounded-xl overflow-hidden">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      openAccordion === "payment" || openAccordion === "review"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      2
                    </div>
                    <span className="font-semibold">Payment Method</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="p-4 bg-muted rounded-lg mb-4">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">Pay with Paystack</p>
                        <p className="text-sm text-muted-foreground">
                          Secure payment via Card, Bank Transfer, or USSD
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => setOpenAccordion("review")}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    Continue to Review
                  </Button>
                </AccordionContent>
              </AccordionItem>

              {/* Step 3: Review Order */}
              <AccordionItem value="review" className="border rounded-xl overflow-hidden">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      openAccordion === "review"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      3
                    </div>
                    <span className="font-semibold">Review Order</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="space-y-4">
                    {vendorGroups.filter(g => g.payment_status !== "paid").map((group, index) => (
                      <Card key={group.vendor_id || "platform"} className={
                        group.payment_status === "failed" ? "border-destructive/50 bg-destructive/5" : ""
                      }>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium text-sm">{group.vendor_name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(group, index)}
                              {group.payment_status === "failed" && (
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
                          <div className="space-y-2">
                            {group.items.map((item) => {
                              const displayImage = (() => {
                                if (!item.image) return "/placeholder.svg";
                                try {
                                  const parsed = JSON.parse(item.image);
                                  return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : item.image;
                                } catch { return item.image; }
                              })();
                              return (
                                <div key={item.id} className="flex justify-between items-center text-sm">
                                  <div className="flex items-center gap-2">
                                    <img src={displayImage} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                                    <span className="truncate max-w-[150px]">{item.name}</span>
                                    <span className="text-muted-foreground">x{item.quantity}</span>
                                  </div>
                                  <span className="font-medium">₦{(item.price * item.quantity).toLocaleString()}</span>
                                </div>
                              );
                            })}
                          </div>
                          <div className="flex justify-between pt-3 mt-3 border-t text-sm font-semibold">
                            <span>Vendor Total</span>
                            <span>₦{group.total.toLocaleString()}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Right Column: Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₦{grandTotals.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium text-primary">
                    {grandTotals.shipping === 0 ? "FREE" : `₦${grandTotals.shipping.toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estimated Tax</span>
                  <span className="font-medium">₦{grandTotals.vat.toLocaleString()}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₦{grandTotals.total.toLocaleString()}</span>
                </div>

                <Button
                  onClick={handlePayNow}
                  disabled={processing || grandTotals.total <= 0 || !paystackLoaded || !isShippingValid || openAccordion !== "review"}
                  className="w-full mt-4 bg-primary hover:bg-primary/90"
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
                      Place Order
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-3">
                  By placing your order, you agree to Alphadom's{" "}
                  <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link> and{" "}
                  <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                </p>
              </CardContent>
            </Card>

            {/* Security Badges */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Secure SSL Encryption</p>
                  <p className="text-xs text-muted-foreground">
                    Your data is protected by industry-leading 256-bit encryption.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Truck className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Fast & Free Delivery</p>
                  <p className="text-xs text-muted-foreground">
                    Estimated delivery between 3-7 business days.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <RotateCcw className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">30-Day Free Returns</p>
                  <p className="text-xs text-muted-foreground">
                    Not happy with your purchase? Return it for free within 30 days.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <OrderSuccessModal open={showSuccessModal} onClose={handleSuccessModalClose} />
    </div>
  );
};

export default Checkout;
