// Multi-vendor checkout types and constants

export const VAT_RATE = 0.025; // 2.5% VAT
export const SERVICE_CHARGE_RATE = 2.5; // 2.5% service charge

// Commission rates by subscription plan (percentage)
export const COMMISSION_RATES: Record<string, number> = {
  first_class: 5,    // 5% commission + 2.5% service = 7.5% platform takes
  economy: 9,        // 9% commission + 2.5% service = 11.5% platform takes  
  free: 15,          // 15% commission + 2.5% service = 17.5% platform takes
};

export type ShippingInfo = {
  firstName?: string;
  lastName?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  deliveryMethod?: 'zone1' | 'zone2' | 'zone3';
};

export type PaymentMethod = "bank_transfer" | "paystack";

export type PaymentStatus = "pending" | "processing" | "paid" | "failed";

export type VendorGroup = {
  vendor_id: string | null; // null for admin/platform products
  vendor_name: string;
  vendor_location: string | null; // Business address/location
  subscription_plan: string;
  paystack_subaccount_code: string | null;
  gift_plan?: string | null;
  gift_commission_rate?: number | null;
  gift_plan_expires_at?: string | null;
  items: CartItemWithVendor[];
  subtotal: number;
  shipping: number;
  vat: number;
  total: number;
  order_id?: string;
  payment_status: PaymentStatus;
  paystack_reference?: string;
};

export type CartItemWithVendor = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  vendor_id: string | null;
  shipping_fee: number; // Zone 1 - Local (Same City/State)
  shipping_fee_2km_5km?: number; // Zone 2 - Regional (Neighboring States)
  shipping_fee_over_5km?: number; // Zone 3 - National (Far Away)
  shipping_type: "one_time" | "per_product";
};

export type CheckoutSession = {
  session_id: string;
  vendor_groups: VendorGroup[];
  shipping_info: ShippingInfo;
  total_amount: number;
  created_at: Date;
};

// Calculate shipping for a group of items based on delivery zone
// Zone 1 - Local (Same City/State as vendor) - uses shipping_fee
// Zone 2 - Regional (Neighboring States) - uses shipping_fee_2km_5km
// Zone 3 - National (Far Away) - uses shipping_fee_over_5km
export const calculateGroupShipping = (
  items: CartItemWithVendor[], 
  deliveryMethod: 'zone1' | 'zone2' | 'zone3' = 'zone1'
): number => {
  let totalShipping = 0;
  const oneTimeShippingApplied = new Set<string>();

  for (const item of items) {
    // Get the appropriate shipping fee based on delivery zone
    let shippingFee = 0;
    if (deliveryMethod === 'zone1') {
      // Zone 1 - Local (Same City/State)
      shippingFee = Number(item.shipping_fee) || 0;
    } else if (deliveryMethod === 'zone2') {
      // Zone 2 - Regional (Neighboring States)
      shippingFee = Number(item.shipping_fee_2km_5km) || Number(item.shipping_fee) || 0;
    } else if (deliveryMethod === 'zone3') {
      // Zone 3 - National (Far Away)
      shippingFee = Number(item.shipping_fee_over_5km) || Number(item.shipping_fee) || 0;
    }
    
    const shippingType = item.shipping_type || "one_time";
    const quantity = Number(item.quantity) || 1;

    if (shippingFee <= 0) continue;

    if (shippingType === "per_product") {
      totalShipping += shippingFee * quantity;
    } else {
      if (!oneTimeShippingApplied.has(item.id)) {
        oneTimeShippingApplied.add(item.id);
        totalShipping += shippingFee;
      }
    }
  }

  return totalShipping;
};

// Get commission rate based on subscription plan
export const getCommissionRate = (subscriptionPlan: string): number => {
  return COMMISSION_RATES[subscriptionPlan] || COMMISSION_RATES["free"];
};

// Calculate effective commission rate considering gift plans
export const getEffectiveCommissionRate = (
  subscriptionPlan: string,
  giftPlan?: string | null,
  giftCommissionRate?: number | null,
  giftPlanExpiresAt?: string | null
): number => {
  // Check if gift plan is active
  if (giftPlanExpiresAt) {
    const expiresAt = new Date(giftPlanExpiresAt);
    const now = new Date();
    
    if (expiresAt > now) {
      // Gift is still active
      // If custom commission rate is set, use it
      if (giftCommissionRate !== null && giftCommissionRate !== undefined) {
        return giftCommissionRate;
      }
      // Otherwise use the gift plan's standard rate
      if (giftPlan) {
        return getCommissionRate(giftPlan);
      }
    }
  }
  
  // Default to subscription plan rate
  return getCommissionRate(subscriptionPlan);
};

// Calculate platform charge in kobo for Paystack transaction_charge
export const calculatePlatformCharge = (
  subtotal: number,
  subscriptionPlan: string,
  giftPlan?: string | null,
  giftCommissionRate?: number | null,
  giftPlanExpiresAt?: string | null
): number => {
  const commissionRate = getEffectiveCommissionRate(
    subscriptionPlan,
    giftPlan,
    giftCommissionRate,
    giftPlanExpiresAt
  );
  
  // Total platform take = commission + service charge
  const totalPlatformRate = commissionRate + SERVICE_CHARGE_RATE;
  
  // Convert to kobo (multiply by 100) and round
  return Math.round(subtotal * (totalPlatformRate / 100) * 100);
};

// Generate unique checkout session ID
export const generateSessionId = (): string => {
  return `CHECKOUT_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
};

// Generate unique Paystack reference per vendor order
export const generatePaystackReference = (sessionId: string, vendorIndex: number): string => {
  return `${sessionId}_V${vendorIndex}_${Date.now()}`;
};
