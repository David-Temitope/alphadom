import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useShopApplications } from '@/hooks/useShopApplications';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, CheckCircle, XCircle, DollarSign, Mail, Timer, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Window {
    PaystackPop?: any;
  }
}

const ShopApplicationStatus = () => {
  const { userApplication, refreshUserApplication } = useShopApplications();
  const { user } = useAuth();
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    refreshUserApplication();
  }, []);

  // Load Paystack script
  useEffect(() => {
    if (window.PaystackPop) return;

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (userApplication?.payment_countdown_expires_at) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const expiryTime = new Date(userApplication.payment_countdown_expires_at!).getTime();
        const distance = expiryTime - now;

        if (distance > 0) {
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);

          setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        } else {
          setTimeLeft('Expired');
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [userApplication?.payment_countdown_expires_at]);

  // Extract payment amount from admin notes
  const extractPaymentAmount = (notes: string | undefined): number | null => {
    if (!notes) return null;
    // Look for patterns like "₦50000", "50000", "NGN 50000", etc.
    const match = notes.match(/(?:₦|NGN\s*)?(\d{1,3}(?:,?\d{3})*(?:\.\d{2})?)/i);
    if (match) {
      return parseFloat(match[1].replace(/,/g, ''));
    }
    return null;
  };

  const paymentAmount = extractPaymentAmount(userApplication?.admin_notes);

  const handlePaystackPayment = () => {
    if (!user || !userApplication) return;
    if (!window.PaystackPop) {
      toast({ title: 'Payment system not loaded. Please refresh.', variant: 'destructive' });
      return;
    }
    if (!paymentAmount || paymentAmount <= 0) {
      toast({ title: 'Invalid payment amount', variant: 'destructive' });
      return;
    }

    setProcessing(true);

    const handler = window.PaystackPop.setup({
      key: 'pk_test_138ebaa183ec16342d00c7eee0ad68862d438581',
      email: user.email,
      amount: Math.round(paymentAmount * 100),
      currency: 'NGN',
      ref: `SHOP_${userApplication.id}_${Date.now()}`,
      metadata: {
        custom_fields: [
          { display_name: 'Application', variable_name: 'application_id', value: userApplication.id },
          { display_name: 'Store', variable_name: 'store_name', value: userApplication.store_name }
        ]
      },
      callback: async function(response: any) {
        console.log('Shop payment successful', response);
        toast({
          title: 'Payment Successful!',
          description: 'Your payment has been received. Please wait for admin to activate your shop.',
        });
        // Refresh application to see updated status
        refreshUserApplication();
        setProcessing(false);
      },
      onClose: function() {
        toast({ title: 'Payment cancelled' });
        setProcessing(false);
      }
    });

    handler.openIframe();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Please sign in to view your application status.</p>
            <Button asChild className="mt-4">
              <Link to="/auth">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!userApplication) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No shop application found.</p>
            <Button asChild className="mt-4">
              <Link to="/">Apply for a Shop</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      case 'payment': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'payment': return <DollarSign className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Your shop application is under review. We will notify you once a decision has been made.';
      case 'approved':
        return 'Congratulations! Your shop application has been approved. Please complete the payment below to activate your shop.';
      case 'rejected':
        return 'Unfortunately, your shop application has been rejected. Please see the admin notes below for more details.';
      case 'payment':
        return 'Payment confirmed! Your shop is being set up. You will receive access to your vendor dashboard shortly.';
      default:
        return 'Application status unknown.';
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Shop Application Status</h1>
          <p className="text-muted-foreground">Track the progress of your shop rental application</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {userApplication.store_name}
                  {getStatusIcon(userApplication.status)}
                </CardTitle>
                <CardDescription>
                  Application submitted on {new Date(userApplication.created_at).toLocaleDateString()}
                </CardDescription>
              </div>
              <Badge variant={getStatusBadgeVariant(userApplication.status)}>
                {userApplication.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm">{getStatusMessage(userApplication.status)}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">Application Details</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Store Name:</span>
                    <span className="ml-2">{userApplication.store_name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Category:</span>
                    <span className="ml-2">{userApplication.product_category}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Price Range:</span>
                    <span className="ml-2">₦{userApplication.price_range_min.toLocaleString()} - ₦{userApplication.price_range_max.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Timeline</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Application Submitted</span>
                  </div>
                  <div className={`flex items-center gap-2 ${userApplication.status !== 'pending' ? 'text-green-500' : 'text-muted-foreground'}`}>
                    {userApplication.status !== 'pending' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Clock className="h-4 w-4" />
                    )}
                    <span>Application Reviewed</span>
                  </div>
                  {userApplication.status === 'approved' && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Awaiting Payment</span>
                    </div>
                  )}
                  {userApplication.status === 'payment' && (
                    <div className="flex items-center gap-2 text-green-500">
                      <CheckCircle className="h-4 w-4" />
                      <span>Payment Received</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {userApplication.admin_notes && (
              <div>
                <h3 className="font-medium mb-2">Admin Notes</h3>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">{userApplication.admin_notes}</p>
                </div>
              </div>
            )}

            {userApplication.status === 'approved' && userApplication.payment_countdown_expires_at && (
              <div className="p-4 border border-primary rounded-lg space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">Payment Required</h3>
                </div>
                
                {paymentAmount && paymentAmount > 0 && (
                  <div className="text-center py-3 bg-primary/10 rounded-lg">
                    <p className="text-sm text-muted-foreground">Amount to Pay</p>
                    <p className="text-2xl font-bold text-primary">₦{paymentAmount.toLocaleString()}</p>
                  </div>
                )}

                {timeLeft && timeLeft !== 'Expired' && (
                  <div className="flex items-center justify-center gap-2">
                    <Timer className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Time remaining: {timeLeft}</span>
                  </div>
                )}
                
                {timeLeft === 'Expired' && (
                  <div className="flex items-center justify-center gap-2 text-destructive">
                    <XCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Payment window has expired</span>
                  </div>
                )}

                {paymentAmount && paymentAmount > 0 && timeLeft !== 'Expired' && (
                  <Button 
                    onClick={handlePaystackPayment} 
                    disabled={processing}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    {processing ? 'Processing...' : `Pay Now - ₦${paymentAmount.toLocaleString()}`}
                  </Button>
                )}

                {!paymentAmount && (
                  <p className="text-sm text-muted-foreground text-center">
                    Please check admin notes for payment amount or contact support.
                  </p>
                )}
              </div>
            )}

            {userApplication.status === 'payment' && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="font-medium text-green-800">Shop Setup Complete</h3>
                </div>
                <p className="text-sm text-green-700">
                  Your shop is being prepared. You will receive access to your vendor dashboard shortly.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ShopApplicationStatus;