import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface VendorStats {
  activeVendors: number;
  totalProducts: number;
  avgVendorRating: number;
}

export const useVendorStats = () => {
  const [stats, setStats] = useState<VendorStats>({
    activeVendors: 0,
    totalProducts: 0,
    avgVendorRating: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Count active vendors
        const { count: vendorCount } = await supabase
          .from('approved_vendors')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true)
          .eq('is_suspended', false);

        // Count products from active vendors
        const { count: productCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .not('vendor_id', 'is', null);

        // Calculate average vendor rating from product_ratings
        const { data: ratings } = await supabase
          .from('product_ratings')
          .select('stars');

        let avgRating = 0;
        if (ratings && ratings.length > 0) {
          avgRating = ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length;
        }

        setStats({
          activeVendors: vendorCount || 0,
          totalProducts: productCount || 0,
          avgVendorRating: avgRating,
        });
      } catch (error) {
        console.error('Error fetching vendor stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading };
};
