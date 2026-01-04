import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Calculator, 
  CheckCircle2, 
  Store, 
  AlertCircle,
  DollarSign,
  Percent,
  CreditCard,
  Building
} from "lucide-react";
import {
  COMMISSION_RATES,
  SERVICE_CHARGE_RATE,
  VAT_RATE,
  getCommissionRate,
  getEffectiveCommissionRate,
  calculatePlatformCharge,
} from "@/types/checkout";

type TestScenario = {
  id: string;
  vendorName: string;
  subscriptionPlan: "free" | "economy" | "first_class";
  hasSubaccount: boolean;
  subaccountCode: string;
  giftPlan: string | null;
  giftCommissionRate: number | null;
  giftPlanExpiresAt: string | null;
  subtotal: number;
  shippingFee: number;
};

const defaultScenarios: TestScenario[] = [
  {
    id: "1",
    vendorName: "Free Plan Vendor",
    subscriptionPlan: "free",
    hasSubaccount: true,
    subaccountCode: "ACCT_xxxx_free",
    giftPlan: null,
    giftCommissionRate: null,
    giftPlanExpiresAt: null,
    subtotal: 10000,
    shippingFee: 500,
  },
  {
    id: "2",
    vendorName: "Economy Plan Vendor",
    subscriptionPlan: "economy",
    hasSubaccount: true,
    subaccountCode: "ACCT_xxxx_economy",
    giftPlan: null,
    giftCommissionRate: null,
    giftPlanExpiresAt: null,
    subtotal: 25000,
    shippingFee: 1000,
  },
  {
    id: "3",
    vendorName: "First Class Vendor",
    subscriptionPlan: "first_class",
    hasSubaccount: true,
    subaccountCode: "ACCT_xxxx_firstclass",
    giftPlan: null,
    giftCommissionRate: null,
    giftPlanExpiresAt: null,
    subtotal: 50000,
    shippingFee: 0,
  },
  {
    id: "4",
    vendorName: "Gift Plan Vendor (Custom 3%)",
    subscriptionPlan: "free",
    hasSubaccount: true,
    subaccountCode: "ACCT_xxxx_gift",
    giftPlan: "first_class",
    giftCommissionRate: 3,
    giftPlanExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    subtotal: 15000,
    shippingFee: 750,
  },
];

