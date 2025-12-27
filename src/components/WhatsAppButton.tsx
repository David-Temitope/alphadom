import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  phoneNumber: string;
  vendorName?: string;
  productName?: string;
  variant?: 'product' | 'vendor';
  className?: string;
}

// Format phone number for WhatsApp API
const formatPhoneForWhatsApp = (phone: string): string => {
  // Remove all non-numeric characters
  let cleaned = phone.replace(/\D/g, '');
  
  // Handle Nigerian numbers
  if (cleaned.startsWith('0')) {
    cleaned = '234' + cleaned.slice(1);
  } else if (!cleaned.startsWith('234') && cleaned.length === 10) {
    cleaned = '234' + cleaned;
  }
  
  return cleaned;
};

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  phoneNumber,
  vendorName,
  productName,
  variant = 'vendor',
  className = ''
}) => {
  if (!phoneNumber || phoneNumber.trim() === '') return null;

  const formattedPhone = formatPhoneForWhatsApp(phoneNumber);
  
  // Build WhatsApp URL with pre-filled message
  let message = '';
  if (variant === 'product' && vendorName && productName) {
    message = encodeURIComponent(
      `Hi ${vendorName}, I saw your ${productName} on Alphadom and I'd like to ask a few questions.`
    );
  }

  const whatsappUrl = message 
    ? `https://wa.me/${formattedPhone}?text=${message}`
    : `https://wa.me/${formattedPhone}`;

  return (
    <Button
      onClick={() => window.open(whatsappUrl, '_blank')}
      className={`bg-[#25D366] hover:bg-[#128C7E] text-white ${className}`}
    >
      <MessageCircle className="w-5 h-5 mr-2" />
      {variant === 'product' ? 'Chat with Seller' : 'Message on WhatsApp'}
    </Button>
  );
};

export default WhatsAppButton;
