-- Add suspension capability to vendors
ALTER TABLE approved_vendors ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false;

-- Add order approval system
ALTER TABLE orders ADD COLUMN IF NOT EXISTS approved_by UUID DEFAULT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create user notifications table
CREATE TABLE IF NOT EXISTS user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  related_id UUID DEFAULT NULL
);

-- Enable RLS on user_notifications
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for user_notifications if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own notifications' AND tablename = 'user_notifications') THEN
    CREATE POLICY "Users can view own notifications"
    ON user_notifications FOR SELECT
    USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own notifications' AND tablename = 'user_notifications') THEN
    CREATE POLICY "Users can update own notifications"
    ON user_notifications FOR UPDATE
    USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'System can create notifications' AND tablename = 'user_notifications') THEN
    CREATE POLICY "System can create notifications"
    ON user_notifications FOR INSERT
    WITH CHECK (true);
  END IF;
END $$;

-- Create function to create notifications for followed vendors
CREATE OR REPLACE FUNCTION create_product_notification()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for product notifications
DROP TRIGGER IF EXISTS product_notification_trigger ON products;
CREATE TRIGGER product_notification_trigger
  AFTER INSERT ON products
  FOR EACH ROW
  EXECUTE FUNCTION create_product_notification();