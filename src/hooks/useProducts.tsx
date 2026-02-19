import { useEffect } from 'react';
import { useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { logger } from '@/utils/logger';

export type Product = Tables<'products'> & {
  vendor_subscription_plan?: string;
  vendor_is_registered?: boolean;
};

/**
 * Helper function to enrich products with vendor and application data
 */
const enrichProducts = async (productsData: Tables<'products'>[]) => {
  if (!productsData || productsData.length === 0) return [];

  // Performance Optimization: Only fetch vendors referenced by the current products
  const vendorIds = [...new Set(productsData.map(p => p.vendor_id).filter(Boolean))];
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
  return productsData.map(product => {
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
    } as Product;
  });
};

/**
 * Sorts products by subscription tier
 */
const sortProductsByTier = (products: Product[]) => {
  return [...products].sort((a, b) => {
    const tierOrder: Record<string, number> = {
      'first_class': 0,
      'economy': 1,
      'free': 2
    };
    const aTier = tierOrder[a.vendor_subscription_plan || 'free'] ?? 2;
    const bTier = tierOrder[b.vendor_subscription_plan || 'free'] ?? 2;
    return aTier - bTier;
  });
};

/**
 * useProducts hook - Optimized with React Query for caching and deduplication.
 * This version supports optional limiting for better performance on initial load.
 */
export const useProducts = (limit?: number) => {
  const queryClient = useQueryClient();

  const { data: products = [], isLoading: loading, error, refetch } = useQuery({
    queryKey: limit ? ['products', { limit }] : ['products'],
    queryFn: async () => {
      try {
        let query = supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (limit) {
          query = query.limit(limit);
        }

        const { data: productsData, error: productsError } = await query;

        if (productsError) throw productsError;

        const enriched = await enrichProducts(productsData || []);
        return sortProductsByTier(enriched);
      } catch (err) {
        logger.error('Error fetching products:', err);
        throw err;
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => {
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

/**
 * useInfiniteProducts hook - For "Load More" functionality
 */
export const useInfiniteProducts = (options: {
  pageSize?: number;
  category?: string;
  searchTerm?: string;
  sortBy?: string;
} = {}) => {
  const { pageSize = 20, category, searchTerm, sortBy } = options;
  const queryClient = useQueryClient();

  return useInfiniteQuery({
    queryKey: ['products-infinite', options],
    queryFn: async ({ pageParam = 0 }) => {
      try {
        const from = pageParam * pageSize;
        const to = from + pageSize - 1;

        let query = supabase
          .from('products')
          .select('*', { count: 'exact' });

        if (category && category !== 'all') {
          query = query.eq('category', category);
        }

        if (searchTerm) {
          query = query.ilike('name', `%${searchTerm}%`);
        }

        // Apply sorting
        switch (sortBy) {
          case "price-low":
            query = query.order('price', { ascending: true });
            break;
          case "price-high":
            query = query.order('price', { ascending: false });
            break;
          case "rating":
            query = query.order('rating', { ascending: false });
            break;
          case "newest":
          default:
            query = query.order('created_at', { ascending: false });
            break;
        }

        const { data: productsData, error: productsError, count } = await query.range(from, to);

        if (productsError) throw productsError;

        const enriched = await enrichProducts(productsData || []);
        return {
          products: enriched,
          nextPage: (productsData?.length || 0) === pageSize ? pageParam + 1 : undefined,
          totalCount: count || 0
        };
      } catch (err) {
        logger.error('Error fetching infinite products:', err);
        throw err;
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 1000 * 60 * 5,
  });
};
