
-- Add image storage bucket for product images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Create storage policies for product images
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own uploads" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete own uploads" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);

-- Add columns to products table for better tracking
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS total_likes INTEGER DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS total_orders INTEGER DEFAULT 0;

-- Create product likes table
CREATE TABLE IF NOT EXISTS public.product_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Create wishlist table
CREATE TABLE IF NOT EXISTS public.wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Add shipping and tax calculation columns to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(10,2) DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10,2) DEFAULT 0;

-- Enable RLS for new tables
ALTER TABLE public.product_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for product_likes
CREATE POLICY "Users can view own likes" ON public.product_likes
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own likes" ON public.product_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON public.product_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for wishlist
CREATE POLICY "Users can view own wishlist" ON public.wishlist
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert to own wishlist" ON public.wishlist
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete from own wishlist" ON public.wishlist
  FOR DELETE USING (auth.uid() = user_id);

-- Function to update product rating based on likes and orders
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the product's rating based on likes and orders
  UPDATE public.products 
  SET 
    total_likes = (SELECT COUNT(*) FROM public.product_likes WHERE product_id = NEW.product_id),
    total_orders = (SELECT COALESCE(SUM(quantity), 0) FROM public.order_items WHERE product_id = NEW.product_id),
    rating = LEAST(5.0, 3.0 + (
      (SELECT COUNT(*) FROM public.product_likes WHERE product_id = NEW.product_id) * 0.1 +
      (SELECT COALESCE(SUM(quantity), 0) FROM public.order_items WHERE product_id = NEW.product_id) * 0.05
    ))
  WHERE id = NEW.product_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for rating updates
CREATE TRIGGER update_rating_on_like
  AFTER INSERT OR DELETE ON public.product_likes
  FOR EACH ROW EXECUTE FUNCTION update_product_rating();

CREATE TRIGGER update_rating_on_order
  AFTER INSERT ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- Enable realtime for new tables
ALTER TABLE public.product_likes REPLICA IDENTITY FULL;
ALTER TABLE public.wishlist REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.product_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wishlist;

-- Create function to calculate shipping and tax
CREATE OR REPLACE FUNCTION calculate_order_totals(
  subtotal_amount DECIMAL,
  shipping_address JSONB
) RETURNS TABLE(shipping_cost DECIMAL, tax_amount DECIMAL, total_amount DECIMAL) AS $$
DECLARE
  base_shipping DECIMAL := 5.99;
  tax_rate DECIMAL := 0.08; -- 8% tax rate
  calculated_shipping DECIMAL;
  calculated_tax DECIMAL;
BEGIN
  -- Calculate shipping based on subtotal (free shipping over $50)
  IF subtotal_amount >= 50 THEN
    calculated_shipping := 0;
  ELSE
    calculated_shipping := base_shipping;
  END IF;
  
  -- Calculate tax
  calculated_tax := subtotal_amount * tax_rate;
  
  RETURN QUERY SELECT 
    calculated_shipping,
    calculated_tax,
    subtotal_amount + calculated_shipping + calculated_tax;
END;
$$ LANGUAGE plpgsql;
