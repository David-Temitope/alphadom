-- Fix security warnings by setting search_path for functions
CREATE OR REPLACE FUNCTION update_product_rating_real()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

CREATE OR REPLACE FUNCTION reduce_product_stock()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

CREATE OR REPLACE FUNCTION calculate_order_totals(subtotal_amount numeric, shipping_address jsonb)
RETURNS TABLE(shipping_cost numeric, tax_amount numeric, total_amount numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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