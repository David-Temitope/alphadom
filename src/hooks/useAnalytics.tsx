import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  activeUsers: number;
  conversionRate: number;
  salesData: Array<{ month: string; sales: number; orders: number }>;
  topProducts: Array<{ name: string; value: number; color: string }>;
}

export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalRevenue: 0,
    totalOrders: 0,
    activeUsers: 0,
    conversionRate: 0,
    salesData: [],
    topProducts: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();

    // Set up real-time subscriptions
    const ordersChannel = supabase
      .channel('analytics-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchAnalytics)
      .subscribe();

    const productsChannel = supabase
      .channel('analytics-products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, fetchAnalytics)
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(productsChannel);
    };
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch orders
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount, created_at, status');

      // Fetch order items with products
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('quantity, products(name)');

      // Fetch users
      const { data: profiles } = await supabase
        .from('profiles')
        .select('created_at');

      // Calculate metrics
      const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      const totalOrders = orders?.length || 0;
      const activeUsers = profiles?.length || 0;
      const completedOrders = orders?.filter(o => o.status === 'delivered').length || 0;
      const conversionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

      // Process sales data by month
      const salesByMonth = orders?.reduce((acc, order) => {
        const date = new Date(order.created_at);
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        if (!acc[month]) {
          acc[month] = { sales: 0, orders: 0 };
        }
        acc[month].sales += Number(order.total_amount);
        acc[month].orders += 1;
        return acc;
      }, {} as Record<string, { sales: number; orders: number }>);

      const salesData = Object.entries(salesByMonth || {}).map(([month, data]) => ({
        month,
        sales: data.sales,
        orders: data.orders,
      }));

      // Calculate top products
      const productCounts = orderItems?.reduce((acc, item) => {
        const name = (item as any).products?.name || 'Unknown';
        if (!acc[name]) {
          acc[name] = 0;
        }
        acc[name] += item.quantity;
        return acc;
      }, {} as Record<string, number>);

      const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];
      const topProducts = Object.entries(productCounts || {})
        .sort(([, a], [, b]) => b - a)
        .slice(0, 4)
        .map(([name, value], index) => ({
          name,
          value,
          color: colors[index] || '#8884d8',
        }));

      setAnalytics({
        totalRevenue,
        totalOrders,
        activeUsers,
        conversionRate,
        salesData,
        topProducts,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return { analytics, loading, refetch: fetchAnalytics };
};
