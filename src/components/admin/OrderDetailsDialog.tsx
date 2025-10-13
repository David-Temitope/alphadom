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
import { MapPin, Phone, Package } from 'lucide-react';

interface OrderDetailsDialogProps {
  order: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const OrderDetailsDialog: React.FC<OrderDetailsDialogProps> = ({
  order,
  open,
  onOpenChange,
}) => {
  if (!order) return null;

  const shippingAddress = order.shipping_address || {};
  const customerName = order.profiles?.full_name || 'N/A';
  const customerEmail = order.profiles?.email || 'N/A';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription>
            Order ID: {order.id.substring(0, 8)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Information */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Customer Information
            </h3>
            <div className="space-y-2 bg-muted p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{customerEmail}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Shipping Address
            </h3>
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p className="font-medium">{shippingAddress.street || 'N/A'}</p>
              <p className="text-sm text-muted-foreground">
                {shippingAddress.city || 'N/A'}, {shippingAddress.state || 'N/A'}{' '}
                {shippingAddress.zipCode || ''}
              </p>
              <p className="text-sm text-muted-foreground">
                {shippingAddress.country || 'US'}
              </p>
              {shippingAddress.phone && (
                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{shippingAddress.phone}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Order Summary */}
          <div>
            <h3 className="font-semibold mb-3">Order Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">${(order.subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">
                  {(order.shipping_cost || 0) === 0
                    ? 'FREE'
                    : `$${(order.shipping_cost || 0).toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-medium">${(order.tax_amount || 0).toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${(order.total_amount || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Order Status */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Order Status</p>
              <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                {order.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Payment Status</p>
              <Badge variant={order.payment_status === 'paid' ? 'default' : 'secondary'}>
                {order.payment_status}
              </Badge>
            </div>
          </div>

          {/* Payment Method */}
          {order.payment_method && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Payment Method</p>
              <p className="font-medium capitalize">{order.payment_method.replace('_', ' ')}</p>
            </div>
          )}

          {/* Order Date */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">Order Date</p>
            <p className="font-medium">
              {new Date(order.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
