-- First create/replace the function
CREATE OR REPLACE FUNCTION public.update_product_reviews_v2()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_product_id uuid;
  likes_count int;
  wishlist_count int;
  orders_count int;
  comments_count int;
  new_reviews int;
  new_rating numeric;
BEGIN
  -- Determine the product_id based on the table
  target_product_id := COALESCE(NEW.product_id, OLD.product_id);
  
  IF target_product_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;
  
  -- Get counts
  SELECT COUNT(*) INTO likes_count FROM product_likes WHERE product_id = target_product_id;
  SELECT COUNT(*) INTO wishlist_count FROM wishlist WHERE product_id = target_product_id;
  SELECT COALESCE(SUM(quantity), 0) INTO orders_count FROM order_items WHERE product_id = target_product_id;
  SELECT COUNT(*) INTO comments_count FROM product_comments WHERE product_id = target_product_id;
  
  -- Calculate reviews: likes*1 + wishlist*1.5 + orders*2 + comments*1
  new_reviews := (likes_count * 1) + CEIL(wishlist_count * 1.5) + (orders_count * 2) + (comments_count * 1);
  
  -- Calculate rating: base 3.0 + increments (capped at 5.0)
  new_rating := LEAST(5.0, GREATEST(1.0, 
    3.0 + 
    (likes_count * 0.05) + 
    (wishlist_count * 0.1) + 
    (orders_count * 0.15) + 
    (comments_count * 0.05)
  ));
  
  -- Update the product
  UPDATE products 
  SET 
    total_likes = likes_count,
    total_orders = orders_count,
    reviews = GREATEST(0, new_reviews),
    rating = new_rating
  WHERE id = target_product_id;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Drop old triggers
DROP TRIGGER IF EXISTS update_product_rating_on_like ON product_likes;
DROP TRIGGER IF EXISTS update_product_rating_on_wishlist ON wishlist;
DROP TRIGGER IF EXISTS update_product_rating_on_order ON order_items;
DROP TRIGGER IF EXISTS update_product_reviews_on_comment ON product_comments;
DROP TRIGGER IF EXISTS update_product_reviews_trigger ON product_comments;

-- Create new triggers using the v2 function
CREATE TRIGGER update_product_rating_on_like_v2
AFTER INSERT OR DELETE ON product_likes
FOR EACH ROW
EXECUTE FUNCTION update_product_reviews_v2();

CREATE TRIGGER update_product_rating_on_wishlist_v2
AFTER INSERT OR DELETE ON wishlist
FOR EACH ROW
EXECUTE FUNCTION update_product_reviews_v2();

CREATE TRIGGER update_product_rating_on_order_v2
AFTER INSERT ON order_items
FOR EACH ROW
EXECUTE FUNCTION update_product_reviews_v2();

CREATE TRIGGER update_product_reviews_on_comment_v2
AFTER INSERT OR DELETE ON product_comments
FOR EACH ROW
EXECUTE FUNCTION update_product_reviews_v2();