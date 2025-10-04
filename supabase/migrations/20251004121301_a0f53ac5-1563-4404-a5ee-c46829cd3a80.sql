-- Add ai_access_blocked to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ai_access_blocked boolean DEFAULT false;

-- Add currency settings to admin_settings
INSERT INTO admin_settings (setting_key, setting_value)
VALUES ('currency', '{"name": "Naira", "symbol": "₦", "code": "NGN"}')
ON CONFLICT (setting_key) DO NOTHING;

-- Add hero dynamic text settings
INSERT INTO admin_settings (setting_key, setting_value)
VALUES 
  ('hero_main_text', '"Store"'),
  ('hero_secondary_text', '"for Modern Living"')
ON CONFLICT (setting_key) DO NOTHING;

-- Create function to auto-delete out of stock products
CREATE OR REPLACE FUNCTION auto_delete_out_of_stock_products()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Find products that have been out of stock for 7 days
  -- and notify owners 3 days before deletion (at 4 days out of stock)
  
  -- Send 3-day warning notifications
  INSERT INTO user_notifications (user_id, title, message, type, related_id)
  SELECT 
    p.vendor_user_id,
    'Product Auto-Delete Warning',
    CONCAT('Your product "', p.name, '" has been out of stock for 4 days and will be automatically deleted in 3 days if stock is not replenished.'),
    'warning',
    p.id
  FROM products p
  WHERE p.stock_count = 0 
    AND p.last_stock_update < NOW() - INTERVAL '4 days'
    AND p.last_stock_update >= NOW() - INTERVAL '5 days'
    AND p.vendor_user_id IS NOT NULL;
  
  -- Delete products that have been out of stock for 7+ days
  DELETE FROM product_likes 
  WHERE product_id IN (
    SELECT id FROM products 
    WHERE stock_count = 0 
      AND last_stock_update < NOW() - INTERVAL '7 days'
  );
  
  DELETE FROM product_comments 
  WHERE product_id IN (
    SELECT id FROM products 
    WHERE stock_count = 0 
      AND last_stock_update < NOW() - INTERVAL '7 days'
  );
  
  DELETE FROM wishlist 
  WHERE product_id IN (
    SELECT id FROM products 
    WHERE stock_count = 0 
      AND last_stock_update < NOW() - INTERVAL '7 days'
  );
  
  DELETE FROM products 
  WHERE stock_count = 0 
    AND last_stock_update < NOW() - INTERVAL '7 days';
END;
$$;