import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useShopApplications } from '@/hooks/useShopApplications';
import { useVendors } from '@/hooks/useVendors';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, CheckCircle, XCircle, Timer, CreditCard, Crown, Star, Zap, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

declare global {
  interface Window {
    PaystackPop?: any;
  }
}

const PAYSTACK_PUBLIC_KEY = 'pk_test_138ebaa183ec16342d00c7eee0ad68862d438581';

const subscriptionPlans = [
  {
    id: 'free',
    name: 'Free Plan',
    price: 0,
    features: ['Up to 20 products', '15% commission', 'Low visibility', 'No ads'],
    icon: Zap,
    color: 'border-gray-300 bg-gray-50',
    productLimit: 20,
    commission: 15
  },
  {
    id: 'economy',
    name: 'Economy Plan',
    price: 7000,
    features: ['Up to 50 products', '9% commission', 'Standard visibility', 'No ads'],
    icon: Star,
    color: 'border-blue-300 bg-blue-50',
    productLimit: 50,
    commission: 9
  },
  {
    id: 'first_class',
    name: 'First Class Plan',
    price: 15000,
    features: ['Unlimited products', '5% commission', 'Homepage visibility', '1 free ad/month'],
    icon: Crown,
    color: 'border-yellow-300 bg-yellow-50',
    productLimit: -1,
    commission: 5
  }
];

