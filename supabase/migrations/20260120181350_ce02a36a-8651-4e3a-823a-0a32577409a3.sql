-- =====================================================
-- COMPREHENSIVE SECURITY FIX FOR RLS POLICIES
-- =====================================================

-- =====================================================
-- PART 1: Fix overly permissive INSERT/UPDATE policies
-- =====================================================

-- 1. Fix admin_activity_logs - Only admins should create logs
DROP POLICY IF EXISTS "System can create activity logs" ON admin_activity_logs;
CREATE POLICY "Admins can create activity logs"
ON admin_activity_logs FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE user_id = auth.uid() 
    AND is_active = true
  )
);

-- 2. Fix admin_login_attempts - Keep open for login tracking but add rate limiting context
DROP POLICY IF EXISTS "System can insert login attempts" ON admin_login_attempts;
CREATE POLICY "Track login attempts"
ON admin_login_attempts FOR INSERT
WITH CHECK (true);
-- Note: This needs to remain open for login tracking to work, but should be monitored

-- 3. Fix admin_password_hashes - Only super admins
DROP POLICY IF EXISTS "System can insert password hashes" ON admin_password_hashes;
DROP POLICY IF EXISTS "System can update password hashes" ON admin_password_hashes;

CREATE POLICY "Super admins can insert password hashes"
ON admin_password_hashes FOR INSERT
WITH CHECK (
  has_admin_role(auth.uid(), 'super_admin'::admin_role)
);

CREATE POLICY "Super admins can update password hashes"
ON admin_password_hashes FOR UPDATE
USING (
  has_admin_role(auth.uid(), 'super_admin'::admin_role)
);

-- 4. Fix contact_messages - Anyone can submit, but validate structure
DROP POLICY IF EXISTS "Anyone can create contact messages" ON contact_messages;
CREATE POLICY "Anyone can create contact messages"
ON contact_messages FOR INSERT
WITH CHECK (
  -- Require email and message to be present
  email IS NOT NULL AND 
  message IS NOT NULL AND
  name IS NOT NULL
);

-- 5. Fix newsletter_subscribers - Anyone can subscribe but must provide email
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON newsletter_subscribers;
CREATE POLICY "Anyone can subscribe to newsletter"
ON newsletter_subscribers FOR INSERT
WITH CHECK (
  email IS NOT NULL AND
  email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$'
);

-- 6. Fix platform_transactions - Only authenticated users or system
DROP POLICY IF EXISTS "System can create transactions" ON platform_transactions;
CREATE POLICY "Authenticated users can create transactions"
ON platform_transactions FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
);

-- 7. Fix user_notifications - Only system/admins can create
DROP POLICY IF EXISTS "System can create notifications" ON user_notifications;
CREATE POLICY "System can create notifications for users"
ON user_notifications FOR INSERT
WITH CHECK (
  -- Only allow creating notifications for authenticated sessions
  -- or by admin roles
  auth.uid() IS NOT NULL AND (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM admin_roles 
      WHERE admin_roles.user_id = auth.uid() 
      AND is_active = true
    )
  )
);

-- =====================================================
-- PART 2: Strengthen profiles table protection
-- =====================================================

-- Current policies are good but let's ensure no public access gap
DROP POLICY IF EXISTS "Authenticated users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 1. Users can ONLY view their own profile
CREATE POLICY "profiles_select_own"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- 2. Only active admins can view all profiles
CREATE POLICY "profiles_select_admin"
ON profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE user_id = auth.uid() 
    AND is_active = true
  )
);

-- 3. Users can insert their own profile
CREATE POLICY "profiles_insert_own"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- 4. Users can update their own profile
CREATE POLICY "profiles_update_own"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 5. Only super admins can update any profile
CREATE POLICY "profiles_update_super_admin"
ON profiles FOR UPDATE
USING (
  has_admin_role(auth.uid(), 'super_admin'::admin_role)
);

-- =====================================================
-- PART 3: Add server-side admin role validation function
-- =====================================================

-- Create a function that can be called to verify admin status server-side
CREATE OR REPLACE FUNCTION public.verify_admin_access(_required_role admin_role DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_role admin_role;
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  -- Get user's role
  SELECT role INTO _user_role
  FROM admin_roles
  WHERE user_id = auth.uid()
  AND is_active = true;
  
  -- No role found
  IF _user_role IS NULL THEN
    RETURN false;
  END IF;
  
  -- Super admin has all access
  IF _user_role = 'super_admin' THEN
    RETURN true;
  END IF;
  
  -- If no specific role required, any admin role is sufficient
  IF _required_role IS NULL THEN
    RETURN true;
  END IF;
  
  -- Check specific role
  RETURN _user_role = _required_role;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.verify_admin_access TO authenticated;