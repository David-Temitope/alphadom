
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Order = Tables<'orders'> & {
  profiles?: {
    full_name: string | null;
    email: string;
  } | null;
};

export const useAdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
    
    // Set up real-time subscription for orders
    const channel = supabase
      .channel('admin-orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('Order change received!', payload);
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      console.log('Fetching orders...');
      setLoading(true);
      setError(null);
      
      // First fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Error fetching orders:', ordersError.message, ordersError);
        throw ordersError;
      }
      
      console.log('Orders fetched successfully:', ordersData?.length || 0, 'orders');
      
      // Then fetch all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email');
        
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError.message);
        // Continue without profiles data
      }
      
      // Manually join the data
      const typedOrders: Order[] = (ordersData || []).map(order => {
        const profile = profilesData?.find(p => p.id === order.user_id);
        return {
          ...order,
          profiles: profile ? {
            full_name: profile.full_name,
            email: profile.email
          } : null
        };
      });
      
      setOrders(typedOrders);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load orders';
      setError(errorMessage);
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      console.log('Updating order status:', orderId, status);
      
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;
      
      console.log('Order status updated successfully');
      return { success: true, error: null };
    } catch (err) {
      console.error('Error updating order status:', err);
      return { success: false, error: err };
    }
  };

  return { orders, loading, error, updateOrderStatus, refetch: fetchOrders };
};
