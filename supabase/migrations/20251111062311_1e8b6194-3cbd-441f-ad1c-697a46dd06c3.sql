-- Fix 1: Tighten RLS policies on profiles table to prevent email harvesting
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view vendor profiles for their orders" ON public.profiles;

-- Create a public vendor profiles view with only non-sensitive data
CREATE OR REPLACE VIEW public.vendor_profiles_public AS
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
FROM public.profiles p
JOIN public.approved_vendors av ON av.user_id = p.id
WHERE av.is_active = true;

-- Fix 2: Restrict admin_invitations table to super admins only for SELECT
DROP POLICY IF EXISTS "Super admins can manage invitations" ON public.admin_invitations;

CREATE POLICY "Super admins full access to invitations"
  ON public.admin_invitations FOR ALL
  USING (public.has_admin_role(auth.uid(), 'super_admin'::admin_role))
  WITH CHECK (public.has_admin_role(auth.uid(), 'super_admin'::admin_role));

-- Fix 3: Create private storage bucket for payment receipts
INSERT INTO storage.buckets (id, name, public) 
VALUES ('receipts', 'receipts', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for receipts bucket
CREATE POLICY "Users can upload own receipts"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'receipts' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own receipts"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'receipts' AND
    (auth.uid()::text = (storage.foldername(name))[1] OR
     public.has_admin_role(auth.uid(), 'super_admin'::admin_role))
  );

CREATE POLICY "Admins can view all receipts"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'receipts' AND
    public.has_admin_role(auth.uid(), 'super_admin'::admin_role)
  );

-- Fix 4: Add DELETE/UPDATE policies for admin_activity_logs to prevent audit log tampering
CREATE POLICY "No one can delete activity logs"
  ON public.admin_activity_logs FOR DELETE
  USING (false);

CREATE POLICY "No one can update activity logs"
  ON public.admin_activity_logs FOR UPDATE
  USING (false);