import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Phone, User, Mail, Calendar, DollarSign } from 'lucide-react';

interface OrderDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: any;
}

export const OrderDetailsDialog: React.FC<OrderDetailsDialogProps> = ({
  open,
  onOpenChange,
  order,
}) => {
  if (!order) return null;

  const profile = order.profiles;
  const shippingAddress = order.shipping_address || {};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription>
            Order #{order.id.slice(0, 8)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Information */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Customer Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Name:</span>
                <span>{profile?.full_name || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Email:</span>
                <span>{profile?.email || 'N/A'}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Shipping Address */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Shipping Address
            </h3>
            <div className="space-y-2 text-sm bg-muted p-4 rounded-lg">
              <p>{shippingAddress.street || 'N/A'}</p>
              <p>
                {shippingAddress.city || 'N/A'}, {shippingAddress.state || 'N/A'}{' '}
                {shippingAddress.zipCode || ''}
              </p>
              <p>{shippingAddress.country || 'US'}</p>
              {shippingAddress.phone && (
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Phone:</span>
                  <span>{shippingAddress.phone}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Products Ordered */}
          {order.order_items && order.order_items.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Products Ordered</h3>
              <div className="space-y-3">
                {order.order_items.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    {item.products?.image && (
                      <img 
                        src={item.products.image} 
                        alt={item.products.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">{item.products?.name || 'Unknown Product'}</p>
                      <p className="text-sm text-slate-600">
                        Quantity: {item.quantity} × ${Number(item.price).toFixed(2)} = ${(item.quantity * Number(item.price)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Order Summary */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Order Summary
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${Number(order.subtotal || order.total_amount).toFixed(2)}</span>
              </div>
              {order.shipping_cost !== undefined && (
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>${Number(order.shipping_cost).toFixed(2)}</span>
                </div>
              )}
              {order.tax_amount !== undefined && (
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>${Number(order.tax_amount).toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-base">
                <span>Total:</span>
                <span>${Number(order.total_amount).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Order Status */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Order Status
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">Status:</span>
                <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                  {order.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Payment:</span>
                <Badge variant={order.payment_status === 'paid' ? 'default' : 'secondary'}>
                  {order.payment_status || 'pending'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Payment Method:</span>
                <span>{order.payment_method || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Order Date:</span>
                <span>{new Date(order.created_at).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {order.receipt_image && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3">Payment Receipt</h3>
                <img
                  src={order.receipt_image}
                  alt="Payment receipt"
                  className="max-w-full rounded-lg border"
                />
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
