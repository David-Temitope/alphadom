import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useVendors } from '@/hooks/useVendors';
import { useToast } from '@/hooks/use-toast';
import { Truck, Eye, CheckCircle, Clock, Package } from 'lucide-react';

interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  payment_method: string;
  receipt_image?: string;
  shipping_address: any;
  created_at: string;
  order_items: Array<{
    id: string;
    product_id: string;
    quantity: number;
    price: number;
    products: {
      name: string;
      image: string;
    };
  }>;
  profiles: {
    full_name: string;
    email: string;
  } | null;
}

const VendorOrders = () => {
  const { user } = useAuth();
  const { currentVendor } = useVendors();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && currentVendor) {
      fetchVendorOrders();
    }
  }, [user, currentVendor]);

  const fetchVendorOrders = async () => {
    if (!currentVendor || !user) return;

    try {
      // First, get all orders
      const { data: allOrders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('vendor_id', currentVendor.id);

      if (ordersError) throw ordersError;

      // For each order, fetch related data
      const ordersWithDetails = await Promise.all(
        (allOrders || []).map(async (order) => {
          // Fetch order items with products
          const { data: items, error: itemsError } = await supabase
            .from('order_items')
            .select(`
              *,
              products (
                name,
                image
              )
            `)
            .eq('order_id', order.id);

          if (itemsError) console.error('Items error:', itemsError);

          // Fetch profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', order.user_id)
            .maybeSingle();

          if (profileError) console.error('Profile error:', profileError);

          return {
            ...order,
            order_items: items || [],
            profiles: profile
          };
        })
      );

      setOrders(ordersWithDetails as any);
    } catch (error) {
      console.error('Error fetching vendor orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Order ${status === 'approved' ? 'approved' : 'updated'} successfully`,
      });

      fetchVendorOrders();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user || !currentVendor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              {!user ? 'Please sign in to access vendor orders.' : 'Vendor access required.'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pendingOrders = orders.filter(order => order.status === 'pending');
  const processingOrders = orders.filter(order => ['approved', 'processing'].includes(order.status));
  const completedOrders = orders.filter(order => ['shipped', 'delivered'].includes(order.status));

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Vendor Orders</h1>
          <p className="text-muted-foreground">Manage orders for your products</p>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending ({pendingOrders.length})
            </TabsTrigger>
            <TabsTrigger value="processing" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Processing ({processingOrders.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Completed ({completedOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingOrders.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No pending orders</p>
                </CardContent>
              </Card>
            ) : (
              pendingOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onUpdateStatus={updateOrderStatus}
                  showActions={true}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="processing" className="space-y-4">
            {processingOrders.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No processing orders</p>
                </CardContent>
              </Card>
            ) : (
              processingOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onUpdateStatus={updateOrderStatus}
                  showActions={order.status === 'approved'}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedOrders.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No completed orders</p>
                </CardContent>
              </Card>
            ) : (
              completedOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onUpdateStatus={updateOrderStatus}
                  showActions={false}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

interface OrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, status: string) => void;
  showActions: boolean;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onUpdateStatus, showActions }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
            <CardDescription>
              Customer: {order.profiles?.full_name || order.profiles?.email}
            </CardDescription>
          </div>
          <Badge className={getStatusColor(order.status)}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2">Order Details</h4>
            <p className="text-sm text-muted-foreground">Total: ${order.total_amount}</p>
            <p className="text-sm text-muted-foreground">Date: {new Date(order.created_at).toLocaleDateString()}</p>
            <p className="text-sm text-muted-foreground">Payment: {order.payment_method.replace('_', ' ')}</p>
          </div>
          
          {order.receipt_image && (
            <div>
              <h4 className="font-semibold mb-2">Payment Receipt</h4>
              <img 
                src={order.receipt_image} 
                alt="Payment receipt" 
                className="w-32 h-32 object-cover rounded border cursor-pointer"
                onClick={() => window.open(order.receipt_image, '_blank')}
              />
            </div>
          )}
        </div>

        <div>
          <h4 className="font-semibold mb-2">Products</h4>
          <div className="space-y-2">
            {order.order_items?.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-2 bg-muted rounded">
                <img 
                  src={item.products?.image} 
                  alt={item.products?.name}
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="font-medium">{item.products?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Qty: {item.quantity} × ${item.price} = ${(item.quantity * item.price).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {order.shipping_address && (
          <div>
            <h4 className="font-semibold mb-2">Shipping Address</h4>
            <p className="text-sm text-muted-foreground">
              {order.shipping_address.street}, {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zipCode}
            </p>
          </div>
        )}

        {showActions && (
          <div className="flex gap-2 pt-4 border-t">
            {order.status === 'pending' && (
              <Button 
                onClick={() => onUpdateStatus(order.id, 'approved')}
                size="sm"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve Order
              </Button>
            )}
            {order.status === 'approved' && (
              <Button 
                onClick={() => onUpdateStatus(order.id, 'processing')}
                size="sm"
              >
                <Package className="h-4 w-4 mr-2" />
                Start Processing
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                // Toggle self delivery
                supabase
                  .from('orders')
                  .update({ self_delivery: true })
                  .eq('id', order.id)
                  .then(() => {
                    onUpdateStatus(order.id, 'processing');
                  });
              }}
            >
              Self Deliver
            </Button>
            <Button variant="outline" size="sm">
              <Truck className="h-4 w-4 mr-2" />
              Hire Dispatcher
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VendorOrders;