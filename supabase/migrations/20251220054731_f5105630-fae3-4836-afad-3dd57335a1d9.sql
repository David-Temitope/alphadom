-- Drop existing policies on admin_login_attempts
DROP POLICY IF EXISTS "Anyone can insert login attempts" ON admin_login_attempts;
DROP POLICY IF EXISTS "Super admins can view login attempts" ON admin_login_attempts;

-- Create proper PERMISSIVE policies
-- Allow system to insert login attempts (needed for login tracking)
CREATE POLICY "System can insert login attempts"
ON admin_login_attempts
FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- Only super admins can view login attempts (PERMISSIVE policy)
CREATE POLICY "Only super admins can view login attempts"
ON admin_login_attempts
FOR SELECT
TO authenticated
USING (public.has_admin_role(auth.uid(), 'super_admin'::admin_role));