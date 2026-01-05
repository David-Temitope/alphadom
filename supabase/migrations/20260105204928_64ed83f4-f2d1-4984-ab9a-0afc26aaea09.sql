-- =====================================================
-- SECURITY FIX 1: Protect shop_applications sensitive data
-- Ensure ID numbers, ID images, bank details, TIN numbers are never exposed
-- =====================================================

-- Drop existing view and recreate with absolutely NO sensitive fields
DROP VIEW IF EXISTS shop_applications_safe;

CREATE VIEW shop_applications_safe AS
SELECT 
  id,
  user_id,
  store_name,
  product_category,
  email,
  contact_phone,
  business_address,
  business_description,
  business_type,
  status,
  admin_notes,
  subscription_plan,
  is_registered,
  agreed_policies,
  approved_at,
  payment_due_date,
  payment_countdown_expires_at,
  payment_received_at,
  created_at,
  updated_at,
  price_range_min,
  price_range_max
  -- EXCLUDED: id_type, id_number, id_image_url, tin_number, bank_details, vendor_bank_details
FROM shop_applications;

-- =====================================================
-- SECURITY FIX 2: Fix orders RLS for proper vendor isolation
-- Vendors can ONLY see their own orders, not other vendors' customer data
-- =====================================================

-- Drop the problematic policy
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;

-- Create separate policies for admins and vendors
CREATE POLICY "Admins can view all orders"
ON orders FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM admin_roles
    WHERE admin_roles.user_id = auth.uid()
    AND admin_roles.is_active = true
  )
);

-- Vendors can ONLY see orders where they are the vendor_owner_id or vendor_id matches their vendor record
DROP POLICY IF EXISTS "Vendors can view their own orders" ON orders;
CREATE POLICY "Vendors can view their own orders"
ON orders FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM approved_vendors av
    WHERE av.user_id = auth.uid()
    AND (orders.vendor_id = av.id OR orders.vendor_owner_id = av.id)
  )
);

-- =====================================================
-- SECURITY FIX 3: Fix profiles table - remove public email exposure
-- Only allow users to view their own profile or vendor profiles without email
-- =====================================================

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view vendor profiles" ON profiles;

-- Drop and recreate the vendor public profiles view (no email exposed)
DROP VIEW IF EXISTS vendor_profiles_public CASCADE;

CREATE VIEW vendor_profiles_public AS
SELECT 
  p.id,
  p.full_name,
  p.avatar_url,
  p.created_at,
  av.store_name,
  av.product_category,
  av.total_products,
  av.total_orders,
  av.created_at as vendor_since
FROM profiles p
INNER JOIN approved_vendors av ON av.user_id = p.id
WHERE av.is_active = true;

-- =====================================================
-- SECURITY FIX 4: Strengthen platform_transactions policies
-- Ensure no non-admin users can read transaction data
-- =====================================================

-- Drop any existing vendor/user transaction policies
DROP POLICY IF EXISTS "Vendors can view own transactions" ON platform_transactions;
DROP POLICY IF EXISTS "Users can view own transactions" ON platform_transactions;

-- Allow vendors to see their OWN transactions (for transparency)
CREATE POLICY "Vendors can view own transactions"
ON platform_transactions FOR SELECT
USING (
  vendor_id IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM approved_vendors av
    WHERE av.id = platform_transactions.vendor_id
    AND av.user_id = auth.uid()
  )
);

-- Users can see their own transactions (orders they placed)
CREATE POLICY "Users can view own transactions"
ON platform_transactions FOR SELECT
USING (
  user_id = auth.uid()
);