const PaystackTestCheckout: React.FC = () => {
  const [scenarios, setScenarios] = useState<TestScenario[]>(defaultScenarios);
  const [customAmount, setCustomAmount] = useState<number>(10000);
  const [customPlan, setCustomPlan] = useState<"free" | "economy" | "first_class">("free");
  const [hasGiftPlan, setHasGiftPlan] = useState(false);
  const [giftCommissionOverride, setGiftCommissionOverride] = useState<number>(5);

  const calculatePaymentDetails = (scenario: TestScenario) => {
    const effectiveCommissionRate = getEffectiveCommissionRate(
      scenario.subscriptionPlan,
      scenario.giftPlan,
      scenario.giftCommissionRate,
      scenario.giftPlanExpiresAt
    );

    const baseCommissionRate = getCommissionRate(scenario.subscriptionPlan);
    const totalPlatformRate = effectiveCommissionRate + SERVICE_CHARGE_RATE;
    
    // Calculate amounts
    const commissionAmount = scenario.subtotal * (effectiveCommissionRate / 100);
    const serviceChargeAmount = scenario.subtotal * (SERVICE_CHARGE_RATE / 100);
    const platformTotalAmount = commissionAmount + serviceChargeAmount;
    const vat = scenario.subtotal * VAT_RATE;
    const orderTotal = scenario.subtotal + scenario.shippingFee + vat;
    
    // Vendor receives: subtotal - platform commission + shipping
    const vendorReceives = (scenario.subtotal - platformTotalAmount) + scenario.shippingFee;
    
    // Platform charge in kobo for Paystack
    const platformChargeKobo = calculatePlatformCharge(
      scenario.subtotal,
      scenario.subscriptionPlan,
      scenario.giftPlan,
      scenario.giftCommissionRate,
      scenario.giftPlanExpiresAt
    );

    // Paystack config that would be sent
    const paystackConfig = scenario.hasSubaccount ? {
      amount: Math.round(orderTotal * 100), // Total order amount in kobo
      subaccount: scenario.subaccountCode,
      transaction_charge: platformChargeKobo,
      bearer: "account",
    } : {
      amount: Math.round(orderTotal * 100),
      // No subaccount for platform products
    };

    return {
      effectiveCommissionRate,
      baseCommissionRate,
      totalPlatformRate,
      commissionAmount,
      serviceChargeAmount,
      platformTotalAmount,
      vat,
      orderTotal,
      vendorReceives,
      vendorPercentage: ((vendorReceives - scenario.shippingFee) / scenario.subtotal) * 100,
      platformChargeKobo,
      paystackConfig,
      isGiftActive: scenario.giftPlan && scenario.giftPlanExpiresAt && new Date(scenario.giftPlanExpiresAt) > new Date(),
    };
  };

  const addCustomScenario = () => {
    const newScenario: TestScenario = {
      id: `custom-${Date.now()}`,
      vendorName: `Custom Test (${customPlan})`,
      subscriptionPlan: customPlan,
      hasSubaccount: true,
      subaccountCode: `ACCT_custom_${Date.now()}`,
      giftPlan: hasGiftPlan ? "first_class" : null,
      giftCommissionRate: hasGiftPlan ? giftCommissionOverride : null,
      giftPlanExpiresAt: hasGiftPlan ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null,
      subtotal: customAmount,
      shippingFee: 500,
    };
    setScenarios([...scenarios, newScenario]);
  };

  const removeScenario = (id: string) => {
    setScenarios(scenarios.filter(s => s.id !== id));
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Calculator className="h-8 w-8" />
            Paystack Payment Test Calculator
          </h1>
          <p className="text-muted-foreground">
            Test and verify the direct subaccount payment calculations for different subscription plans.
          </p>
        </div>

        {/* Commission Rates Reference */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5" />
              Commission Rate Reference
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Object.entries(COMMISSION_RATES).map(([plan, rate]) => (
                <div key={plan} className="p-4 bg-muted rounded-lg">
                  <div className="font-semibold capitalize">{plan.replace("_", " ")}</div>
                  <div className="text-2xl font-bold text-primary">{rate}%</div>
                  <div className="text-sm text-muted-foreground">
                    + {SERVICE_CHARGE_RATE}% service = {rate + SERVICE_CHARGE_RATE}% total
                  </div>
                  <div className="text-sm text-green-600 font-medium mt-1">
                    Vendor gets: {100 - rate - SERVICE_CHARGE_RATE}%
                  </div>
                </div>
              ))}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="font-semibold">Gift Plan</div>
                <div className="text-2xl font-bold text-amber-600">Custom%</div>
                <div className="text-sm text-muted-foreground">
                  Admin can set any rate
                </div>
                <div className="text-sm text-green-600 font-medium mt-1">
                  Overrides subscription
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Custom Scenario Creator */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add Custom Test Scenario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div>
                <Label>Subtotal (₦)</Label>
                <Input
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(Number(e.target.value))}
                  placeholder="10000"
                />
              </div>
              <div>
                <Label>Subscription Plan</Label>
                <Select value={customPlan} onValueChange={(v: any) => setCustomPlan(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="economy">Economy</SelectItem>
                    <SelectItem value="first_class">First Class</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={hasGiftPlan} onCheckedChange={setHasGiftPlan} />
                <Label>Has Gift Plan</Label>
              </div>
              {hasGiftPlan && (
                <div>
                  <Label>Gift Commission %</Label>
                  <Input
                    type="number"
                    value={giftCommissionOverride}
                    onChange={(e) => setGiftCommissionOverride(Number(e.target.value))}
                    placeholder="5"
                    min={0}
                    max={50}
                  />
                </div>
              )}
              <Button onClick={addCustomScenario}>
                Add Scenario
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Scenarios */}
        <div className="space-y-6">
          {scenarios.map((scenario) => {
            const details = calculatePaymentDetails(scenario);
            
            return (
              <Card key={scenario.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Store className="h-5 w-5" />
                      {scenario.vendorName}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {scenario.subscriptionPlan.replace("_", " ")}
                      </Badge>
                      {details.isGiftActive && (
                        <Badge className="bg-amber-500">
                          Gift Active ({scenario.giftCommissionRate}%)
                        </Badge>
                      )}
                      {scenario.hasSubaccount ? (
                        <Badge className="bg-green-500">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Subaccount Ready
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          No Subaccount
                        </Badge>
                      )}
                      {scenario.id.startsWith("custom") && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeScenario(scenario.id)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Order Breakdown */}
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Order Breakdown
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Subtotal (product price):</span>
                          <span className="font-medium">₦{scenario.subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Shipping Fee:</span>
                          <span>₦{scenario.shippingFee.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>VAT ({VAT_RATE * 100}%):</span>
                          <span>₦{details.vat.toLocaleString()}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                          <span>Order Total:</span>
                          <span>₦{details.orderTotal.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Commission Calculation */}
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Percent className="h-4 w-4" />
                        Commission Calculation
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Base Plan Rate ({scenario.subscriptionPlan}):</span>
                          <span>{details.baseCommissionRate}%</span>
                        </div>
                        {details.isGiftActive && (
                          <div className="flex justify-between text-amber-600">
                            <span>Gift Override:</span>
                            <span>{scenario.giftCommissionRate}%</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Effective Commission Rate:</span>
                          <span className="font-medium">{details.effectiveCommissionRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>+ Service Charge:</span>
                          <span>{SERVICE_CHARGE_RATE}%</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-semibold">
                          <span>Total Platform Rate:</span>
                          <span>{details.totalPlatformRate}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Money Distribution */}
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Money Distribution
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-blue-600">
                          <span>Commission (from ₦{scenario.subtotal.toLocaleString()}):</span>
                          <span>₦{details.commissionAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-blue-600">
                          <span>Service Charge:</span>
                          <span>₦{details.serviceChargeAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-blue-700 bg-blue-50 p-2 rounded">
                          <span>Platform Receives:</span>
                          <span>₦{details.platformTotalAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-green-700 bg-green-50 p-2 rounded">
                          <span>Vendor Receives (incl. shipping):</span>
                          <span>₦{details.vendorReceives.toLocaleString()}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Vendor gets {details.vendorPercentage.toFixed(1)}% of product subtotal
                        </div>
                      </div>
                    </div>

                    {/* Paystack Config */}
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Paystack Config (What's Sent)
                      </h4>
                      <div className="bg-muted p-4 rounded-lg font-mono text-xs overflow-x-auto">
                        <pre>{JSON.stringify(details.paystackConfig, null, 2)}</pre>
                      </div>
                      {scenario.hasSubaccount && (
                        <div className="text-xs space-y-1 text-muted-foreground">
                          <div><strong>subaccount:</strong> Vendor's Paystack subaccount code</div>
                          <div><strong>transaction_charge:</strong> Platform commission in kobo ({details.platformChargeKobo.toLocaleString()} kobo = ₦{(details.platformChargeKobo / 100).toLocaleString()})</div>
                          <div><strong>bearer: "account":</strong> Platform pays Paystack fees</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Verification */}
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Verification Check
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-green-600">Customer Pays</div>
                        <div className="font-bold">₦{details.orderTotal.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-blue-600">Platform Gets</div>
                        <div className="font-bold">₦{details.platformTotalAmount.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-green-600">Vendor Gets</div>
                        <div className="font-bold">₦{details.vendorReceives.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-amber-600">VAT (retained)</div>
                        <div className="font-bold">₦{details.vat.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-green-700">
                      ✓ Total distributed: ₦{(details.platformTotalAmount + details.vendorReceives + details.vat).toLocaleString()} 
                      {" "}(matches order total: ₦{details.orderTotal.toLocaleString()})
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Summary */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Implementation Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose prose-sm max-w-none">
              <h4>How the Direct Subaccount Payment Works:</h4>
              <ol className="text-sm space-y-2">
                <li>
                  <strong>Customer initiates payment</strong> - Total order amount (subtotal + shipping + VAT) is charged
                </li>
                <li>
                  <strong>Paystack receives the payment</strong> - Using the vendor's subaccount code
                </li>
                <li>
                  <strong>Platform charge is deducted</strong> - The <code>transaction_charge</code> (in kobo) goes to the platform
                </li>
                <li>
                  <strong>Vendor receives the rest</strong> - Automatically split by Paystack to vendor's subaccount
                </li>
              </ol>
              
              <h4 className="mt-4">Key Configuration:</h4>
              <ul className="text-sm space-y-1">
                <li><code>subaccount</code>: Vendor's Paystack subaccount code (set via Admin → Vendor Monitoring → Setup Split)</li>
                <li><code>transaction_charge</code>: Platform's commission + service charge in kobo</li>
                <li><code>bearer: "account"</code>: Platform account pays Paystack's transaction fees</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaystackTestCheckout;
