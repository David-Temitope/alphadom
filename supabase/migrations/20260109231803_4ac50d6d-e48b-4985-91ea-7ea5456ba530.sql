-- Fix shop_applications RLS policies to protect sensitive data

-- Drop all existing SELECT policies to start fresh
DROP POLICY IF EXISTS "Admins can view all shop applications" ON shop_applications;
DROP POLICY IF EXISTS "Super admins can view all shop applications with sensitive data" ON shop_applications;
DROP POLICY IF EXISTS "Vendor admins can view non-sensitive shop applications" ON shop_applications;
DROP POLICY IF EXISTS "Users can view own shop applications" ON shop_applications;
DROP POLICY IF EXISTS "Admins can update shop applications" ON shop_applications;
DROP POLICY IF EXISTS "Only admins can update shop applications" ON shop_applications;

-- Create strict SELECT policies
-- Users can ONLY view their own applications (full access to their own data)
CREATE POLICY "Users can view own shop applications"
ON shop_applications FOR SELECT
USING (auth.uid() = user_id);

-- Super admins can view ALL applications including sensitive data
CREATE POLICY "Super admins can view all shop applications"
ON shop_applications FOR SELECT
USING (has_admin_role(auth.uid(), 'super_admin'::admin_role));

-- Create a single UPDATE policy for admins and application owners
CREATE POLICY "Admins and owners can update shop applications"
ON shop_applications FOR UPDATE
USING (
  auth.uid() = user_id 
  OR has_admin_role(auth.uid(), 'super_admin'::admin_role)
  OR has_admin_role(auth.uid(), 'vendor_admin'::admin_role)
);

-- Add RLS to the safe view for vendor admins to query
-- First, create a security definer function to check if user can view shop applications
CREATE OR REPLACE FUNCTION public.can_view_shop_applications_safe()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    has_admin_role(auth.uid(), 'super_admin'::admin_role)
    OR has_admin_role(auth.uid(), 'vendor_admin'::admin_role)
$$;