import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useVendors } from '@/hooks/useVendors';
import { useToast } from '@/hooks/use-toast';
import { Truck, CheckCircle, Clock, Package, User, Mail, Phone, MapPin, AlertCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  status: string;
  payment_method: string;
  payment_status: string;
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
      vendor_id: string | null;
    };
  }>;
  profiles: {
    full_name: string;
    email: string;
  } | null;
}

// Get commission rate based on subscription plan
const getCommissionRate = (subscriptionPlan: string | undefined): number => {
  switch (subscriptionPlan) {
    case 'first_class': return 5;
    case 'economy': return 9;
    case 'free':
    default: return 15;
  }
};

interface OrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, status: string) => void;
  showActions: boolean;
  subscriptionPlan: string;
  vendorId: string;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onUpdateStatus, showActions, subscriptionPlan, vendorId }) => {
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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter items to only show this vendor's products
  const vendorItems = order.order_items.filter(
    item => item.products?.vendor_id === vendorId
  );

  // Calculate commission based on subscription plan
  const commissionRate = getCommissionRate(subscriptionPlan);
  
  // Calculate vendor's order value (only their products)
  const vendorSubtotal = vendorItems.reduce(
    (sum, item) => sum + (item.price * item.quantity), 0
  );
  const vendorShipping = order.shipping_cost || 0;
  const vendorVat = vendorSubtotal * 0.025; // 2.5% VAT
  const vendorOrderTotal = vendorSubtotal + vendorShipping + vendorVat;
  
  // Commission on subtotal only (not shipping or VAT)
  const commission = vendorSubtotal * (commissionRate / 100);
  const vendorPayout = vendorOrderTotal - commission;

  if (vendorItems.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start flex-wrap gap-2">
          <div>
            <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
            <CardDescription>
              {new Date(order.created_at).toLocaleString()}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge className={getStatusColor(order.status)}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
            <Badge className={getPaymentStatusColor(order.payment_status || 'pending')}>
              {(order.payment_status || 'pending').charAt(0).toUpperCase() + (order.payment_status || 'pending').slice(1)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Customer Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Customer Information
            </h4>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <span className="font-medium">Name:</span>
                {order.profiles?.full_name || 'N/A'}
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-3 w-3" />
                <span className="font-medium">Email:</span>
                {order.profiles?.email || 'N/A'}
              </p>
            </div>
          </div>
          
          {order.shipping_address && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Shipping Address
              </h4>
              <div className="text-sm space-y-1">
                <p>{order.shipping_address.street}</p>
                <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zipCode}</p>
                <p>{order.shipping_address.country}</p>
                {order.shipping_address.phone && (
                  <p className="flex items-center gap-2 mt-2">
                    <Phone className="h-3 w-3" />
                    <span className="font-medium">Phone:</span>
                    {order.shipping_address.phone}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Products Ordered - Only this vendor's products */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Package className="h-4 w-4" />
            Your Products in This Order
          </h4>
          <div className="space-y-3">
            {vendorItems.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                <img 
                  src={item.products?.image} 
                  alt={item.products?.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="font-medium">{item.products?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Quantity: {item.quantity} × ₦{item.price.toLocaleString()} = ₦{(item.quantity * item.price).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Order Summary - Vendor's portion only */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-3">Your Order Value</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Products Subtotal:</span>
                <span>₦{vendorSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee:</span>
                <span>₦{vendorShipping.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>VAT (2.5%):</span>
                <span>₦{vendorVat.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Order Total:</span>
                <span>₦{vendorOrderTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Payment Information</h4>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Method:</span> {order.payment_method?.replace('_', ' ')}</p>
              <p><span className="font-medium">Status:</span> {order.payment_status || 'pending'}</p>
            </div>
          </div>
        </div>

        {/* Commission Notice - Based on subscription plan */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-amber-800">
                Platform Commission Notice ({subscriptionPlan} Plan - {commissionRate}%)
              </p>
              <p className="text-amber-700 mt-1">
                Commission: ₦{commission.toLocaleString()} ({commissionRate}% of ₦{vendorSubtotal.toLocaleString()})
              </p>
              <p className="text-amber-700 font-medium mt-1">
                Your Payout: ₦{vendorPayout.toLocaleString()}
              </p>
              <p className="text-amber-600 text-xs mt-2">
                Payment will be sent within 24 hours after delivery confirmation on Discord.
              </p>
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
              className="w-40 h-40 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => window.open(order.receipt_image, '_blank')}
            />
          </div>
        )}

        {/* Action Buttons */}
        {showActions && (
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            {order.status === 'pending' && (
              <Button 
                onClick={() => onUpdateStatus(order.id, 'processing')}
                size="sm"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve Order
              </Button>
            )}
            {order.status === 'processing' && (
              <Button 
                onClick={() => onUpdateStatus(order.id, 'shipped')}
                size="sm"
              >
                <Truck className="h-4 w-4 mr-2" />
                Self Deliver
              </Button>
            )}
            {order.status === 'pending' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onUpdateStatus(order.id, 'shipped')}
              >
                <Truck className="h-4 w-4 mr-2" />
                Self Deliver
              </Button>
            )}
            <Button variant="outline" size="sm" disabled>
              <Truck className="h-4 w-4 mr-2" />
              Hire Dispatcher (Coming Soon)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

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
      // Fetch orders where vendor_id matches this vendor
      const { data: orderData, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              name,
              image,
              vendor_id
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
      const updateData: any = { 
        status,
        updated_at: new Date().toISOString()
      };
      
      if (status === 'shipped') {
        updateData.self_delivery = true;
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select();

      if (error) throw error;

      toast({
        title: "Success",
        description: `Order status updated to ${status}`,
      });

      await fetchVendorOrders();
    } catch (error: any) {
      console.error('Error updating order:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update order",
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

  // Calculate commission based on subscription plan
  const commissionRate = getCommissionRate(currentVendor.subscription_plan);

  const pendingOrders = orders.filter(order => order.status === 'pending');
  const processingOrders = orders.filter(order => ['approved', 'processing'].includes(order.status));
  const completedOrders = orders.filter(order => ['shipped', 'delivered'].includes(order.status));

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Vendor Orders</h1>
          <p className="text-muted-foreground">
            Manage orders for your products • Commission Rate: {commissionRate}% ({currentVendor.subscription_plan || 'free'} plan)
          </p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-2 md:gap-4">
            <Card>
              <CardHeader className="p-3 md:p-6">
                <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-1 md:gap-2">
                  <Clock className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden md:inline">Pending</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
                <div className="text-xl md:text-2xl font-bold">{pendingOrders.length}</div>
                <p className="text-xs text-muted-foreground md:hidden">Pending</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="p-3 md:p-6">
                <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-1 md:gap-2">
                  <Package className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden md:inline">Processing</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
                <div className="text-xl md:text-2xl font-bold">{processingOrders.length}</div>
                <p className="text-xs text-muted-foreground md:hidden">Processing</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="p-3 md:p-6">
                <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-1 md:gap-2">
                  <CheckCircle className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden md:inline">Completed</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
                <div className="text-xl md:text-2xl font-bold">{completedOrders.length}</div>
                <p className="text-xs text-muted-foreground md:hidden">Completed</p>
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
                  showActions={order.status === 'pending' || order.status === 'processing'}
                  subscriptionPlan={currentVendor.subscription_plan || 'free'}
                  vendorId={currentVendor.id}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorOrders;