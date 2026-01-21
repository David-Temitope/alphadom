import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Crown, Star, Zap, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { useVendors } from "@/hooks/useVendors";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { loadPaystackScript } from "@/utils/loadPaystack";
import { PAYSTACK_PUBLIC_KEY } from "@/config/paystack";

const subscriptionPlans = [
  {
    id: "free",
    name: "Free Plan",
    price: 0,
    features: ["Upload up to 20 products", "15% commission rate", "Basic visibility", "Standard support"],
    productLimit: 20,
    commissionRate: 15,
    homeVisibility: false,
    freeAds: 0,
    icon: Zap,
    color: "bg-gray-100 text-gray-800",
  },
  {
    id: "economy",
    name: "Economy Plan",
    price: 7000,
    features: ["Upload up to 50 products", "9% commission rate", "Enhanced visibility", "Blue verified badge on products", "Priority support"],
    productLimit: 50,
    commissionRate: 9,
    homeVisibility: false,
    freeAds: 0,
    icon: Star,
    color: "bg-blue-100 text-blue-800",
  },
  {
    id: "first_class",
    name: "First Class Plan",
    price: 15000,
    features: ["Unlimited products", "5% commission rate", "Homepage visibility", "Gold verified badge on products", "1 free ad per month", "Premium support"],
    productLimit: -1,
    commissionRate: 5,
    homeVisibility: true,
    freeAds: 1,
    icon: Crown,
    color: "bg-yellow-100 text-yellow-800",
  },
];

interface VendorSubscriptionProps {
  onPlanChange?: () => void;
}

