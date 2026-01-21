-- Create table for user star ratings on products
CREATE TABLE public.product_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  stars INTEGER NOT NULL CHECK (stars >= 1 AND stars <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id, user_id)
);

-- Enable RLS
ALTER TABLE public.product_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view product ratings" 
ON public.product_ratings 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can rate products" 
ON public.product_ratings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings" 
ON public.product_ratings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings" 
ON public.product_ratings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_product_ratings_updated_at
BEFORE UPDATE ON public.product_ratings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to calculate product rating from star ratings + interactions
CREATE OR REPLACE FUNCTION public.calculate_product_rating_with_stars()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_product_id uuid;
  avg_star_rating numeric;
  star_ratings_count int;
  likes_count int;
  wishlist_count int;
  orders_count int;
  comments_count int;
  total_interactions int;
  interaction_bonus numeric;
  final_rating numeric;
  new_reviews int;
BEGIN
  -- Determine the product_id
  target_product_id := COALESCE(NEW.product_id, OLD.product_id);
  
  IF target_product_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;
  
  -- Get average star rating from user ratings
  SELECT AVG(stars), COUNT(*) INTO avg_star_rating, star_ratings_count 
  FROM product_ratings WHERE product_id = target_product_id;
  
  -- Get interaction counts
  SELECT COUNT(*) INTO likes_count FROM product_likes WHERE product_id = target_product_id;
  SELECT COUNT(*) INTO wishlist_count FROM wishlist WHERE product_id = target_product_id;
  SELECT COALESCE(SUM(quantity), 0) INTO orders_count FROM order_items WHERE product_id = target_product_id;
  SELECT COUNT(*) INTO comments_count FROM product_comments WHERE product_id = target_product_id;
  
  -- Calculate total interactions for review count
  total_interactions := star_ratings_count + likes_count + wishlist_count + orders_count + comments_count;
  new_reviews := GREATEST(0, total_interactions);
  
  -- Calculate interaction bonus (capped to not exceed rating bounds)
  -- Each like adds 0.02, wishlist 0.03, order 0.05, comment 0.02
  interaction_bonus := LEAST(1.0, 
    (likes_count * 0.02) + 
    (wishlist_count * 0.03) + 
    (orders_count * 0.05) + 
    (comments_count * 0.02)
  );
  
  -- Calculate final rating
  IF star_ratings_count > 0 THEN
    -- If there are star ratings, use average + small interaction bonus
    final_rating := LEAST(5.0, avg_star_rating + interaction_bonus);
  ELSE
    -- If no star ratings, use base 3.0 + larger interaction bonus (legacy formula)
    final_rating := LEAST(5.0, GREATEST(1.0, 
      3.0 + 
      (likes_count * 0.05) + 
      (wishlist_count * 0.1) + 
      (orders_count * 0.15) + 
      (comments_count * 0.05)
    ));
  END IF;
  
  -- Round to nearest 0.5 for display: ROUND(rating * 2) / 2
  final_rating := ROUND(final_rating * 2) / 2;
  
  -- Update the product
  UPDATE products 
  SET 
    total_likes = likes_count,
    total_orders = orders_count,
    reviews = new_reviews,
    rating = final_rating
  WHERE id = target_product_id;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for product_ratings changes
CREATE TRIGGER update_product_rating_on_star_rating
AFTER INSERT OR UPDATE OR DELETE ON public.product_ratings
FOR EACH ROW
EXECUTE FUNCTION public.calculate_product_rating_with_stars();