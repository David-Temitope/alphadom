
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Product = Tables<'products'> & {
  vendor_subscription_plan?: string;
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

      // Fetch vendor subscription plans
      const { data: vendorsData } = await supabase
        .from('approved_vendors')
        .select('id, subscription_plan');

      // Map vendor subscription plans to products
      const productsWithSubscription = (productsData || []).map(product => {
        const vendor = vendorsData?.find(v => v.id === product.vendor_id);
        return {
          ...product,
          vendor_subscription_plan: vendor?.subscription_plan || 'free'
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
