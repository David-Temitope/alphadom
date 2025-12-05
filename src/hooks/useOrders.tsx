
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tables } from '@/integrations/supabase/types';

type Order = Tables<'orders'>;
type OrderItem = Tables<'order_items'>;

export const useOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchOrders();
      
      // Set up real-time subscription for orders
      const channel = supabase
        .channel('orders-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
            filter: `user_id=eq.${user.id}`
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
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData: {
    total_amount: number;
    shipping_address: any;
    payment_method: string;
    items: Array<{
      product_id: string;
      quantity: number;
      price: number;
    }>;
  }) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Get vendor info from the first product (assuming single vendor orders)
      let vendorId = null;
      
      if (orderData.items.length > 0) {
        const { data: product } = await supabase
          .from('products')
          .select('vendor_id')
          .eq('id', orderData.items[0].product_id)
          .single();
        
        if (product) {
          vendorId = product.vendor_id;
        }
      }

      // Create the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: orderData.total_amount,
          shipping_address: orderData.shipping_address,
          payment_method: orderData.payment_method,
          status: 'pending',
          payment_status: 'pending',
          vendor_id: vendorId
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      return { order, error: null };
    } catch (err) {
      return { order: null, error: err };
    }
  };

  return { orders, loading, error, createOrder, refetch: fetchOrders };
};
