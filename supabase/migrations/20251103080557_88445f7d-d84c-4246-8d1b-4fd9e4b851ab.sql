-- Add RLS policies for admins to view all orders, profiles, and order_items

-- Drop existing restrictive policies on orders if they exist
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON orders;

-- Add admin policies for orders
CREATE POLICY "Admins can view all orders"
ON orders FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    EXISTS (
      SELECT 1 FROM admin_roles 
      WHERE user_id = auth.uid() AND is_active = true
    )
    OR
    -- Allow if user is viewing their own orders
    auth.uid() = user_id
    OR
    -- Allow if user is the vendor for this order
    EXISTS (
      SELECT 1 FROM approved_vendors 
      WHERE user_id = auth.uid() AND id = orders.vendor_id
    )
  )
);

CREATE POLICY "Admins can update all orders"
ON orders FOR UPDATE
USING (
  auth.uid() IS NOT NULL AND (
    EXISTS (
      SELECT 1 FROM admin_roles 
      WHERE user_id = auth.uid() AND is_active = true
    )
    OR
    auth.uid() = user_id
  )
);

-- Update profiles policies to allow admins
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

CREATE POLICY "Admins can update all profiles"
ON profiles FOR UPDATE
USING (
  auth.uid() = id OR
  EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- Update order_items to allow admin access
DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;

CREATE POLICY "Admins can view all order items"
ON order_items FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    EXISTS (
      SELECT 1 FROM admin_roles 
      WHERE user_id = auth.uid() AND is_active = true
    )
    OR
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  )
);