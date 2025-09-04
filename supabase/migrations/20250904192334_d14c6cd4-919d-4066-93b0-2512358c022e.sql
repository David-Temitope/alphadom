-- Fix function security by setting search path
CREATE OR REPLACE FUNCTION create_product_notification()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create notifications for users following this vendor
  INSERT INTO user_notifications (user_id, title, message, type, related_id)
  SELECT 
    uf.follower_id,
    'New Product Added',
    CONCAT('A vendor you follow added a new product: ', NEW.name),
    'product',
    NEW.id
  FROM user_follows uf
  WHERE uf.following_id = NEW.vendor_user_id;
  
  RETURN NEW;
END;
$$;