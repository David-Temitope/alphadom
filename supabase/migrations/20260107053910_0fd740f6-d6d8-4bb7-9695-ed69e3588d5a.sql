-- Create a separate encrypted table for sensitive vendor financial data
-- This removes sensitive fields from shop_applications and stores them securely

-- Create the secure vendor financial data table
CREATE TABLE public.vendor_sensitive_data (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    application_id UUID REFERENCES public.shop_applications(id) ON DELETE CASCADE NOT NULL UNIQUE,
    user_id UUID NOT NULL,
    id_type TEXT,
    id_number TEXT,
    id_image_url TEXT,
    tin_number TEXT,
    bank_details JSONB,
    vendor_bank_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vendor_sensitive_data ENABLE ROW LEVEL SECURITY;

-- Only the application owner can view their own sensitive data
CREATE POLICY "Users can view own sensitive data"
ON public.vendor_sensitive_data
FOR SELECT
USING (auth.uid() = user_id);

-- Only super admins can view all sensitive data (for verification purposes)
CREATE POLICY "Super admins can view all sensitive data"
ON public.vendor_sensitive_data
FOR SELECT
USING (has_admin_role(auth.uid(), 'super_admin'::admin_role));

-- Users can insert their own sensitive data
CREATE POLICY "Users can insert own sensitive data"
ON public.vendor_sensitive_data
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own sensitive data (before approval)
CREATE POLICY "Users can update own sensitive data"
ON public.vendor_sensitive_data
FOR UPDATE
USING (auth.uid() = user_id);

-- Only super admins can delete sensitive data
CREATE POLICY "Super admins can delete sensitive data"
ON public.vendor_sensitive_data
FOR DELETE
USING (has_admin_role(auth.uid(), 'super_admin'::admin_role));

-- Create index for faster lookups
CREATE INDEX idx_vendor_sensitive_data_user_id ON public.vendor_sensitive_data(user_id);
CREATE INDEX idx_vendor_sensitive_data_application_id ON public.vendor_sensitive_data(application_id);

-- Migrate existing sensitive data from shop_applications to the new table
INSERT INTO public.vendor_sensitive_data (
    application_id,
    user_id,
    id_type,
    id_number,
    id_image_url,
    tin_number,
    bank_details,
    vendor_bank_details
)
SELECT 
    id,
    user_id,
    id_type,
    id_number,
    id_image_url,
    tin_number,
    bank_details,
    vendor_bank_details
FROM public.shop_applications
WHERE id_number IS NOT NULL OR bank_details IS NOT NULL OR vendor_bank_details IS NOT NULL;

-- Update the shop_applications_safe view to not include any sensitive data
DROP VIEW IF EXISTS public.shop_applications_safe;
CREATE VIEW public.shop_applications_safe 
WITH (security_invoker = true)
AS SELECT 
    id,
    user_id,
    store_name,
    product_category,
    price_range_min,
    price_range_max,
    email,
    contact_phone,
    business_address,
    business_description,
    business_type,
    is_registered,
    subscription_plan,
    agreed_policies,
    status,
    admin_notes,
    approved_at,
    payment_due_date,
    payment_countdown_expires_at,
    payment_received_at,
    created_at,
    updated_at
FROM public.shop_applications;

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_vendor_sensitive_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_vendor_sensitive_data_timestamp
BEFORE UPDATE ON public.vendor_sensitive_data
FOR EACH ROW
EXECUTE FUNCTION public.update_vendor_sensitive_data_updated_at();