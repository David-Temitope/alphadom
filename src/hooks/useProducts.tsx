
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Product = Tables<'products'> & {
  vendor_subscription_plan?: string;
  vendor_is_registered?: boolean;
};

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();

    // Set up real-time subscription
    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        (payload) => {
          console.log('Product change received!', payload);
          fetchProducts(); // Refetch all products when any change occurs
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchProducts = async () => {
    try {
      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      // Fetch vendor subscription plans, gift plans, and registration status
      const { data: vendorsData } = await supabase
        .from('approved_vendors')
        .select('id, subscription_plan, application_id, gift_plan, gift_plan_expires_at');

      // Fetch shop applications for registration status using the safe view (bypasses RLS)
      const { data: applicationsData } = await supabase
        .from('shop_applications_safe')
        .select('id, is_registered');

      // Map vendor subscription plans and registration to products
      const productsWithSubscription = (productsData || []).map(product => {
        const vendor = vendorsData?.find(v => v.id === product.vendor_id);
        const application = applicationsData?.find(a => a.id === vendor?.application_id);
        
        // Check if vendor has active gift plan
        let effectiveSubscription = vendor?.subscription_plan || 'free';
        if (vendor?.gift_plan && vendor?.gift_plan_expires_at) {
          const expiresAt = new Date(vendor.gift_plan_expires_at);
          if (expiresAt > new Date()) {
            // Gift is still active, use gift plan for display
            effectiveSubscription = vendor.gift_plan;
          }
        }
        
        return {
          ...product,
          vendor_subscription_plan: effectiveSubscription,
          vendor_is_registered: application?.is_registered || false
        };
      });

      // Sort by subscription tier: first_class > economy > free
      const sortedProducts = productsWithSubscription.sort((a, b) => {
        const tierOrder: Record<string, number> = { 
          'first_class': 0, 
          'economy': 1, 
          'free': 2 
        };
        const aTier = tierOrder[a.vendor_subscription_plan || 'free'] ?? 2;
        const bTier = tierOrder[b.vendor_subscription_plan || 'free'] ?? 2;
        return aTier - bTier;
      });

      setProducts(sortedProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  return { 
    products, 
    loading, 
    error,
    refetch: fetchProducts,
    refreshProducts: fetchProducts
  };
};
