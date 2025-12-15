-- Add subscription fields to shop_applications
ALTER TABLE public.shop_applications
ADD COLUMN IF NOT EXISTS id_type TEXT,
ADD COLUMN IF NOT EXISTS id_number TEXT,
ADD COLUMN IF NOT EXISTS id_image_url TEXT,
ADD COLUMN IF NOT EXISTS business_type TEXT DEFAULT 'individual',
ADD COLUMN IF NOT EXISTS is_registered BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS tin_number TEXT,
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS agreed_policies JSONB DEFAULT '{"return": false, "refund": false, "delivery": false, "dispute": false}'::jsonb;

-- Add subscription fields to approved_vendors
ALTER TABLE public.approved_vendors
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS product_limit INTEGER DEFAULT 20,
ADD COLUMN IF NOT EXISTS commission_rate NUMERIC DEFAULT 15,
ADD COLUMN IF NOT EXISTS has_home_visibility BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS free_ads_remaining INTEGER DEFAULT 0;

-- Create transactions table for admin tracking
CREATE TABLE IF NOT EXISTS public.platform_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_type TEXT NOT NULL, -- 'subscription', 'order_payment', 'commission'
  amount NUMERIC NOT NULL,
  user_id UUID,
  vendor_id UUID,
  order_id UUID,
  reference TEXT,
  payment_method TEXT,
  status TEXT DEFAULT 'completed',
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on transactions
ALTER TABLE public.platform_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policy for transactions (admins only)
CREATE POLICY "Admins can view all transactions"
ON public.platform_transactions
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM admin_roles 
  WHERE admin_roles.user_id = auth.uid() AND admin_roles.is_active = true
));

CREATE POLICY "System can create transactions"
ON public.platform_transactions
FOR INSERT
WITH CHECK (true);

-- Create contact messages table for admin reports
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  user_id UUID,
  status TEXT DEFAULT 'unread',
  admin_response TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on contact_messages
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for contact_messages
CREATE POLICY "Anyone can create contact messages"
ON public.contact_messages
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all contact messages"
ON public.contact_messages
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM admin_roles 
  WHERE admin_roles.user_id = auth.uid() AND admin_roles.is_active = true
));

CREATE POLICY "Admins can update contact messages"
ON public.contact_messages
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM admin_roles 
  WHERE admin_roles.user_id = auth.uid() AND admin_roles.is_active = true
));

-- Create ads table for non-intrusive advertising
CREATE TABLE IF NOT EXISTS public.platform_ads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  cta_text TEXT,
  target_page TEXT, -- 'homepage', 'products', 'product_detail', 'about', 'contact', 'category'
  target_product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  target_vendor_id UUID REFERENCES public.approved_vendors(id) ON DELETE SET NULL,
  target_url TEXT,
  is_active BOOLEAN DEFAULT true,
  animation_type TEXT DEFAULT 'fade', -- 'slide_left', 'slide_right', 'slide_top', 'slide_bottom', 'zoom', 'fade'
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on ads
ALTER TABLE public.platform_ads ENABLE ROW LEVEL SECURITY;

-- RLS policies for ads
CREATE POLICY "Anyone can view active ads"
ON public.platform_ads
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage ads"
ON public.platform_ads
FOR ALL
USING (EXISTS (
  SELECT 1 FROM admin_roles 
  WHERE admin_roles.user_id = auth.uid() AND admin_roles.is_active = true
));

-- Add product filtering fields to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS product_type TEXT,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS colors TEXT[],
ADD COLUMN IF NOT EXISTS sizes TEXT[],
ADD COLUMN IF NOT EXISTS material TEXT,
ADD COLUMN IF NOT EXISTS thickness TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[];