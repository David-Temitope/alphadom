// Multi-vendor checkout types and constants

export const VAT_RATE = 0.025; // 2.5% VAT

// Split Group IDs - Paystack handles commission automatically
export const SPLIT_GROUPS: Record<string, string> = {
  'first_class': 'SPL_vNGYPJAeYT',
  'economy': 'SPL_iIuyLk9ghh',
  'free': 'SPL_VMVciFxPCP'
};

export type ShippingInfo = {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
};

export type PaymentMethod = 'bank_transfer' | 'paystack';

export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed';

export type VendorGroup = {
  vendor_id: string | null; // null for admin/platform products
  vendor_name: string;
  subscription_plan: string;
  paystack_subaccount_code: string | null;
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
  shipping_fee: number;
  shipping_type: 'one_time' | 'per_product';
};

export type CheckoutSession = {
  session_id: string;
  vendor_groups: VendorGroup[];
  shipping_info: ShippingInfo;
  total_amount: number;
  created_at: Date;
};

// Calculate shipping for a group of items
export const calculateGroupShipping = (items: CartItemWithVendor[]): number => {
  let totalShipping = 0;
  const oneTimeShippingApplied = new Set<string>();

  for (const item of items) {
    const shippingFee = Number(item.shipping_fee) || 0;
    const shippingType = item.shipping_type || 'one_time';
    const quantity = Number(item.quantity) || 1;

    if (shippingFee <= 0) continue;

    if (shippingType === 'per_product') {
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

// Get split group ID based on subscription plan
export const getSplitGroupId = (subscriptionPlan: string): string => {
  return SPLIT_GROUPS[subscriptionPlan] || SPLIT_GROUPS['free'];
};

// Generate unique checkout session ID
export const generateSessionId = (): string => {
  return `CHECKOUT_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
};

// Generate unique Paystack reference per vendor order
export const generatePaystackReference = (sessionId: string, vendorIndex: number): string => {
  return `${sessionId}_V${vendorIndex}_${Date.now()}`;
};
