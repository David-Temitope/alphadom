import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useVendors } from '@/hooks/useVendors';
import { useToast } from '@/hooks/use-toast';
import { Truck, CheckCircle, Clock, Package, Users } from 'lucide-react';

interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  subtotal?: number;
  shipping_cost?: number;
  tax_amount?: number;
  status: string;
  payment_status?: string;
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
    avatar_url?: string;
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
    if (!currentVendor) return;

    try {
      // Get all orders for this vendor
      const { data: orderData, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              name,
              image
            )
          ),
          profiles:orders_user_id_fkey (
            full_name,
            email
          )
        `)
        .eq('vendor_id', currentVendor.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders(orderData as any || []);
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

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Pending Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingOrders.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Processing Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{processingOrders.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Completed Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedOrders.length}</div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">All Orders</h2>
            
            {loading ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">Loading orders...</p>
                </CardContent>
              </Card>
            ) : orders.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No orders found</p>
                </CardContent>
              </Card>
            ) : (
              orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onUpdateStatus={updateOrderStatus}
                  showActions={order.status === 'pending' || order.status === 'approved'}
                />
              ))
            )}
          </div>
        </div>
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
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">Order #{order.id.slice(0, 8)}</CardTitle>
            <CardDescription className="space-y-1">
              <div className="flex items-center gap-2">
                {order.profiles?.avatar_url && (
                  <img src={order.profiles.avatar_url} alt="" className="w-6 h-6 rounded-full" />
                )}
                <span>Customer: {order.profiles?.full_name || order.profiles?.email}</span>
              </div>
            </CardDescription>
          </div>
          <Badge className={getStatusColor(order.status)}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Customer Information */}
        <div className="border-b pb-4">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Customer Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Name: </span>
              <span className="font-medium">{order.profiles?.full_name || 'N/A'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Email: </span>
              <span className="font-medium">{order.profiles?.email}</span>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        {order.shipping_address && (
          <div className="border-b pb-4">
            <h4 className="font-semibold mb-3">Shipping Address</h4>
            <div className="text-sm space-y-1">
              <p>{order.shipping_address.street}</p>
              <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zipCode}</p>
              {order.shipping_address.phone && (
                <p className="text-muted-foreground">Phone: {order.shipping_address.phone}</p>
              )}
            </div>
          </div>
        )}

        {/* Products Ordered */}
        <div className="border-b pb-4">
          <h4 className="font-semibold mb-3">Products Ordered</h4>
          <div className="space-y-3">
            {order.order_items?.map((item) => (
              <div key={item.id} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <img 
                  src={item.products?.image} 
                  alt={item.products?.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.products?.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Quantity: {item.quantity} × ₦{Number(item.price).toLocaleString()} = ₦{(item.quantity * Number(item.price)).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="border-b pb-4">
          <h4 className="font-semibold mb-3">Order Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal:</span>
              <span>₦{Number(order.subtotal || order.total_amount).toLocaleString()}</span>
            </div>
            {order.shipping_cost !== undefined && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping:</span>
                <span>₦{Number(order.shipping_cost).toLocaleString()}</span>
              </div>
            )}
            {order.tax_amount !== undefined && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax:</span>
                <span>₦{Number(order.tax_amount).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base pt-2 border-t">
              <span>Total:</span>
              <span>₦{Number(order.total_amount).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Order Status */}
        <div className="border-b pb-4">
          <h4 className="font-semibold mb-3">Order Status</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Status: </span>
              <Badge className={getStatusColor(order.status)}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>
            <div>
              <span className="text-muted-foreground">Payment Status: </span>
              <Badge variant={order.payment_status === 'paid' ? 'default' : 'outline'}>
                {order.payment_status || 'Pending'}
              </Badge>
            </div>
            <div>
              <span className="text-muted-foreground">Payment Method: </span>
              <span className="font-medium">{order.payment_method.replace('_', ' ')}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Order Date: </span>
              <span className="font-medium">{new Date(order.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Payment Receipt */}
        {order.receipt_image && (
          <div>
            <h4 className="font-semibold mb-3">Payment Receipt</h4>
            <img 
              src={order.receipt_image} 
              alt="Payment receipt" 
              className="max-w-xs h-auto object-contain rounded border cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(order.receipt_image, '_blank')}
            />
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