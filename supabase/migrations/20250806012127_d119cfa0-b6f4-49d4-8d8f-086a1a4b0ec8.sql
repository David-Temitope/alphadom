-- Fix remaining security warnings for handle_new_user and update_product_rating functions
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update the product's rating based on likes and orders
  UPDATE products 
  SET 
    total_likes = (SELECT COUNT(*) FROM product_likes WHERE product_id = NEW.product_id),
    total_orders = (SELECT COALESCE(SUM(quantity), 0) FROM order_items WHERE product_id = NEW.product_id),
    rating = LEAST(5.0, 3.0 + (
      (SELECT COUNT(*) FROM product_likes WHERE product_id = NEW.product_id) * 0.1 +
      (SELECT COALESCE(SUM(quantity), 0) FROM order_items WHERE product_id = NEW.product_id) * 0.05
    ))
  WHERE id = NEW.product_id;
  
  RETURN NEW;
END;
$$;