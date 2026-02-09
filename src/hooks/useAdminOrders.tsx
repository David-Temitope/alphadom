
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { logger } from '@/utils/logger';

type Order = Tables<'orders'> & {
  profiles?: {
    id: string;
    full_name: string | null;
    email: string;
  } | null;
  order_items?: Array<{
    id: string;
    quantity: number;
    price: number;
    products: {
      id: string;
      name: string;
      image: string | null;
    } | null;
  }>;
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
          logger.info('Order change received!', payload);
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
      logger.info('Fetching orders...');
      setLoading(true);
      setError(null);
      
      // Fetch orders with profiles and order items including products
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          profiles:orders_user_id_fkey (
            id,
            full_name,
            email
          ),
          order_items (
            id,
            quantity,
            price,
            products (
              id,
              name,
              image
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (ordersError) {
        logger.error('Error fetching orders:', ordersError);
        throw ordersError;
      }
      
      logger.info('Orders fetched successfully:', { count: ordersData?.length || 0 });
      
      setOrders(ordersData as any || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load orders';
      setError(errorMessage);
      logger.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      logger.info('Updating order status:', { orderId, status });
      
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;
      
      logger.info('Order status updated successfully');
      return { success: true, error: null };
    } catch (err) {
      logger.error('Error updating order status:', err);
      return { success: false, error: err };
    }
  };

  return { orders, loading, error, updateOrderStatus, refetch: fetchOrders };
};