const ShopApplicationStatus = () => {
  const { userApplication, refreshUserApplication } = useShopApplications();
  const { currentVendor, refreshVendors } = useVendors();
  const { user } = useAuth();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    refreshUserApplication();
    refreshVendors();
  }, []);

  // Load Paystack script
  useEffect(() => {
    if (window.PaystackPop) return;
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    document.body.appendChild(script);
  }, []);

  // Calculate subscription days left
  useEffect(() => {
    if (currentVendor?.subscription_end_date) {
      const endDate = new Date(currentVendor.subscription_end_date).getTime();
      const now = new Date().getTime();
      const diff = endDate - now;
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      setDaysLeft(days > 0 ? days : 0);
    }
  }, [currentVendor]);

  const handleSelectPlan = async (plan: typeof subscriptionPlans[0]) => {
    if (!user || !userApplication) return;
    
    // Check if user is trying to downgrade from paid to free while subscription is active
    if (currentVendor && plan.id === 'free' && 
        (currentVendor.subscription_plan === 'economy' || currentVendor.subscription_plan === 'first_class') &&
        daysLeft && daysLeft > 0) {
      toast({
        title: "Cannot Downgrade",
        description: "You cannot switch to Free plan while your current subscription is active. Please wait until it expires.",
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);

    try {
      if (plan.price > 0) {
        // Process Paystack payment for paid plans
        const paymentSuccess = await handlePaystackPayment(plan);
        if (!paymentSuccess) {
          setProcessing(false);
          return;
        }
      }

      // Activate the plan
      await activatePlan(plan);
      
      toast({
        title: "Plan Activated",
        description: `Your ${plan.name} has been activated successfully!`
      });
      
      refreshUserApplication();
      refreshVendors();
    } catch (error) {
      console.error('Error selecting plan:', error);
      toast({
        title: "Error",
        description: "Failed to activate plan. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const handlePaystackPayment = (plan: typeof subscriptionPlans[0]): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!window.PaystackPop) {
        toast({ title: "Payment system not loaded", variant: "destructive" });
        resolve(false);
        return;
      }

      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: user?.email,
        amount: plan.price * 100,
        currency: 'NGN',
        ref: `SUB_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        callback: function (response: any) {
          if (response?.status === 'success') {
            // Record transaction
            supabase.from('platform_transactions').insert({
              user_id: user?.id,
              amount: plan.price,
              transaction_type: 'subscription',
              payment_method: 'paystack',
              reference: response.reference,
              description: `${plan.name} subscription payment`,
              status: 'completed'
            });
            resolve(true);
          } else {
            resolve(false);
          }
        },
        onClose: function () {
          toast({ title: "Payment cancelled" });
          resolve(false);
        }
      });

      handler.openIframe();
    });
  };

  const activatePlan = async (plan: typeof subscriptionPlans[0]) => {
    const now = new Date();
    const endDate = new Date(now.getTime() + 31 * 24 * 60 * 60 * 1000); // 31 days from now

    if (currentVendor) {
      // Update existing vendor
      await supabase
        .from('approved_vendors')
        .update({
          subscription_plan: plan.id,
          subscription_start_date: now.toISOString(),
          subscription_end_date: endDate.toISOString(),
          is_suspended: false,
          is_active: true,
          product_limit: plan.productLimit === -1 ? 9999 : plan.productLimit,
          commission_rate: plan.commission,
          has_home_visibility: plan.id === 'first_class',
          free_ads_remaining: plan.id === 'first_class' ? 1 : 0
        })
        .eq('id', currentVendor.id);
    } else if (userApplication) {
      // Create new vendor from approved application
      await supabase.from('approved_vendors').insert({
        user_id: user?.id,
        application_id: userApplication.id,
        store_name: userApplication.store_name,
        product_category: userApplication.product_category,
        subscription_plan: plan.id,
        subscription_start_date: now.toISOString(),
        subscription_end_date: endDate.toISOString(),
        is_active: true,
        is_suspended: false,
        product_limit: plan.productLimit === -1 ? 9999 : plan.productLimit,
        commission_rate: plan.commission,
        has_home_visibility: plan.id === 'first_class',
        free_ads_remaining: plan.id === 'first_class' ? 1 : 0
      });

      // Update application status
      await supabase
        .from('shop_applications')
        .update({ status: 'payment', subscription_plan: plan.id })
        .eq('id', userApplication.id);
    }
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
      case 'payment': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const showSubscriptionSelection = userApplication.status === 'approved' || 
    (currentVendor?.is_suspended) ||
    (currentVendor && daysLeft !== null && daysLeft <= 0);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Shop Application Status</h1>
          <p className="text-muted-foreground">Track and manage your shop application</p>
        </div>

        {/* Application Status Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {userApplication.store_name}
                  {getStatusIcon(userApplication.status)}
                </CardTitle>
                <CardDescription>
                  Applied on {new Date(userApplication.created_at).toLocaleDateString()}
                </CardDescription>
              </div>
              <Badge variant={getStatusBadgeVariant(userApplication.status)}>
                {userApplication.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Category:</span>
                <span className="ml-2 font-medium">{userApplication.product_category}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Price Range:</span>
                <span className="ml-2 font-medium">₦{userApplication.price_range_min?.toLocaleString()} - ₦{userApplication.price_range_max?.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Contact:</span>
                <span className="ml-2 font-medium">{userApplication.contact_phone || 'N/A'}</span>
              </div>
            </div>

            {/* Current Subscription Status */}
            {currentVendor && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Current Plan: {currentVendor.subscription_plan?.replace('_', ' ').toUpperCase() || 'None'}</p>
                    {daysLeft !== null && daysLeft > 0 && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Timer className="h-4 w-4" />
                        {daysLeft} days remaining
                      </p>
                    )}
                  </div>
                  {currentVendor.is_suspended && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Suspended
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {userApplication.admin_notes && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">Admin Notes</p>
                <p className="text-sm text-muted-foreground">{userApplication.admin_notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subscription Plans - Show when approved or suspended */}
        {showSubscriptionSelection && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Select Your Subscription Plan</h2>
              <p className="text-muted-foreground">
                {currentVendor?.is_suspended 
                  ? "Your subscription has expired. Select a plan to reactivate your shop."
                  : "Choose a plan to activate your shop and start selling."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {subscriptionPlans.map((plan) => {
                const Icon = plan.icon;
                const isCurrentPlan = currentVendor?.subscription_plan === plan.id;
                const cannotDowngrade = currentVendor && 
                  plan.id === 'free' && 
                  (currentVendor.subscription_plan === 'economy' || currentVendor.subscription_plan === 'first_class') &&
                  daysLeft && daysLeft > 0;

                return (
                  <Card 
                    key={plan.id} 
                    className={`relative ${plan.color} ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}
                  >
                    {isCurrentPlan && (
                      <Badge className="absolute -top-2 left-1/2 -translate-x-1/2">Current</Badge>
                    )}
                    <CardHeader className="text-center">
                      <Icon className="h-10 w-10 mx-auto mb-2" />
                      <CardTitle>{plan.name}</CardTitle>
                      <CardDescription className="text-2xl font-bold">
                        {plan.price === 0 ? 'Free' : `₦${plan.price.toLocaleString()}`}
                        {plan.price > 0 && <span className="text-sm font-normal">/31 days</span>}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm mb-4">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button 
                        className="w-full" 
                        onClick={() => handleSelectPlan(plan)}
                        disabled={processing || (isCurrentPlan && daysLeft && daysLeft > 0) || !!cannotDowngrade}
                        variant={plan.id === 'first_class' ? 'default' : 'outline'}
                      >
                        {processing ? 'Processing...' : (
                          cannotDowngrade ? 'Cannot Downgrade' :
                          isCurrentPlan && daysLeft && daysLeft > 0 ? 'Current Plan' :
                          plan.price === 0 ? 'Activate Free' : 
                          <span className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Pay ₦{plan.price.toLocaleString()}
                          </span>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Pending Status Message */}
        {userApplication.status === 'pending' && (
          <Card>
            <CardContent className="p-8 text-center">
              <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Application Under Review</h3>
              <p className="text-muted-foreground">
                Your application is being reviewed. You will be notified once a decision is made.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Rejected Status */}
        {userApplication.status === 'rejected' && (
          <Card className="border-destructive">
            <CardContent className="p-8 text-center">
              <XCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
              <h3 className="text-lg font-medium mb-2">Application Rejected</h3>
              <p className="text-muted-foreground">
                Unfortunately, your application was not approved. Please review the admin notes for details.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Active Shop */}
        {userApplication.status === 'payment' && currentVendor && !currentVendor.is_suspended && (
          <Card className="border-green-500">
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <h3 className="text-lg font-medium mb-2">Shop Active</h3>
              <p className="text-muted-foreground mb-4">
                Your shop is active. Start adding products and selling!
              </p>
              <Button asChild>
                <Link to="/vendor-dashboard">Go to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ShopApplicationStatus;
