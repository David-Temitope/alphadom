import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { logger } from '@/utils/logger';

type Product = Tables<'products'> & {
  vendor_subscription_plan?: string;
  vendor_is_registered?: boolean;
};

/**
 * useProducts hook - Optimized with React Query for caching and deduplication.
 * This prevents redundant network requests when multiple components on the same page
 * (like FeaturedProducts, FlashSales, and TrendingCategories) call the same hook.
 */
export const useProducts = () => {
  const queryClient = useQueryClient();

  const { data: products = [], isLoading: loading, error, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      try {
        // Step 1: Fetch products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (productsError) throw productsError;

      // Performance Optimization: Only fetch vendors referenced by the current products
      const vendorIds = [...new Set((productsData || []).map(p => p.vendor_id).filter(Boolean))];
      const { data: vendorsData } = await supabase
        .from('approved_vendors')
        .select('id, subscription_plan, application_id, gift_plan, gift_plan_expires_at')
        .in('id', vendorIds as string[]);

      // Performance Optimization: Only fetch shop applications for relevant vendors
      const applicationIds = [...new Set((vendorsData || []).map(v => v.application_id).filter(Boolean))];
      const { data: applicationsData } = await supabase
        .from('shop_applications_safe')
        .select('id, is_registered')
        .in('id', applicationIds as string[]);

      // Create Maps for O(1) lookups instead of O(N) .find() calls
      const vendorMap = new Map((vendorsData || []).map(v => [v.id, v]));
      const applicationMap = new Map((applicationsData || []).map(a => [a.id, a]));

      // Map vendor subscription plans and registration to products
      const productsWithSubscription = (productsData || []).map(product => {
        const vendor = product.vendor_id ? vendorMap.get(product.vendor_id) : null;
        const application = vendor?.application_id ? applicationMap.get(vendor.application_id) : null;
        
        // Check if vendor has active gift plan
        let effectiveSubscription = vendor?.subscription_plan || 'free';
        if (vendor?.gift_plan && vendor?.gift_plan_expires_at) {
          if (new Date(vendor.gift_plan_expires_at) > new Date()) {
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
      return productsWithSubscription.sort((a, b) => {
        const tierOrder: Record<string, number> = { 
          'first_class': 0, 
          'economy': 1, 
          'free': 2 
        };
        const aTier = tierOrder[a.vendor_subscription_plan || 'free'] ?? 2;
        const bTier = tierOrder[b.vendor_subscription_plan || 'free'] ?? 2;
        return aTier - bTier;
      });
    } catch (err) {
        logger.error('Error fetching products:', err);
        throw err;
      }
    },
    // Cache products for 5 minutes by default
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    // Set up real-time subscription - shared across all hook instances
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
          logger.info('Product change received!', payload);
          // Invalidate React Query cache to trigger background refetch
          queryClient.invalidateQueries({ queryKey: ['products'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { 
    products, 
    loading, 
    error: error instanceof Error ? error.message : (error ? String(error) : null),
    refetch,
    refreshProducts: refetch
  };
};
