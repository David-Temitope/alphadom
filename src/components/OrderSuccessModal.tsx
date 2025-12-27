import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, Shield, AlertTriangle } from 'lucide-react';

interface OrderSuccessModalProps {
  open: boolean;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md text-center">
        <DialogHeader className="items-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <DialogTitle className="text-2xl font-bold text-green-600">
            Order Placed Successfully!
          </DialogTitle>
        </DialogHeader>
        
        <DialogDescription asChild>
          <div className="space-y-4 py-4">
            <p className="text-muted-foreground">
              Your order has been received and is being processed.
            </p>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-800 mb-1">Safety Reminder</h4>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• <strong>Always meet in public places</strong> for pickups</li>
                    <li>• Verify the product before completing payment</li>
                    <li>• Don't share personal financial details</li>
                    <li>• Report any suspicious activity immediately</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>Shop safely with Alphadom</span>
            </div>
          </div>
        </DialogDescription>

        <Button onClick={onClose} className="w-full">
          Got it, thanks!
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default OrderSuccessModal;
