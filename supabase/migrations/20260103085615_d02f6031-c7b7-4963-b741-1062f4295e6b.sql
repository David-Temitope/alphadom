-- ===========================================
-- SECURITY HARDENING: Fix RLS Policies (Part 2)
-- ===========================================

-- Fix vendor_analytics if exists - drop existing first
DROP POLICY IF EXISTS "Authenticated users can view all analytics for admin" ON public.vendor_analytics;
DROP POLICY IF EXISTS "Vendors can view own analytics" ON public.vendor_analytics;
DROP POLICY IF EXISTS "Admins can view all analytics" ON public.vendor_analytics;

-- Vendors can view only their own analytics
CREATE POLICY "Vendors can view own analytics" 
ON public.vendor_analytics 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM approved_vendors av 
    WHERE av.id = vendor_id AND av.user_id = auth.uid()
  )
);

-- Admins can view all analytics
CREATE POLICY "Admins can view all analytics" 
ON public.vendor_analytics 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Fix profiles - Remove overly permissive policy and add restrictive one
DROP POLICY IF EXISTS "Customers can view vendor profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view vendor profiles" ON public.profiles;

-- Create more restrictive vendor profile viewing
CREATE POLICY "Users can view vendor profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM approved_vendors av 
    WHERE av.user_id = profiles.id AND av.is_active = true
  )
);