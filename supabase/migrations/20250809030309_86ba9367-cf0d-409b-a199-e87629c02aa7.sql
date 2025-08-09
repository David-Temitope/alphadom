-- Create shop applications table
CREATE TABLE public.shop_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  store_name TEXT NOT NULL,
  product_category TEXT NOT NULL,
  price_range_min DECIMAL NOT NULL,
  price_range_max DECIMAL NOT NULL,
  email TEXT NOT NULL,
  bank_details JSONB NOT NULL,
  business_description TEXT,
  contact_phone TEXT,
  business_address TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  payment_due_date TIMESTAMP WITH TIME ZONE,
  payment_received_at TIMESTAMP WITH TIME ZONE
);

-- Create approved vendors table
CREATE TABLE public.approved_vendors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  application_id UUID NOT NULL REFERENCES shop_applications(id) ON DELETE CASCADE,
  store_name TEXT NOT NULL,
  product_category TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  total_revenue DECIMAL NOT NULL DEFAULT 0,
  total_orders INTEGER NOT NULL DEFAULT 0,
  total_products INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vendor products table (extends existing products)
CREATE TABLE public.vendor_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES approved_vendors(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create complaints table
CREATE TABLE public.complaints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create vendor analytics table
CREATE TABLE public.vendor_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES approved_vendors(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  revenue DECIMAL NOT NULL DEFAULT 0,
  orders_count INTEGER NOT NULL DEFAULT 0,
  products_added INTEGER NOT NULL DEFAULT 0,
  customers_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(vendor_id, date)
);

-- Add vendor_id to products table
ALTER TABLE public.products ADD COLUMN vendor_id UUID REFERENCES approved_vendors(id) ON DELETE SET NULL;

-- Add vendor_id to orders table for tracking which vendor gets payment
ALTER TABLE public.orders ADD COLUMN vendor_id UUID REFERENCES approved_vendors(id) ON DELETE SET NULL;

-- Enable RLS on new tables
ALTER TABLE public.shop_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approved_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shop_applications
CREATE POLICY "Users can insert own shop applications" 
ON public.shop_applications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own shop applications" 
ON public.shop_applications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view all applications for admin" 
ON public.shop_applications 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update applications for admin" 
ON public.shop_applications 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- RLS Policies for approved_vendors
CREATE POLICY "Vendors can view own data" 
ON public.approved_vendors 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view all vendors for admin" 
ON public.approved_vendors 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- RLS Policies for vendor_products
CREATE POLICY "Vendors can manage own products" 
ON public.vendor_products 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM approved_vendors 
  WHERE approved_vendors.id = vendor_products.vendor_id 
  AND approved_vendors.user_id = auth.uid()
));

CREATE POLICY "Authenticated users can view all vendor products for admin" 
ON public.vendor_products 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- RLS Policies for complaints
CREATE POLICY "Users can insert own complaints" 
ON public.complaints 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own complaints" 
ON public.complaints 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view all complaints for admin" 
ON public.complaints 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- RLS Policies for vendor_analytics
CREATE POLICY "Vendors can view own analytics" 
ON public.vendor_analytics 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM approved_vendors 
  WHERE approved_vendors.id = vendor_analytics.vendor_id 
  AND approved_vendors.user_id = auth.uid()
));

CREATE POLICY "Authenticated users can view all analytics for admin" 
ON public.vendor_analytics 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Create triggers for updated_at columns
CREATE TRIGGER update_shop_applications_updated_at
BEFORE UPDATE ON public.shop_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_approved_vendors_updated_at
BEFORE UPDATE ON public.approved_vendors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_complaints_updated_at
BEFORE UPDATE ON public.complaints
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update vendor revenue when order is shipped
CREATE OR REPLACE FUNCTION update_vendor_revenue()
RETURNS TRIGGER AS $$
BEGIN
  -- Update vendor revenue when order status changes to 'shipped'
  IF NEW.status = 'shipped' AND OLD.status != 'shipped' THEN
    UPDATE approved_vendors 
    SET 
      total_revenue = total_revenue + NEW.total_amount,
      total_orders = total_orders + 1,
      updated_at = now()
    WHERE id = NEW.vendor_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for vendor revenue updates
CREATE TRIGGER update_vendor_revenue_trigger
AFTER UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION update_vendor_revenue();