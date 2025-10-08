-- Fix profiles table security: Restrict access to personal data
-- Drop the overly permissive policy that allows all authenticated users to view all profiles
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users for orders" ON profiles;
DROP POLICY IF EXISTS "Admin users can view profiles for order management" ON profiles;

-- Keep the existing policy for users to view their own profile
-- (This already exists: "Users can view own profile")

-- Create a new policy for admins to view all profiles for legitimate admin operations
CREATE POLICY "Admins can view all profiles"
ON profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM admin_roles
    WHERE admin_roles.user_id = auth.uid()
    AND admin_roles.is_active = true
  )
);

-- Create a policy to allow users to view profiles of vendors they have orders with
CREATE POLICY "Users can view vendor profiles for their orders"
ON profiles
FOR SELECT
USING (
  -- Allow viewing profiles of vendors the user has ordered from
  EXISTS (
    SELECT 1 FROM orders o
    JOIN approved_vendors av ON av.id = o.vendor_id
    WHERE o.user_id = auth.uid()
    AND av.user_id = profiles.id
  )
  OR
  -- Allow viewing profiles of dispatchers handling their deliveries
  EXISTS (
    SELECT 1 FROM delivery_requests dr
    JOIN orders o ON o.id = dr.order_id
    JOIN approved_dispatchers ad ON ad.id = dr.dispatcher_id
    WHERE o.user_id = auth.uid()
    AND ad.user_id = profiles.id
  )
);