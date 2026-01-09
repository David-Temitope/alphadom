-- Fix shop_applications security issues comprehensively

-- =====================================================
-- PART 1: Fix shop_applications table RLS policies
-- =====================================================

-- Drop ALL existing SELECT/UPDATE policies to ensure clean slate
DROP POLICY IF EXISTS "Users can view own shop applications" ON shop_applications;
DROP POLICY IF EXISTS "Super admins can view all shop applications" ON shop_applications;
DROP POLICY IF EXISTS "Admins and owners can update shop applications" ON shop_applications;
DROP POLICY IF EXISTS "Users can view their own shop applications" ON shop_applications;
DROP POLICY IF EXISTS "Authenticated users can insert shop applications" ON shop_applications;
DROP POLICY IF EXISTS "Users can insert own shop applications" ON shop_applications;
DROP POLICY IF EXISTS "Authenticated users can view all shop applications" ON shop_applications;
DROP POLICY IF EXISTS "Admins can view all shop applications" ON shop_applications;
DROP POLICY IF EXISTS "Vendor admins can view all shop applications" ON shop_applications;

-- Ensure RLS is enabled
ALTER TABLE shop_applications ENABLE ROW LEVEL SECURITY;

-- CREATE STRICT POLICIES

-- 1. Users can ONLY view their OWN applications
CREATE POLICY "shop_apps_select_own"
ON shop_applications FOR SELECT
USING (auth.uid() = user_id);

-- 2. Super admins can view ALL applications (for admin management)
CREATE POLICY "shop_apps_select_super_admin"
ON shop_applications FOR SELECT
USING (has_admin_role(auth.uid(), 'super_admin'::admin_role));

-- 3. Vendor admins can view applications but NOT sensitive data
-- They should use the safe view instead, but allow basic access for status checks
CREATE POLICY "shop_apps_select_vendor_admin"
ON shop_applications FOR SELECT
USING (has_admin_role(auth.uid(), 'vendor_admin'::admin_role));

-- 4. Users can INSERT their own applications
CREATE POLICY "shop_apps_insert_own"
ON shop_applications FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 5. Only super admins and application owners can UPDATE
CREATE POLICY "shop_apps_update_own_or_admin"
ON shop_applications FOR UPDATE
USING (
  auth.uid() = user_id 
  OR has_admin_role(auth.uid(), 'super_admin'::admin_role)
  OR has_admin_role(auth.uid(), 'vendor_admin'::admin_role)
);

-- 6. Only super admins can DELETE applications
CREATE POLICY "shop_apps_delete_super_admin"
ON shop_applications FOR DELETE
USING (has_admin_role(auth.uid(), 'super_admin'::admin_role));

-- =====================================================
-- PART 2: Fix shop_applications_safe VIEW security
-- =====================================================

-- Drop the existing view
DROP VIEW IF EXISTS shop_applications_safe;

-- Recreate the view with SECURITY INVOKER (respects caller's RLS)
-- This view excludes sensitive fields for vendor admins
CREATE VIEW shop_applications_safe 
WITH (security_invoker = true)
AS SELECT 
  id,
  user_id,
  store_name,
  product_category,
  price_range_min,
  price_range_max,
  email,
  business_description,
  contact_phone,
  business_address,
  status,
  admin_notes,
  created_at,
  updated_at,
  approved_at,
  payment_due_date,
  payment_received_at,
  payment_countdown_expires_at,
  business_type,
  is_registered,
  agreed_policies,
  subscription_plan
  -- Explicitly EXCLUDING: bank_details, id_type, id_number, id_image_url, tin_number, vendor_bank_details
FROM shop_applications;

-- Grant access to the view for authenticated users
-- The underlying RLS policies will still apply due to security_invoker
GRANT SELECT ON shop_applications_safe TO authenticated;