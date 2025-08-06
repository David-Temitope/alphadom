import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface StockAlert {
  id: string;
  product_id: string;
  alert_type: 'low_stock' | 'out_of_stock';
  is_read: boolean;
  created_at: string;
  products?: {
    name: string;
    stock_count: number;
    initial_stock_count: number;
  };
}

export const useStockAlerts = () => {
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchAlerts();
      setupRealtimeSubscription();
    }
  }, [user]);

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_stock_alerts')
        .select(`
          *,
          products (
            name,
            stock_count,
            initial_stock_count
          )
        `)
        .eq('is_read', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts((data as StockAlert[]) || []);
    } catch (error) {
      console.error('Error fetching stock alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('stock-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_stock_alerts'
        },
        () => {
          fetchAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('admin_stock_alerts')
        .update({ is_read: true })
        .eq('id', alertId);

      if (error) throw error;
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('admin_stock_alerts')
        .update({ is_read: true })
        .eq('is_read', false);

      if (error) throw error;
      setAlerts([]);
    } catch (error) {
      console.error('Error marking all alerts as read:', error);
    }
  };

  const unreadCount = alerts.length;

  return {
    alerts,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refetch: fetchAlerts
  };
};