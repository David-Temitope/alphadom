import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useShopApplications } from '@/hooks/useShopApplications';
import { useUserTypes } from '@/hooks/useUserTypes';
import { Checkbox } from '@/components/ui/checkbox';
import { Store, CreditCard, Loader2 } from 'lucide-react';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';

const shopApplicationSchema = z.object({
  store_name: z.string().trim().min(1, 'Store name is required').max(100, 'Store name too long'),
  product_category: z.string().min(1, 'Category is required'),
  price_range_min: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, 'Min price must be 0 or more'),
  price_range_max: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Max price must be positive'),
  email: z.string().email('Invalid email address').max(255, 'Email too long'),
  contact_phone: z.string().max(20, 'Phone too long').optional(),
  business_address: z.string().max(500, 'Address too long').optional(),
  business_description: z.string().max(2000, 'Description too long').optional(),
  bank_details: z.object({
    bank_name: z.string().trim().min(1, 'Bank name is required').max(100, 'Bank name too long'),
    account_name: z.string().trim().min(1, 'Account name is required').max(100, 'Account name too long'),
    account_number: z.string().trim().min(5, 'Invalid account number').max(30, 'Account number too long'),
    routing_number: z.string().trim().min(4, 'Invalid routing number').max(20, 'Routing number too long'),
  })
});

interface ShopApplicationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ShopApplicationForm = ({ open, onOpenChange }: ShopApplicationFormProps) => {
  const { submitApplication } = useShopApplications();
  const { addUserType } = useUserTypes();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [formData, setFormData] = useState({
    store_name: '',
    product_category: '',
    price_range_min: '',
    price_range_max: '',
    email: '',
    business_description: '',
    contact_phone: '',
    business_address: '',
    bank_details: {
      bank_name: '',
      account_number: '',
      account_name: '',
      routing_number: ''
    }
  });

  const categories = [
    'Electronics', 'Clothing & Fashion', 'Home & Garden', 'Sports & Outdoors',
    'Books & Media', 'Toys & Games', 'Health & Beauty', 'Automotive',
    'Food & Beverages', 'Arts & Crafts', 'Jewelry & Accessories', 'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      toast({
        title: "Error",
        description: "Please agree to the terms and conditions",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);

    try {
      // Validate input with zod
      const validation = shopApplicationSchema.safeParse(formData);
      
      if (!validation.success) {
        toast({
          title: "Validation Error",
          description: validation.error.errors[0].message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const applicationData = {
        ...formData,
        price_range_min: parseFloat(formData.price_range_min),
        price_range_max: parseFloat(formData.price_range_max),
      };

      const result = await submitApplication(applicationData);
      
      if (result?.error === null) {
        await addUserType('vendor');
        setAgreedToTerms(false);
        onOpenChange(false);
        setFormData({
          store_name: '',
          product_category: '',
          price_range_min: '',
          price_range_max: '',
          email: '',
          business_description: '',
          contact_phone: '',
          business_address: '',
          bank_details: {
            bank_name: '',
            account_number: '',
            account_name: '',
            routing_number: ''
          }
        });
      }
    } catch (error) {
      console.error('Error submitting application:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Rent a Shop - Application Form
          </DialogTitle>
          <DialogDescription>
            Fill out this form to apply for your own shop on our platform.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            
            <div>
              <Label htmlFor="store_name">Store Name *</Label>
              <Input
                id="store_name"
                value={formData.store_name}
                onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                placeholder="Enter your store name"
                required
              />
            </div>

            <div>
              <Label htmlFor="product_category">Product Category *</Label>
              <Select 
                value={formData.product_category} 
                onValueChange={(value) => setFormData({ ...formData, product_category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price_range_min">Minimum Price ($) *</Label>
                <Input
                  id="price_range_min"
                  type="number"
                  step="0.01"
                  value={formData.price_range_min}
                  onChange={(e) => setFormData({ ...formData, price_range_min: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <Label htmlFor="price_range_max">Maximum Price ($) *</Label>
                <Input
                  id="price_range_max"
                  type="number"
                  step="0.01"
                  value={formData.price_range_max}
                  onChange={(e) => setFormData({ ...formData, price_range_max: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="contact_phone">Contact Phone</Label>
              <Input
                id="contact_phone"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <Label htmlFor="business_address">Business Address</Label>
              <Textarea
                id="business_address"
                value={formData.business_address}
                onChange={(e) => setFormData({ ...formData, business_address: e.target.value })}
                placeholder="Enter your business address"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="business_description">Business Description</Label>
              <Textarea
                id="business_description"
                value={formData.business_description}
                onChange={(e) => setFormData({ ...formData, business_description: e.target.value })}
                placeholder="Describe your business and what you plan to sell"
                rows={4}
              />
            </div>
          </div>

          {/* Bank Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Bank Details
            </h3>
            <p className="text-sm text-muted-foreground">
              These details cannot be changed after submission.
            </p>

            <div>
              <Label htmlFor="bank_name">Bank Name *</Label>
              <Input
                id="bank_name"
                value={formData.bank_details.bank_name}
                onChange={(e) => setFormData({
                  ...formData,
                  bank_details: { ...formData.bank_details, bank_name: e.target.value }
                })}
                placeholder="Enter bank name"
                required
              />
            </div>

            <div>
              <Label htmlFor="account_name">Account Name *</Label>
              <Input
                id="account_name"
                value={formData.bank_details.account_name}
                onChange={(e) => setFormData({
                  ...formData,
                  bank_details: { ...formData.bank_details, account_name: e.target.value }
                })}
                placeholder="Enter account holder name"
                required
              />
            </div>

            <div>
              <Label htmlFor="account_number">Account Number *</Label>
              <Input
                id="account_number"
                value={formData.bank_details.account_number}
                onChange={(e) => setFormData({
                  ...formData,
                  bank_details: { ...formData.bank_details, account_number: e.target.value }
                })}
                placeholder="Enter account number"
                required
              />
            </div>

            <div>
              <Label htmlFor="routing_number">Routing Number *</Label>
              <Input
                id="routing_number"
                value={formData.bank_details.routing_number}
                onChange={(e) => setFormData({
                  ...formData,
                  bank_details: { ...formData.bank_details, routing_number: e.target.value }
                })}
                placeholder="Enter routing number"
                required
              />
            </div>
          </div>

          <div className="border rounded-lg p-4 bg-gray-50 mb-4">
            <h3 className="font-semibold mb-2">Terms and Conditions & Privacy Policy</h3>
            <p className="text-sm text-gray-600 mb-3">By applying for a shop, you agree to sell only legal and moral products. No immoral products are permitted.</p>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="shop-terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                required
              />
              <Label htmlFor="shop-terms" className="text-sm">
                I agree to the{' '}
                <a href="/terms" target="_blank" className="text-blue-600 hover:underline">
                  terms and conditions
                </a>{' '}
                and{' '}
                <a href="/privacy" target="_blank" className="text-blue-600 hover:underline">
                  privacy policy
                </a>
              </Label>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !agreedToTerms} className="flex-1">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Application
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};