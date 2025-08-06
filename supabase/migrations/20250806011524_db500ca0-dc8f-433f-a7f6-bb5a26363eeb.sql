-- Add stock management fields to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS initial_stock_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_stock_update timestamp with time zone DEFAULT now();

-- Add stock alert status for low stock notifications
CREATE TABLE IF NOT EXISTS admin_stock_alerts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  alert_type text NOT NULL CHECK (alert_type IN ('low_stock', 'out_of_stock')),
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on stock alerts
ALTER TABLE admin_stock_alerts ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to manage stock alerts
CREATE POLICY "Authenticated users can manage stock alerts"
ON admin_stock_alerts FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Function to update product ratings based on real user interactions
CREATE OR REPLACE FUNCTION update_product_rating_real()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update the product's rating based on likes, wishlist, and orders
  UPDATE products 
  SET 
    total_likes = (SELECT COUNT(*) FROM product_likes WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)),
    total_orders = (SELECT COALESCE(SUM(quantity), 0) FROM order_items WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)),
    reviews = GREATEST(1, (
      (SELECT COUNT(*) FROM product_likes WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)) * 2 +
      (SELECT COUNT(*) FROM wishlist WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)) * 1 +
      (SELECT COALESCE(SUM(quantity), 0) FROM order_items WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)) * 5
    )),
    rating = LEAST(5.0, GREATEST(1.0, 3.0 + (
      (SELECT COUNT(*) FROM product_likes WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)) * 0.1 +
      (SELECT COUNT(*) FROM wishlist WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)) * 0.05 +
      (SELECT COALESCE(SUM(quantity), 0) FROM order_items WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)) * 0.08
    )))
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers for real-time rating updates
DROP TRIGGER IF EXISTS update_rating_on_like ON product_likes;
CREATE TRIGGER update_rating_on_like
  AFTER INSERT OR DELETE ON product_likes
  FOR EACH ROW EXECUTE FUNCTION update_product_rating_real();

DROP TRIGGER IF EXISTS update_rating_on_wishlist ON wishlist;
CREATE TRIGGER update_rating_on_wishlist
  AFTER INSERT OR DELETE ON wishlist
  FOR EACH ROW EXECUTE FUNCTION update_product_rating_real();

DROP TRIGGER IF EXISTS update_rating_on_order ON order_items;
CREATE TRIGGER update_rating_on_order
  AFTER INSERT OR UPDATE OR DELETE ON order_items
  FOR EACH ROW EXECUTE FUNCTION update_product_rating_real();

-- Function to handle stock reduction when orders are placed
CREATE OR REPLACE FUNCTION reduce_product_stock()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Reduce stock count when order item is inserted
  UPDATE products 
  SET 
    stock_count = GREATEST(0, stock_count - NEW.quantity),
    last_stock_update = now()
  WHERE id = NEW.product_id;
  
  -- Check if stock is now 0 and create alert
  INSERT INTO admin_stock_alerts (product_id, alert_type)
  SELECT NEW.product_id, 'out_of_stock'
  FROM products 
  WHERE id = NEW.product_id AND stock_count = 0;
  
  -- Check if stock is low (less than 10% of initial stock) and create alert
  INSERT INTO admin_stock_alerts (product_id, alert_type)
  SELECT NEW.product_id, 'low_stock'
  FROM products 
  WHERE id = NEW.product_id 
    AND stock_count > 0 
    AND initial_stock_count > 0
    AND stock_count < (initial_stock_count * 0.1);
  
  RETURN NEW;
END;
$$;

-- Create trigger for stock reduction
DROP TRIGGER IF EXISTS reduce_stock_on_order ON order_items;
CREATE TRIGGER reduce_stock_on_order
  AFTER INSERT ON order_items
  FOR EACH ROW EXECUTE FUNCTION reduce_product_stock();

-- Update calculate_order_totals function for new shipping rules
CREATE OR REPLACE FUNCTION calculate_order_totals(subtotal_amount numeric, shipping_address jsonb)
RETURNS TABLE(shipping_cost numeric, tax_amount numeric, total_amount numeric)
LANGUAGE plpgsql
AS $$
DECLARE
  calculated_shipping DECIMAL;
  tax_rate DECIMAL := 0.08; -- 8% tax rate
  calculated_tax DECIMAL;
BEGIN
  -- Calculate shipping: free for orders < $30, 5% of product price for orders >= $30
  IF subtotal_amount < 30 THEN
    calculated_shipping := 0;
  ELSE
    calculated_shipping := subtotal_amount * 0.05;
  END IF;
  
  -- Calculate tax
  calculated_tax := subtotal_amount * tax_rate;
  
  RETURN QUERY SELECT 
    calculated_shipping,
    calculated_tax,
    subtotal_amount + calculated_shipping + calculated_tax;
END;
$$;