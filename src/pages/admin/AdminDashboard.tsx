import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  Loader2
} from 'lucide-react';
import { useAdminProducts } from '@/hooks/useAdminProducts';
import { useAdminOrders } from '@/hooks/useAdminOrders';
import { useUsers } from '@/hooks/useUsers';

const AdminDashboard = () => {
  const { products, loading: productsLoading } = useAdminProducts();
  const { orders, loading: ordersLoading } = useAdminOrders();
  const { users, loading: usersLoading } = useUsers();

  const loading = productsLoading || ordersLoading || usersLoading;

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);
  const completedOrders = orders.filter(order => order.status === 'completed').length;
  
  const stats = [
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toFixed(2)}`,
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
    },
    {
      title: 'Orders',
      value: orders.length.toString(),
      change: '+8.2%',
      trend: 'up',
      icon: ShoppingCart,
    },
    {
      title: 'Products',
      value: products.length.toString(),
      change: '+3.1%',
      trend: 'up',
      icon: Package,
    },
    {
      title: 'Customers',
      value: users.length.toString(),
      change: '+15.3%',
      trend: 'up',
      icon: Users,
    },
  ];

  // Generate category data from products
  const categoryStats = products.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(categoryStats).map(([name, value], index) => ({
    name,
    value,
    color: ['#22c55e', '#3b82f6', '#f97316', '#8b5cf6', '#ef4444'][index % 5]
  }));

  // Recent orders with profile data
  const recentOrders = orders.slice(0, 4).map(order => {
    const profile = order.profiles;
    return {
      id: `#${order.id.slice(0, 6)}`,
      customer: profile?.full_name || profile?.email || 'Unknown',
      total: `$${Number(order.total_amount).toFixed(2)}`,
      status: order.status
    };
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your Pilot store.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  {stat.trend === 'up' ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                    {stat.change}
                  </span>
                  from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status Distribution</CardTitle>
              <CardDescription>Current order status breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['pending', 'processing', 'shipped', 'completed', 'cancelled'].map(status => {
                  const count = orders.filter(order => order.status === status).length;
                  const percentage = orders.length > 0 ? (count / orders.length * 100).toFixed(1) : '0';
                  return (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={status === 'completed' ? 'default' : 'secondary'}>
                          {status}
                        </Badge>
                        <span className="text-sm">{count} orders</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{percentage}%</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Products by Category</CardTitle>
              <CardDescription>Product distribution across categories</CardDescription>
            </CardHeader>
            <CardContent>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No products available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest customer orders</CardDescription>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{order.id}</p>
                        <p className="text-sm text-muted-foreground">{order.customer}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-medium">{order.total}</p>
                      <Badge
                        variant={
                          order.status === 'completed'
                            ? 'default'
                            : order.status === 'processing'
                            ? 'secondary'
                            : order.status === 'shipped'
                            ? 'outline'
                            : 'destructive'
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No orders yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
