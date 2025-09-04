-- Add suspension capability to vendors
ALTER TABLE approved_vendors ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false;

-- Add order approval system
ALTER TABLE orders ADD COLUMN IF NOT EXISTS approved_by UUID DEFAULT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create delivery requests table for dispatch selection
CREATE TABLE IF NOT EXISTS delivery_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) NOT NULL,
  vendor_id UUID REFERENCES approved_vendors(id) NOT NULL,
  dispatcher_id UUID REFERENCES approved_dispatchers(id) DEFAULT NULL,
  product_details JSONB NOT NULL,
  pickup_address JSONB NOT NULL,
  delivery_address JSONB NOT NULL,
  shipping_fee NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  delivered_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  dispatcher_notes TEXT DEFAULT NULL,
  vendor_notes TEXT DEFAULT NULL
);

-- Enable RLS on delivery_requests
ALTER TABLE delivery_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for delivery_requests
CREATE POLICY "Vendors can create delivery requests" 
ON delivery_requests FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM approved_vendors 
    WHERE id = delivery_requests.vendor_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Vendors can view own delivery requests"
ON delivery_requests FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM approved_vendors 
    WHERE id = delivery_requests.vendor_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Dispatchers can view assigned delivery requests"
ON delivery_requests FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM approved_dispatchers 
    WHERE id = delivery_requests.dispatcher_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Dispatchers can update assigned delivery requests"
ON delivery_requests FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM approved_dispatchers 
    WHERE id = delivery_requests.dispatcher_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Authenticated users can manage delivery requests for admin"
ON delivery_requests FOR ALL
USING (auth.uid() IS NOT NULL);

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

-- Create policies for user_notifications
CREATE POLICY "Users can view own notifications"
ON user_notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
ON user_notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
ON user_notifications FOR INSERT
WITH CHECK (true);

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