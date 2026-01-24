-- 1. SECURITY FIX: Restrict shop_applications access - only owner and super admins
-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can update shop applications for admin" ON shop_applications;

-- 2. SECURITY FIX: Restrict delivery_requests access - disable for now
-- Drop all policies on delivery_requests since delivery is not active
DROP POLICY IF EXISTS "Authenticated users can manage delivery requests for admin" ON delivery_requests;
DROP POLICY IF EXISTS "Dispatchers can update assigned delivery requests" ON delivery_requests;
DROP POLICY IF EXISTS "Dispatchers can view assigned delivery requests" ON delivery_requests;
DROP POLICY IF EXISTS "Vendors can create delivery requests" ON delivery_requests;
DROP POLICY IF EXISTS "Vendors can view own delivery requests" ON delivery_requests;

-- Create minimal policy - no one can access delivery_requests until feature is enabled
CREATE POLICY "Delivery feature disabled - no access"
ON delivery_requests
FOR ALL
USING (false);

-- 3. Create user_addresses table for address book feature
CREATE TABLE IF NOT EXISTS public.user_addresses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT 'Home',
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  postal_code TEXT,
  country TEXT NOT NULL DEFAULT 'NG',
  phone TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_addresses
CREATE POLICY "Users can view their own addresses"
ON user_addresses FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own addresses"
ON user_addresses FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own addresses"
ON user_addresses FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own addresses"
ON user_addresses FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_addresses_default ON user_addresses(user_id, is_default);

-- Function to ensure only one default address per user
CREATE OR REPLACE FUNCTION ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE user_addresses 
    SET is_default = false 
    WHERE user_id = NEW.user_id 
    AND id != NEW.id 
    AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for default address
DROP TRIGGER IF EXISTS ensure_single_default_address_trigger ON user_addresses;
CREATE TRIGGER ensure_single_default_address_trigger
BEFORE INSERT OR UPDATE ON user_addresses
FOR EACH ROW
EXECUTE FUNCTION ensure_single_default_address();

-- 4. Create function to notify all users when a blog post is published
CREATE OR REPLACE FUNCTION notify_users_on_blog_post()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify when a post is published (published changes to true)
  IF NEW.published = true AND (OLD.published IS NULL OR OLD.published = false) THEN
    INSERT INTO user_notifications (user_id, title, message, type, related_id)
    SELECT 
      p.id,
      'New Blog Post: ' || NEW.title,
      COALESCE(NEW.subtitle, 'Check out our latest article!'),
      'blog_post',
      NEW.id
    FROM profiles p
    WHERE p.id IS NOT NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for blog post notifications
DROP TRIGGER IF EXISTS notify_on_blog_publish ON blog_posts;
CREATE TRIGGER notify_on_blog_publish
AFTER INSERT OR UPDATE ON blog_posts
FOR EACH ROW
EXECUTE FUNCTION notify_users_on_blog_post();