import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAboutStats = () => {
  const [stats, setStats] = useState({
    productsOnSell: 0,
    users: 0,
    workers: 0,
    happyCustomers: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      // Get total products listed on the platform
      const { data: products } = await supabase
        .from('products')
        .select('id');

      // Get total users
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id');

      // Get total workers (vendors + dispatchers)
      const { data: vendors } = await supabase
        .from('approved_vendors')
        .select('id')
        .eq('is_active', true);

      const { data: dispatchers } = await supabase
        .from('approved_dispatchers')
        .select('id')
        .eq('is_active', true);

      // Get happy customers (users who liked, commented, or wishlisted)
      const { data: likes } = await supabase
        .from('product_likes')
        .select('user_id');

      const { data: comments } = await supabase
        .from('product_comments')
        .select('user_id');

      const { data: wishlist } = await supabase
        .from('wishlist')
        .select('user_id');

      const uniqueHappyCustomers = new Set([
        ...(likes?.map(l => l.user_id) || []),
        ...(comments?.map(c => c.user_id) || []),
        ...(wishlist?.map(w => w.user_id) || []),
      ]);

      setStats({
        productsOnSell: products?.length || 0,
        users: profiles?.length || 0,
        workers: (vendors?.length || 0) + (dispatchers?.length || 0),
        happyCustomers: uniqueHappyCustomers.size,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Subscribe to real-time changes
    const ordersChannel = supabase
      .channel('orders-stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchStats)
      .subscribe();

    const profilesChannel = supabase
      .channel('profiles-stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchStats)
      .subscribe();

    const vendorsChannel = supabase
      .channel('vendors-stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'approved_vendors' }, fetchStats)
      .subscribe();

    const dispatchersChannel = supabase
      .channel('dispatchers-stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'approved_dispatchers' }, fetchStats)
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(vendorsChannel);
      supabase.removeChannel(dispatchersChannel);
    };
  }, []);

  return { stats, loading, refetch: fetchStats };
};
