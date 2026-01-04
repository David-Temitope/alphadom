import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  VendorGroup,
  ShippingInfo,
  CartItemWithVendor,
  PaymentStatus,
  VAT_RATE,
  SERVICE_CHARGE_RATE,
  calculateGroupShipping,
  getCommissionRate,
  getEffectiveCommissionRate,
  calculatePlatformCharge,
  generateSessionId,
  generatePaystackReference,
} from "@/types/checkout";

type VendorInfo = {
  id: string;
  store_name: string;
  subscription_plan: string;
  paystack_subaccount_code: string | null;
  business_address: string | null;
  gift_plan: string | null;
  gift_commission_rate: number | null;
  gift_plan_expires_at: string | null;
};

export const useMultiVendorCheckout = () => {
  const { items, total, clearCart, removeItemsByVendor } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();

  const [vendorGroups, setVendorGroups] = useState<VendorGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [currentPaymentIndex, setCurrentPaymentIndex] = useState(0);
  const [sessionId] = useState(() => generateSessionId());

  // Fetch vendor info for all unique vendor IDs in cart
  const fetchVendorInfo = useCallback(async (vendorIds: string[]): Promise<Map<string, VendorInfo>> => {
    const vendorMap = new Map<string, VendorInfo>();

    if (vendorIds.length === 0) return vendorMap;

    // Fetch vendor info with gift plan details
    const { data, error } = await supabase
      .from("approved_vendors")
      .select("id, store_name, subscription_plan, paystack_subaccount_code, application_id, gift_plan, gift_commission_rate, gift_plan_expires_at")
      .in("id", vendorIds);

    if (error) {
      console.error("Error fetching vendor info:", error);
      return vendorMap;
    }

    // Fetch business addresses from shop_applications
    const applicationIds = data?.map(v => v.application_id).filter(Boolean) || [];
    let addressMap = new Map<string, string>();
    
    if (applicationIds.length > 0) {
      const { data: appData } = await supabase
        .from("shop_applications")
        .select("id, business_address")
        .in("id", applicationIds);
      
      appData?.forEach((app) => {
        if (app.business_address) {
          addressMap.set(app.id, app.business_address);
        }
      });
    }

    data?.forEach((vendor) => {
      vendorMap.set(vendor.id, {
        id: vendor.id,
        store_name: vendor.store_name,
        subscription_plan: vendor.subscription_plan || "free",
        paystack_subaccount_code: vendor.paystack_subaccount_code,
        business_address: vendor.application_id ? addressMap.get(vendor.application_id) || null : null,
        gift_plan: vendor.gift_plan || null,
        gift_commission_rate: vendor.gift_commission_rate ?? null,
        gift_plan_expires_at: vendor.gift_plan_expires_at || null,
      });
    });

    return vendorMap;
  }, []);

  // Group cart items by vendor
  const groupItemsByVendor = useCallback(async () => {
    if (!items || items.length === 0) {
      setVendorGroups([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Lookup missing vendor/shipping details (important for carts saved before vendor_id was included)
    const productIdsNeedingLookup = items
      .filter(
        (item: any) =>
          item.vendor_id === undefined ||
          item.vendor_id === null ||
          item.shipping_fee === undefined ||
          item.shipping_type === undefined,
      )
      .map((item: any) => item.id);

    const productLookup = new Map<
      string,
      {
        vendor_id: string | null;
        shipping_fee: number;
        shipping_fee_2km_5km: number;
        shipping_fee_over_5km: number;
        shipping_type: "one_time" | "per_product";
      }
    >();

    if (productIdsNeedingLookup.length > 0) {
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("id, vendor_id, shipping_fee, shipping_fee_2km_5km, shipping_fee_over_5km, shipping_type")
        .in("id", productIdsNeedingLookup);

      if (!productsError) {
        productsData?.forEach((p: any) => {
          productLookup.set(p.id, {
            vendor_id: p.vendor_id ?? null,
            shipping_fee: Number(p.shipping_fee) || 0,
            shipping_fee_2km_5km: Number(p.shipping_fee_2km_5km) || 0,
            shipping_fee_over_5km: Number(p.shipping_fee_over_5km) || 0,
            shipping_type: (p.shipping_type as "one_time" | "per_product") || "one_time",
          });
        });
      }
    }

    // Get unique vendor IDs (excluding null for platform products)
    const vendorIds = [
      ...new Set(
        items
          .map((item: any) => item.vendor_id ?? productLookup.get(item.id)?.vendor_id)
          .filter((id: any): id is string => id !== null && id !== undefined),
      ),
    ];

    // Fetch vendor info
    const vendorInfoMap = await fetchVendorInfo(vendorIds);

    // Group items by vendor_id
    const groupedItems = new Map<string | null, CartItemWithVendor[]>();

    items.forEach((item: any) => {
      const fallback = productLookup.get(item.id);
      const vendorId = (item.vendor_id ?? fallback?.vendor_id ?? null) as string | null;
      const shippingFee = Number(item.shipping_fee ?? fallback?.shipping_fee ?? 0);
      const shippingFee2km5km = Number(item.shipping_fee_2km_5km ?? fallback?.shipping_fee_2km_5km ?? 0);
      const shippingFeeOver5km = Number(item.shipping_fee_over_5km ?? fallback?.shipping_fee_over_5km ?? 0);
      const shippingType = (item.shipping_type ?? fallback?.shipping_type ?? "one_time") as "one_time" | "per_product";

      const existing = groupedItems.get(vendorId) || [];
      existing.push({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        vendor_id: vendorId,
        shipping_fee: shippingFee,
        shipping_fee_2km_5km: shippingFee2km5km,
        shipping_fee_over_5km: shippingFeeOver5km,
        shipping_type: shippingType,
      });
      groupedItems.set(vendorId, existing);
    });

    // Convert to VendorGroup array
    const groups: VendorGroup[] = [];

    groupedItems.forEach((groupItems, vendorId) => {
      const vendorInfo = vendorId ? vendorInfoMap.get(vendorId) : null;

      const subtotal = groupItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const shipping = calculateGroupShipping(groupItems);
      const vat = subtotal * VAT_RATE;
      const groupTotal = subtotal + shipping + vat;

      groups.push({
        vendor_id: vendorId,
        vendor_name: vendorInfo?.store_name || "Alphadom",
        vendor_location: vendorInfo?.business_address || null,
        subscription_plan: vendorInfo?.subscription_plan || "free",
        paystack_subaccount_code: vendorInfo?.paystack_subaccount_code || null,
        gift_plan: vendorInfo?.gift_plan || null,
        gift_commission_rate: vendorInfo?.gift_commission_rate ?? null,
        gift_plan_expires_at: vendorInfo?.gift_plan_expires_at || null,
        items: groupItems,
        subtotal,
        shipping,
        vat,
        total: groupTotal,
        payment_status: "pending",
      });
    });

    // Sort: Platform products first, then by vendor name
    groups.sort((a, b) => {
      if (a.vendor_id === null) return -1;
      if (b.vendor_id === null) return 1;
      return a.vendor_name.localeCompare(b.vendor_name);
    });

    setVendorGroups(groups);
    setLoading(false);
  }, [items, fetchVendorInfo]);

  useEffect(() => {
    groupItemsByVendor();
  }, [groupItemsByVendor]);

  // Calculate grand totals
  const grandTotals = useMemo(() => {
    return vendorGroups.reduce(
      (acc, group) => ({
        subtotal: acc.subtotal + group.subtotal,
        shipping: acc.shipping + group.shipping,
        vat: acc.vat + group.vat,
        total: acc.total + group.total,
      }),
      { subtotal: 0, shipping: 0, vat: 0, total: 0 },
    );
  }, [vendorGroups]);

  // Get effective commission rate for a vendor group (considers gift plans)
  const getGroupCommissionRate = (group: VendorGroup): number => {
    return getEffectiveCommissionRate(
      group.subscription_plan,
      group.gift_plan,
      group.gift_commission_rate,
      group.gift_plan_expires_at
    );
  };

  // Create order for a specific vendor group
  const createVendorOrder = async (
    group: VendorGroup,
    shippingInfo: ShippingInfo,
    paymentMethod: string,
    paymentStatus: "pending" | "paid" = "pending",
    paystackReference?: string,
  ): Promise<string | null> => {
    if (!user) return null;

    try {
      // Get vendor user_id for notification (vendor_owner_id)
      let vendorOwnerId: string | null = null;
      if (group.vendor_id) {
        const { data: vendorData } = await supabase
          .from("approved_vendors")
          .select("user_id")
          .eq("id", group.vendor_id)
          .single();
        vendorOwnerId = vendorData?.user_id || null;
      }

      // Create order with vendor_owner_id for proper vendor lookup
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          vendor_id: group.vendor_id,
          vendor_owner_id: group.vendor_id, // This links order to vendor
          total_amount: group.total,
          subtotal: group.subtotal,
          shipping_cost: group.shipping,
          tax_amount: group.vat,
          shipping_address: shippingInfo,
          payment_method: paymentMethod,
          payment_status: paymentStatus,
          status: paymentStatus === "paid" ? "processing" : "pending",
        })
        .select("id")
        .single();

      if (orderError) throw orderError;

      // Create order items - only items belonging to this vendor
      const orderItems = group.items.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

      if (itemsError) throw itemsError;

      // Calculate commission for metadata
      // Commission + Service Charge = Total Platform Take
      // Free: 15% + 2.5% = 17.5% (vendor gets 82.5%)
      // Economy: 9% + 2.5% = 11.5% (vendor gets 88.5%)
      // First Class: 5% + 2.5% = 7.5% (vendor gets 92.5%)
      // Gift plans may have custom rates
      const commissionRate = getGroupCommissionRate(group);
      const commissionAmount = group.subtotal * (commissionRate / 100);
      const serviceCharge = group.subtotal * (SERVICE_CHARGE_RATE / 100);
      const totalPlatformTake = commissionAmount + serviceCharge;
      const vendorPayout = (group.subtotal - totalPlatformTake) + group.shipping;

      // Record transaction with commission details
      await supabase.from("platform_transactions").insert({
        transaction_type: "order_payment",
        amount: group.total,
        user_id: user.id,
        vendor_id: group.vendor_id,
        order_id: order.id,
        reference: paystackReference || null,
        payment_method: paymentMethod,
        description: `Order payment - ${group.items.length} item(s) from ${group.vendor_name}`,
        status: paymentStatus === "paid" ? "completed" : "pending",
        metadata: {
          session_id: sessionId,
          items_count: group.items.length,
          subtotal: group.subtotal,
          shipping: group.shipping,
          vat: group.vat,
          vendor_name: group.vendor_name,
          subscription_plan: group.subscription_plan,
          gift_plan: group.gift_plan,
          gift_commission_rate: group.gift_commission_rate,
          commission_rate: commissionRate,
          service_charge_rate: SERVICE_CHARGE_RATE,
          commission_amount: commissionAmount,
          service_charge: serviceCharge,
          platform_commission: totalPlatformTake,
          vendor_payout: vendorPayout,
          subaccount_code: group.paystack_subaccount_code,
        },
      });

      // Create notification for vendor about new order
      if (vendorOwnerId) {
        const itemsList = group.items.map((i) => i.name).join(", ");
        const effectiveCommissionRate = getGroupCommissionRate(group);
        const effectiveCommissionAmount = group.subtotal * (effectiveCommissionRate / 100);
        await supabase.from("user_notifications").insert({
          user_id: vendorOwnerId,
          title: "New Order Received!",
          message: `New order received: Products ₦${group.subtotal.toLocaleString()} (Shipping ₦${group.shipping.toLocaleString()}, Service Charge ₦${group.vat.toLocaleString()}). Commission: ${effectiveCommissionRate}% (₦${effectiveCommissionAmount.toLocaleString()}). Items: ${itemsList.substring(0, 100)}${itemsList.length > 100 ? "..." : ""}`,
          type: "order",
          related_id: order.id,
        });
      }

      return order.id;
    } catch (error) {
      console.error("Error creating vendor order:", error);
      return null;
    }
  };

  // Update group payment status
  const updateGroupPaymentStatus = (
    vendorId: string | null,
    status: PaymentStatus,
    orderId?: string,
    reference?: string,
  ) => {
    setVendorGroups((prev) =>
      prev.map((group) => {
        if (group.vendor_id === vendorId) {
          return {
            ...group,
            payment_status: status,
            order_id: orderId || group.order_id,
            paystack_reference: reference || group.paystack_reference,
          };
        }
        return group;
      }),
    );
  };

  // Process single Paystack payment for a vendor group
  const processVendorPayment = (
    group: VendorGroup,
    index: number,
    shippingInfo: ShippingInfo,
    onComplete: () => void,
    onError: (error: string) => void,
  ) => {
    if (!user || !window.PaystackPop) {
      onError("Paystack not available");
      return;
    }

    const reference = generatePaystackReference(sessionId, index);

    const paystackConfig: any = {
      key: "pk_live_b65b60f97ee0b66e9631df6b1301ef83d383913a",
      email: user.email,
      amount: Math.round(group.total * 100), // Amount in kobo
      currency: "NGN",
      ref: reference,
      metadata: {
        session_id: sessionId,
        vendor_id: group.vendor_id,
        vendor_name: group.vendor_name,
        custom_fields: [
          { display_name: "Vendor", variable_name: "vendor", value: group.vendor_name },
          { display_name: "Phone", variable_name: "phone", value: shippingInfo.phone },
        ],
      },

      callback: function (response: any) {
        updateGroupPaymentStatus(group.vendor_id, "processing");

        createVendorOrder(group, shippingInfo, "paystack", "paid", response.reference)
          .then((orderId) => {
            if (orderId) {
              updateGroupPaymentStatus(group.vendor_id, "paid", orderId, response.reference);
              // Remove the paid vendor's items from cart
              removeItemsByVendor(group.vendor_id);
              onComplete();
            } else {
              updateGroupPaymentStatus(group.vendor_id, "failed");
              onError(`Failed to create order for ${group.vendor_name}`);
            }
          })
          .catch((err) => {
            console.error("Payment callback error:", err);
            updateGroupPaymentStatus(group.vendor_id, "failed");
            onError(`Payment processing error for ${group.vendor_name}`);
          });
      },

      onClose: function () {
        onError(`Payment cancelled for ${group.vendor_name}`);
      },
    };

    // Use direct subaccount payment for vendor products (NOT for platform products)
    if (group.vendor_id && group.paystack_subaccount_code) {
      // Calculate platform charge (commission + service charge) in kobo
      const platformChargeKobo = calculatePlatformCharge(
        group.subtotal,
        group.subscription_plan,
        group.gift_plan,
        group.gift_commission_rate,
        group.gift_plan_expires_at
      );
      
      // Use direct subaccount instead of split groups
      paystackConfig.subaccount = group.paystack_subaccount_code;
      paystackConfig.transaction_charge = platformChargeKobo; // Platform gets this amount
      paystackConfig.bearer = "account"; // Main account (platform) pays Paystack fees
    }

    try {
      const handler = window.PaystackPop.setup(paystackConfig);
      handler.openIframe();
    } catch (err) {
      console.error("Paystack setup error:", err);
      onError("Failed to initialize payment");
    }
  };

  // Process all vendor payments sequentially
  const processAllPayments = async (shippingInfo: ShippingInfo): Promise<{ success: boolean; message: string }> => {
    if (vendorGroups.length === 0) {
      return { success: false, message: "No items to checkout" };
    }

    setProcessing(true);
    setCurrentPaymentIndex(0);

    return new Promise((resolve) => {
      let currentIndex = 0;
      let allSuccess = true;
      const failedVendors: string[] = [];

      const processNext = () => {
        if (currentIndex >= vendorGroups.length) {
          setProcessing(false);

          if (allSuccess) {
            clearCart();
            resolve({ success: true, message: "All payments completed successfully!" });
          } else {
            resolve({
              success: false,
              message: `Some payments failed: ${failedVendors.join(", ")}. Please retry failed orders.`,
            });
          }
          return;
        }

        const group = vendorGroups[currentIndex];
        setCurrentPaymentIndex(currentIndex);

        processVendorPayment(
          group,
          currentIndex,
          shippingInfo,
          () => {
            // Success - move to next vendor
            currentIndex++;
            setTimeout(processNext, 500); // Small delay between payments
          },
          (error) => {
            // Error/Cancel - mark as failed but continue with others
            allSuccess = false;
            failedVendors.push(group.vendor_name);
            updateGroupPaymentStatus(group.vendor_id, "failed");
            currentIndex++;
            setTimeout(processNext, 500);
          },
        );
      };

      processNext();
    });
  };

  // Retry failed payment for a specific vendor
  const retryPayment = (vendorId: string | null, shippingInfo: ShippingInfo): Promise<boolean> => {
    const group = vendorGroups.find((g) => g.vendor_id === vendorId);
    if (!group) return Promise.resolve(false);

    return new Promise((resolve) => {
      const index = vendorGroups.findIndex((g) => g.vendor_id === vendorId);

      processVendorPayment(
        group,
        index,
        shippingInfo,
        () => resolve(true),
        () => resolve(false),
      );
    });
  };

  // Check if all payments are complete
  const allPaymentsComplete = useMemo(() => {
    return vendorGroups.length > 0 && vendorGroups.every((g) => g.payment_status === "paid");
  }, [vendorGroups]);

  // Get failed vendor groups
  const failedGroups = useMemo(() => {
    return vendorGroups.filter((g) => g.payment_status === "failed");
  }, [vendorGroups]);

  // Get pending vendor groups
  const pendingGroups = useMemo(() => {
    return vendorGroups.filter((g) => g.payment_status === "pending");
  }, [vendorGroups]);

  // Recalculate shipping based on delivery method
  const recalculateWithDeliveryMethod = useCallback((deliveryMethod: "on_campus" | "2km_5km" | "over_5km") => {
    setVendorGroups((prev) =>
      prev.map((group) => {
        const shipping = calculateGroupShipping(group.items, deliveryMethod);
        const vat = group.subtotal * VAT_RATE;
        const groupTotal = group.subtotal + shipping + vat;

        return {
          ...group,
          shipping,
          vat,
          total: groupTotal,
        };
      }),
    );
  }, []);

  return {
    vendorGroups,
    grandTotals,
    loading,
    processing,
    currentPaymentIndex,
    sessionId,
    processAllPayments,
    retryPayment,
    allPaymentsComplete,
    failedGroups,
    pendingGroups,
    createVendorOrder, // For bank transfer
    updateGroupPaymentStatus,
    recalculateWithDeliveryMethod,
  };
};
