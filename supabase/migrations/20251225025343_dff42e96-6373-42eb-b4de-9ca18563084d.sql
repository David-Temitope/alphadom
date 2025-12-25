-- Fix linter ERROR: Security Definer View
-- Make the public view run with invoker privileges to respect RLS.

ALTER VIEW public.vendor_profiles_public SET (security_invoker = true);
