
import React, { useState, useEffect } from 'react';
import { useOrders } from '@/hooks/useOrders';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, ShoppingBag, Calendar, CreditCard, CheckCircle, MessageCircle } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const OrderSkeleton = () => (
  <Card>
    <CardHeader>
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const Orders = () => {
  const { user, loading: authLoading } = useAuth();
  const { orders, loading, error, refetch } = useOrders();
  const { toast } = useToast();
  const [markingReceived, setMarkingReceived] = useState<string | null>(null);
  const [vendorPhones, setVendorPhones] = useState<Record<string, string>>({});

  // Fetch vendor phone numbers for orders
  useEffect(() => {
    const fetchVendorPhones = async () => {
      if (!orders || orders.length === 0) return;
      
      const vendorIds = [...new Set(orders.map(o => o.vendor_id).filter(Boolean))];
      if (vendorIds.length === 0) return;
      
      const { data: vendorsData } = await supabase
        .from('approved_vendors')
        .select('id, application_id')
        .in('id', vendorIds);
      
      if (!vendorsData) return;
      
      const appIds = vendorsData.map(v => v.application_id).filter(Boolean);
      const { data: appsData } = await supabase
        .from('shop_applications')
        .select('id, contact_phone')
        .in('id', appIds);
      
      const phoneMap: Record<string, string> = {};
      vendorsData.forEach(vendor => {
        const app = appsData?.find(a => a.id === vendor.application_id);
        if (app?.contact_phone && vendor.id) {
          phoneMap[vendor.id] = app.contact_phone;
        }
      });
      
      setVendorPhones(phoneMap);
    };
    
    fetchVendorPhones();
  }, [orders]);

  // Redirect to auth if not logged in
  if (!authLoading && !user) {
    return <Navigate to="/auth" replace />;
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="space-y-6">
            <OrderSkeleton />
            <OrderSkeleton />
            <OrderSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading orders: {error}</p>
          <Button asChild>
            <Link to="/">Go Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleMarkReceived = async (orderId: string) => {
    setMarkingReceived(orderId);
    try {
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'completed' })
        .eq('id', orderId);

      if (updateError) throw updateError;

      toast({
        title: 'Order Marked as Received',
        description: 'Thank you for confirming receipt of your order!',
      });

      refetch();
    } catch (err) {
      console.error('Error marking order as received:', err);
      toast({
        title: 'Error',
        description: 'Failed to update order status. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setMarkingReceived(null);
    }
  };

  const handleWhatsAppChat = (vendorId: string | null, orderId: string) => {
    if (!vendorId || !vendorPhones[vendorId]) {
      toast({
        title: 'Contact Unavailable',
        description: 'Vendor contact information is not available.',
        variant: 'destructive',
      });
      return;
    }
    
    const phone = vendorPhones[vendorId].replace(/\D/g, '');
    const formattedPhone = phone.startsWith('0') ? `234${phone.slice(1)}` : phone;
    const message = encodeURIComponent(`Hi, I have a question about my order #${orderId.slice(0, 8)}`);
    window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'refunded':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const canMarkAsReceived = (order: any) => {
    return order.status === 'shipped' || order.status === 'processing';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Track your orders and view purchase history</p>
        </div>

        {orders.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-600 mb-6">
                Start shopping to see your orders here
              </p>
              <Button asChild>
                <Link to="/products">Browse Products</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(order.created_at!).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <CreditCard className="h-4 w-4" />
                          ₦{Number(order.total_amount).toLocaleString()}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                      <Badge className={getPaymentStatusColor(order.payment_status || 'pending')}>
                        {order.payment_status || 'pending'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Payment Method:</span>
                        <span className="font-medium">{order.payment_method || 'Not specified'}</span>
                      </div>
                      {order.shipping_address && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Shipping Address:</span>
                          <div className="text-right text-sm">
                            <p>{(order.shipping_address as any)?.street}</p>
                            <p>{(order.shipping_address as any)?.city}, {(order.shipping_address as any)?.state} {(order.shipping_address as any)?.zipCode}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* WhatsApp Chat Button */}
                    {order.vendor_id && vendorPhones[order.vendor_id] && (
                      <div className="pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleWhatsAppChat(order.vendor_id, order.id)}
                          className="text-green-600 border-green-600 hover:bg-green-50"
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Chat with Vendor
                        </Button>
                      </div>
                    )}

                    {/* Received Button - Show only for shipped/processing orders */}
                    {canMarkAsReceived(order) && (
                      <div className="pt-4 border-t">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="default" 
                              className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                              disabled={markingReceived === order.id}
                            >
                              {markingReceived === order.id ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <CheckCircle className="h-4 w-4 mr-2" />
                              )}
                              Mark as Received
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirm Order Received</AlertDialogTitle>
                              <AlertDialogDescription className="space-y-2">
                                <p>
                                  Are you sure you have received this order?
                                </p>
                                <p className="font-semibold text-destructive">
                                  Warning: Only click "Confirm" if you have physically received your order. 
                                  This action cannot be undone.
                                </p>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleMarkReceived(order.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Confirm Received
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}

                    {/* Show completed status */}
                    {order.status === 'completed' && (
                      <div className="pt-4 border-t">
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-5 w-5" />
                          <span className="font-medium">Order completed - Thank you!</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
