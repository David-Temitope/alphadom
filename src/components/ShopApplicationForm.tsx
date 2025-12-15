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
import { Store, CreditCard, Loader2, ChevronRight, ChevronLeft, Upload, CheckCircle, FileText, Building2, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ShopApplicationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ShopApplicationForm = ({ open, onOpenChange }: ShopApplicationFormProps) => {
  const { submitApplication } = useShopApplications();
  const { addUserType } = useUserTypes();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [uploadingId, setUploadingId] = useState(false);
  
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
    },
    id_type: '',
    id_number: '',
    id_image_url: '',
    business_type: 'individual',
    is_registered: false,
    tin_number: '',
    agreed_policies: {
      return: false,
      refund: false,
      delivery: false,
      dispute: false
    }
  });

  const categories = [
    'Electronics', 'Clothing & Fashion', 'Home & Garden', 'Sports & Outdoors',
    'Books & Media', 'Toys & Games', 'Health & Beauty', 'Automotive',
    'Food & Beverages', 'Arts & Crafts', 'Jewelry & Accessories', 'Other'
  ];

  const idTypes = [
    { value: 'nin', label: 'National Identification Number (NIN)' },
    { value: 'drivers_license', label: "Driver's License" },
    { value: 'voters_card', label: "Voter's Card" }
  ];

  const handleIdImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingId(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `id-documents/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setFormData({ ...formData, id_image_url: data.publicUrl });
      toast({ title: "Success", description: "ID image uploaded successfully" });
    } catch (error) {
      console.error('Upload error:', error);
      toast({ title: "Error", description: "Failed to upload ID image", variant: "destructive" });
    } finally {
      setUploadingId(false);
    }
  };

  const allPoliciesAgreed = formData.agreed_policies.return && 
    formData.agreed_policies.refund && 
    formData.agreed_policies.delivery && 
    formData.agreed_policies.dispute;

  const canProceedStep1 = formData.store_name && 
    formData.product_category && 
    formData.price_range_min && 
    formData.price_range_max && 
    formData.email &&
    formData.bank_details.bank_name &&
    formData.bank_details.account_name &&
    formData.bank_details.account_number;

  const canSubmit = formData.id_type && 
    formData.id_number && 
    formData.id_image_url &&
    allPoliciesAgreed &&
    (formData.business_type === 'individual' || 
      (formData.business_type === 'company' && (!formData.is_registered || formData.tin_number)));

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const applicationData = {
        store_name: formData.store_name,
        product_category: formData.product_category,
        price_range_min: parseFloat(formData.price_range_min),
        price_range_max: parseFloat(formData.price_range_max),
        email: formData.email,
        business_description: formData.business_description,
        contact_phone: formData.contact_phone,
        business_address: formData.business_address,
        bank_details: formData.bank_details,
        id_type: formData.id_type,
        id_number: formData.id_number,
        id_image_url: formData.id_image_url,
        business_type: formData.business_type,
        is_registered: formData.is_registered,
        tin_number: formData.tin_number,
        subscription_plan: 'free', // Default, will be selected after approval
        agreed_policies: formData.agreed_policies
      };

      const result = await submitApplication(applicationData);
      
      if (result?.error === null) {
        await addUserType('vendor');
        onOpenChange(false);
        resetForm();
        toast({
          title: "Application Submitted",
          description: "Your application has been submitted. You'll be able to select a subscription plan once approved."
        });
      }
    } catch (error) {
      console.error('Error submitting application:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setFormData({
      store_name: '',
      product_category: '',
      price_range_min: '',
      price_range_max: '',
      email: '',
      business_description: '',
      contact_phone: '',
      business_address: '',
      bank_details: { bank_name: '', account_number: '', account_name: '', routing_number: '' },
      id_type: '',
      id_number: '',
      id_image_url: '',
      business_type: 'individual',
      is_registered: false,
      tin_number: '',
      agreed_policies: { return: false, refund: false, delivery: false, dispute: false }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Rent a Shop - Step {step} of 2
          </DialogTitle>
          <DialogDescription>
            {step === 1 && "Fill out your basic store information and bank details."}
            {step === 2 && "Complete identity verification and agree to policies."}
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex items-center gap-2 mb-4">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                s <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {s < step ? <CheckCircle className="h-5 w-5" /> : s}
              </div>
              {s < 2 && <div className={`w-16 h-0.5 ${s < step ? 'bg-primary' : 'bg-muted'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Basic Information */}
        {step === 1 && (
          <div className="space-y-4">
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
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price_range_min">Min Price (₦) *</Label>
                <Input
                  id="price_range_min"
                  type="number"
                  value={formData.price_range_min}
                  onChange={(e) => setFormData({ ...formData, price_range_min: e.target.value })}
                  placeholder="0"
                  required
                />
              </div>
              <div>
                <Label htmlFor="price_range_max">Max Price (₦) *</Label>
                <Input
                  id="price_range_max"
                  type="number"
                  value={formData.price_range_max}
                  onChange={(e) => setFormData({ ...formData, price_range_max: e.target.value })}
                  placeholder="0"
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
                placeholder="+234 XXX XXX XXXX"
              />
            </div>

            <div>
              <Label htmlFor="business_address">Business Address *</Label>
              <Textarea
                id="business_address"
                value={formData.business_address}
                onChange={(e) => setFormData({ ...formData, business_address: e.target.value })}
                placeholder="Enter your business address"
                rows={2}
                required
              />
            </div>

            <div>
              <Label htmlFor="business_description">Business Description</Label>
              <Textarea
                id="business_description"
                value={formData.business_description}
                onChange={(e) => setFormData({ ...formData, business_description: e.target.value })}
                placeholder="Describe your business"
                rows={3}
              />
            </div>

            {/* Bank Details */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Bank Details
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bank_name">Bank Name *</Label>
                  <Input
                    id="bank_name"
                    value={formData.bank_details.bank_name}
                    onChange={(e) => setFormData({
                      ...formData,
                      bank_details: { ...formData.bank_details, bank_name: e.target.value }
                    })}
                    placeholder="Bank name"
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
                    placeholder="Account holder name"
                    required
                  />
                </div>
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
                  placeholder="Account number"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={() => setStep(2)} disabled={!canProceedStep1}>
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Identity Verification & Policies */}
        {step === 2 && (
          <div className="space-y-4">
            {/* Identity Verification */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Identity Verification
              </h3>

              <div>
                <Label htmlFor="id_type">ID Type *</Label>
                <Select 
                  value={formData.id_type} 
                  onValueChange={(value) => setFormData({ ...formData, id_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select ID type" />
                  </SelectTrigger>
                  <SelectContent>
                    {idTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="id_number">ID Number *</Label>
                <Input
                  id="id_number"
                  value={formData.id_number}
                  onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
                  placeholder="Enter your ID number"
                  required
                />
              </div>

              <div>
                <Label>Upload ID Image *</Label>
                <div className="mt-2">
                  {formData.id_image_url ? (
                    <div className="relative">
                      <img 
                        src={formData.id_image_url} 
                        alt="ID Document" 
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <Button 
                        type="button"
                        variant="destructive" 
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => setFormData({ ...formData, id_image_url: '' })}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {uploadingId ? (
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        ) : (
                          <>
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">Click to upload ID image</p>
                          </>
                        )}
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleIdImageUpload}
                        disabled={uploadingId}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Business Type */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Business Type
              </h3>

              <div className="flex gap-4">
                <label className={`flex-1 p-4 border rounded-lg cursor-pointer transition-colors ${
                  formData.business_type === 'individual' ? 'border-primary bg-primary/5' : ''
                }`}>
                  <input
                    type="radio"
                    name="business_type"
                    value="individual"
                    checked={formData.business_type === 'individual'}
                    onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    <span className="font-medium">Individual</span>
                  </div>
                </label>
                <label className={`flex-1 p-4 border rounded-lg cursor-pointer transition-colors ${
                  formData.business_type === 'company' ? 'border-primary bg-primary/5' : ''
                }`}>
                  <input
                    type="radio"
                    name="business_type"
                    value="company"
                    checked={formData.business_type === 'company'}
                    onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    <span className="font-medium">Company</span>
                  </div>
                </label>
              </div>

              {formData.business_type === 'company' && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="is_registered" 
                      checked={formData.is_registered}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_registered: !!checked })}
                    />
                    <Label htmlFor="is_registered">Business is registered</Label>
                  </div>

                  {formData.is_registered && (
                    <div>
                      <Label htmlFor="tin_number">TIN Number *</Label>
                      <Input
                        id="tin_number"
                        value={formData.tin_number}
                        onChange={(e) => setFormData({ ...formData, tin_number: e.target.value })}
                        placeholder="Enter your TIN number"
                        required
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Policies */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-semibold">Agree to Policies *</h3>
              <p className="text-sm text-muted-foreground">
                You must agree to all policies to proceed.
              </p>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="return_policy" 
                    checked={formData.agreed_policies.return}
                    onCheckedChange={(checked) => setFormData({ 
                      ...formData, 
                      agreed_policies: { ...formData.agreed_policies, return: !!checked }
                    })}
                  />
                  <Label htmlFor="return_policy" className="text-sm">
                    I agree to the <a href="/terms#return" className="text-primary underline" target="_blank">Return Policy</a>
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="refund_policy" 
                    checked={formData.agreed_policies.refund}
                    onCheckedChange={(checked) => setFormData({ 
                      ...formData, 
                      agreed_policies: { ...formData.agreed_policies, refund: !!checked }
                    })}
                  />
                  <Label htmlFor="refund_policy" className="text-sm">
                    I agree to the <a href="/terms#refund" className="text-primary underline" target="_blank">Refund Policy</a>
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="delivery_policy" 
                    checked={formData.agreed_policies.delivery}
                    onCheckedChange={(checked) => setFormData({ 
                      ...formData, 
                      agreed_policies: { ...formData.agreed_policies, delivery: !!checked }
                    })}
                  />
                  <Label htmlFor="delivery_policy" className="text-sm">
                    I agree to the <a href="/terms#delivery" className="text-primary underline" target="_blank">Delivery Policy</a>
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="dispute_policy" 
                    checked={formData.agreed_policies.dispute}
                    onCheckedChange={(checked) => setFormData({ 
                      ...formData, 
                      agreed_policies: { ...formData.agreed_policies, dispute: !!checked }
                    })}
                  />
                  <Label htmlFor="dispute_policy" className="text-sm">
                    I agree to the <a href="/terms#dispute" className="text-primary underline" target="_blank">Dispute Resolution Policy</a>
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={handleSubmit} disabled={loading || !canSubmit}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Application
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