export const VendorSubscription: React.FC<VendorSubscriptionProps> = ({ onPlanChange }) => {
  const { currentVendor, refreshVendors } = useVendors();
  const { user } = useAuth();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [paystackLoaded, setPaystackLoaded] = useState(false);

  // Load Paystack script with SRI
  useEffect(() => {
    loadPaystackScript()
      .then(() => setPaystackLoaded(true))
      .catch((error) => {
        console.error("Failed to load Paystack:", error);
        toast({
          title: "Payment Error",
          description: "Failed to load payment system. Please refresh.",
          variant: "destructive",
        });
      });
  }, [toast]);

  useEffect(() => {
    if (currentVendor?.subscription_end_date) {
      const endDate = new Date(currentVendor.subscription_end_date);
      const now = new Date();
      const diffTime = endDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysRemaining(Math.max(0, diffDays));

      const progress = Math.max(0, Math.min(100, (diffDays / 31) * 100));
      setProgressPercentage(progress);
    } else {
      setDaysRemaining(null);
      setProgressPercentage(0);
    }
  }, [currentVendor]);

  const canChangePlan = (targetPlanId: string): boolean => {
    if (!currentVendor) return true;

    const currentPlanId = currentVendor.subscription_plan || "free";
    const isExpired = daysRemaining !== null && daysRemaining <= 0;

    // Can always change if expired
    if (isExpired) return true;

    // Can't select same plan
    if (currentPlanId === targetPlanId) return false;

    // Free plan users can upgrade anytime
    if (currentPlanId === "free") return true;

    // Paid plan users can upgrade or switch to another paid plan
    // But cannot downgrade to free until expired
    if (targetPlanId === "free" && (currentPlanId === "economy" || currentPlanId === "first_class")) {
      return false;
    }

    return true;
  };

  const getButtonText = (plan: (typeof subscriptionPlans)[0]): string => {
    if (processing) return "Processing...";

    const currentPlanId = currentVendor?.subscription_plan || "free";
    const isExpired = daysRemaining !== null && daysRemaining <= 0;
    const isCurrentPlan = currentPlanId === plan.id;

    if (isCurrentPlan && !isExpired) return "Current Plan";
    if (isExpired) return plan.price === 0 ? "Select Free Plan" : "Renew Now";
    if (!canChangePlan(plan.id)) return "Available after expiry";
    if (plan.price === 0) return "Select Free Plan";

    // Determine if upgrade or switch
    const planOrder = { free: 0, economy: 1, first_class: 2 };
    const currentOrder = planOrder[currentPlanId as keyof typeof planOrder] || 0;
    const targetOrder = planOrder[plan.id as keyof typeof planOrder] || 0;

    return targetOrder > currentOrder ? "Upgrade Now" : "Switch Plan";
  };

  const handleSelectPlan = async (planId: string) => {
    if (!user || !currentVendor) return;
    if (!canChangePlan(planId)) {
      toast({
        title: "Cannot change plan",
        description: "You cannot downgrade to Free plan until your current subscription expires.",
        variant: "destructive",
      });
      return;
    }

    const selectedPlan = subscriptionPlans.find((p) => p.id === planId);
    if (!selectedPlan) return;

    if (planId === "free") {
      await activatePlan(planId);
    } else {
      handlePaystackPayment(selectedPlan);
    }
  };

  const handlePaystackPayment = (plan: (typeof subscriptionPlans)[0]) => {
    if (!paystackLoaded || !window.PaystackPop) {
      toast({
        title: "Loading...",
        description: "Payment system is loading. Please wait a moment and try again.",
        variant: "default",
      });
      return;
    }

    if (!user?.email) {
      toast({
        title: "Error",
        description: "User email not found. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);

    try {
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: user.email,
        amount: plan.price * 100,
        currency: "NGN",
        ref: `SUB_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        metadata: {
          plan_id: plan.id,
          vendor_id: currentVendor?.id,
          user_id: user.id,
        },
        callback: function (response: any) {
          if (response?.status === "success") {
            (async () => {
              await activatePlan(plan.id, response.reference);

              await supabase.from("platform_transactions").insert({
                transaction_type: "subscription",
                amount: plan.price,
                user_id: user.id,
                vendor_id: currentVendor?.id,
                reference: response.reference,
                payment_method: "paystack",
                status: "completed",
                description: `${plan.name} subscription payment`,
                metadata: { plan_id: plan.id },
              });
            })()
              .catch(() => {
                toast({
                  title: "Error",
                  description: "Payment succeeded, but we couldn't activate your plan. Please contact support.",
                  variant: "destructive",
                });
              })
              .finally(() => {
                setProcessing(false);
              });
          } else {
            setProcessing(false);
          }
        },
        onClose: function () {
          setProcessing(false);
        },
      });

      handler.openIframe();
    } catch (error) {
      console.error("Paystack error:", error);
      setProcessing(false);
      toast({
        title: "Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const activatePlan = async (planId: string, reference?: string) => {
    const plan = subscriptionPlans.find((p) => p.id === planId);
    if (!plan || !currentVendor) return;

    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 31);

      const { error } = await supabase
        .from("approved_vendors")
        .update({
          subscription_plan: planId,
          subscription_start_date: startDate.toISOString(),
          subscription_end_date: endDate.toISOString(),
          product_limit: plan.productLimit,
          commission_rate: plan.commissionRate,
          has_home_visibility: plan.homeVisibility,
          free_ads_remaining: plan.freeAds,
          is_suspended: false,
        })
        .eq("id", currentVendor.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${plan.name} activated successfully! Your subscription will expire in 31 days.`,
      });

      await refreshVendors();
      onPlanChange?.();
    } catch (error) {
      console.error("Error activating plan:", error);
      toast({
        title: "Error",
        description: "Failed to activate plan. Please try again.",
        variant: "destructive",
      });
    }
  };

  const currentPlan = subscriptionPlans.find((p) => p.id === (currentVendor?.subscription_plan || "free"));
  const isExpired = daysRemaining !== null && daysRemaining <= 0;

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      {currentVendor?.subscription_start_date && (
        <Card className={isExpired ? "border-destructive" : ""}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {isExpired ? <AlertTriangle className="h-5 w-5 text-destructive" /> : <Clock className="h-5 w-5" />}
                  Current Subscription
                </CardTitle>
                <CardDescription>
                  {currentPlan?.name} - {isExpired ? "Expired" : `${daysRemaining} days remaining`}
                </CardDescription>
              </div>
              <Badge className={currentPlan?.color}>{currentPlan?.name}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {!isExpired && daysRemaining !== null && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Time remaining</span>
                  <span className="font-medium">{daysRemaining} days</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            )}
            {isExpired && (
              <div className="text-destructive text-sm">
                Your subscription has expired. Please select a plan below to continue selling.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {subscriptionPlans.map((plan) => {
          const IconComponent = plan.icon;
          const isCurrentPlan = currentVendor?.subscription_plan === plan.id;
          const canChange = canChangePlan(plan.id);

          return (
            <Card key={plan.id} className={`relative ${isCurrentPlan && !isExpired ? "border-primary border-2" : ""}`}>
              {isCurrentPlan && !isExpired && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary">Current Plan</Badge>
                </div>
              )}
              <CardHeader className="text-center">
                <div className={`w-12 h-12 rounded-full ${plan.color} mx-auto flex items-center justify-center mb-2`}>
                  <IconComponent className="h-6 w-6" />
                </div>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>
                  {plan.price === 0 ? (
                    <span className="text-2xl font-bold">Free</span>
                  ) : (
                    <span className="text-2xl font-bold">₦{plan.price.toLocaleString()}</span>
                  )}
                  <span className="text-sm text-muted-foreground"> / month</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={isCurrentPlan && !isExpired ? "outline" : "default"}
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={processing || (isCurrentPlan && !isExpired) || !canChange}
                >
                  {getButtonText(plan)}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default VendorSubscription;
