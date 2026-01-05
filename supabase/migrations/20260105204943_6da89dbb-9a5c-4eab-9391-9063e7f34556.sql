-- Fix SECURITY DEFINER views by setting them to SECURITY INVOKER
-- This ensures the views use the RLS policies of the querying user, not the creator

-- Recreate shop_applications_safe with SECURITY INVOKER
DROP VIEW IF EXISTS shop_applications_safe;

CREATE VIEW shop_applications_safe 
WITH (security_invoker = true) AS
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
FROM shop_applications;

-- Recreate vendor_profiles_public with SECURITY INVOKER
DROP VIEW IF EXISTS vendor_profiles_public;

CREATE VIEW vendor_profiles_public 
WITH (security_invoker = true) AS
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