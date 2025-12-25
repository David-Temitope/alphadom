-- Fix security definer view issue by setting security_invoker = true
ALTER VIEW public.shop_applications_safe SET (security_invoker = true);