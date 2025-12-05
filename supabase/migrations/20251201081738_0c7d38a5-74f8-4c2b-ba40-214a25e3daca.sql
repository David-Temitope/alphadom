-- Drop existing storage policies to recreate them
DROP POLICY IF EXISTS "Admins can view all receipts" ON storage.objects;
DROP POLICY IF EXISTS "Vendors can view their order receipts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload receipts" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own receipts" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own receipts" ON storage.objects;

-- Create private receipts bucket for payment receipts
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'receipts-private',
  'receipts-private',
  false,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for private receipts bucket
CREATE POLICY "Admins can view all receipts"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'receipts-private' AND
  EXISTS (
    SELECT 1 FROM admin_roles
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Vendors can view their order receipts"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'receipts-private' AND
  EXISTS (
    SELECT 1 FROM orders o
    JOIN approved_vendors av ON o.vendor_id = av.id
    WHERE av.user_id = auth.uid()
    AND storage.filename(name) LIKE '%' || o.id::text || '%'
  )
);

CREATE POLICY "Authenticated users can upload receipts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'receipts-private');

CREATE POLICY "Users can update their own receipts"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'receipts-private' AND
  (owner_id::uuid = auth.uid() OR owner IS NULL)
);

CREATE POLICY "Users can delete their own receipts"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'receipts-private' AND
  owner_id::uuid = auth.uid()
);

-- Restrict admin_invitations table access
DROP POLICY IF EXISTS "Super admins full access to invitations" ON admin_invitations;

CREATE POLICY "Only super admins can view invitations"
ON admin_invitations FOR SELECT
TO authenticated
USING (has_admin_role(auth.uid(), 'super_admin'));

CREATE POLICY "Only super admins can create invitations"
ON admin_invitations FOR INSERT
TO authenticated
WITH CHECK (has_admin_role(auth.uid(), 'super_admin'));

CREATE POLICY "Only super admins can update invitations"
ON admin_invitations FOR UPDATE
TO authenticated
USING (has_admin_role(auth.uid(), 'super_admin'));

CREATE POLICY "Only super admins can delete invitations"
ON admin_invitations FOR DELETE
TO authenticated
USING (has_admin_role(auth.uid(), 'super_admin'));

-- Update profiles RLS policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Vendors can view customer profiles for their orders" ON profiles;
DROP POLICY IF EXISTS "Customers can view vendor profiles" ON profiles;
DROP POLICY IF EXISTS "Dispatchers can view customer profiles for their deliveries" ON profiles;

CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_roles
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Vendors can view customer profiles for their orders"
ON profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM orders o
    JOIN approved_vendors av ON o.vendor_id = av.id
    WHERE av.user_id = auth.uid()
    AND o.user_id = profiles.id
  )
);

CREATE POLICY "Customers can view vendor profiles"
ON profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM approved_vendors av
    WHERE av.user_id = profiles.id
    AND av.is_active = true
  )
);

CREATE POLICY "Dispatchers can view customer profiles for their deliveries"
ON profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM delivery_requests dr
    JOIN approved_dispatchers ad ON dr.dispatcher_id = ad.id
    JOIN orders o ON dr.order_id = o.id
    WHERE ad.user_id = auth.uid()
    AND o.user_id = profiles.id
  )
);