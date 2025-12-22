-- Fix RLS policies for shop_applications table
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can update applications for admin" ON public.shop_applications;

-- Create proper admin-only update policy using is_admin function
CREATE POLICY "Only admins can update shop applications"
ON public.shop_applications
FOR UPDATE
USING (
  auth.uid() = user_id OR public.is_admin(auth.uid())
);

-- Fix RLS policies for admin_settings table
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can manage admin settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Authenticated users can read admin settings" ON public.admin_settings;

-- Create proper admin-only policies
CREATE POLICY "Only admins can view admin settings"
ON public.admin_settings
FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can insert admin settings"
ON public.admin_settings
FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can update admin settings"
ON public.admin_settings
FOR UPDATE
USING (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can delete admin settings"
ON public.admin_settings
FOR DELETE
USING (public.is_admin(auth.uid()));