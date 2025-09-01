-- Update products table to add shipping fee fields
ALTER TABLE public.products 
ADD COLUMN shipping_fee DECIMAL(10,2) DEFAULT 0,
ADD COLUMN shipping_type TEXT DEFAULT 'one_time' CHECK (shipping_type IN ('one_time', 'per_product'));

-- Update shop_applications table to add countdown fields
ALTER TABLE public.shop_applications
ADD COLUMN payment_countdown_expires_at TIMESTAMP WITH TIME ZONE;

-- Create vendor dashboard access table
CREATE TABLE public.vendor_dashboard_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES approved_vendors(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(vendor_id, user_id)
);

-- Enable RLS on vendor_dashboard_access
ALTER TABLE public.vendor_dashboard_access ENABLE ROW LEVEL SECURITY;

-- Policies for vendor_dashboard_access
CREATE POLICY "Vendors can view own dashboard access" 
ON public.vendor_dashboard_access 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can view all dashboard access for admin" 
ON public.vendor_dashboard_access 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Update products table to link with vendors
ALTER TABLE public.products 
ADD COLUMN vendor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create a function to update product reviews based on real interactions
CREATE OR REPLACE FUNCTION public.update_product_reviews()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update the product's reviews based on real interactions
  UPDATE products 
  SET 
    total_likes = (SELECT COUNT(*) FROM product_likes WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)),
    reviews = (
      (SELECT COUNT(*) FROM product_likes WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)) +
      (SELECT COUNT(*) FROM product_comments WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)) +
      (SELECT COUNT(*) FROM wishlist WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)) +
      (SELECT COALESCE(SUM(quantity), 0) FROM order_items WHERE product_id = COALESCE(NEW.product_id, OLD.product_id))
    ),
    rating = LEAST(5.0, GREATEST(1.0, 3.0 + (
      (SELECT COUNT(*) FROM product_likes WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)) * 0.1 +
      (SELECT COUNT(*) FROM product_comments WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)) * 0.15 +
      (SELECT COUNT(*) FROM wishlist WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)) * 0.05 +
      (SELECT COALESCE(SUM(quantity), 0) FROM order_items WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)) * 0.1
    )))
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers for real-time review updates
DROP TRIGGER IF EXISTS update_product_reviews_on_like ON product_likes;
CREATE TRIGGER update_product_reviews_on_like
  AFTER INSERT OR DELETE ON product_likes
  FOR EACH ROW EXECUTE FUNCTION update_product_reviews();

DROP TRIGGER IF EXISTS update_product_reviews_on_comment ON product_comments;
CREATE TRIGGER update_product_reviews_on_comment
  AFTER INSERT OR DELETE ON product_comments
  FOR EACH ROW EXECUTE FUNCTION update_product_reviews();

DROP TRIGGER IF EXISTS update_product_reviews_on_wishlist ON wishlist;
CREATE TRIGGER update_product_reviews_on_wishlist
  AFTER INSERT OR DELETE ON wishlist
  FOR EACH ROW EXECUTE FUNCTION update_product_reviews();

DROP TRIGGER IF EXISTS update_product_reviews_on_order ON order_items;
CREATE TRIGGER update_product_reviews_on_order
  AFTER INSERT ON order_items
  FOR EACH ROW EXECUTE FUNCTION update_product_reviews();