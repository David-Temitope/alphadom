-- 1. Fix profiles RLS to explicitly require authentication for viewing
-- Drop existing policies that might allow implicit access
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Create explicit policy that requires authentication
CREATE POLICY "Authenticated users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE admin_roles.user_id = auth.uid() 
    AND admin_roles.is_active = true
  )
);

-- 2. Drop admin_invitations table and related objects
DROP POLICY IF EXISTS "Only super admins can create invitations" ON admin_invitations;
DROP POLICY IF EXISTS "Only super admins can delete invitations" ON admin_invitations;
DROP POLICY IF EXISTS "Only super admins can update invitations" ON admin_invitations;
DROP POLICY IF EXISTS "Only super admins can view invitations" ON admin_invitations;

-- Drop the cleanup function for invitations
DROP FUNCTION IF EXISTS cleanup_expired_admin_invitations();

-- Drop the admin_invitations table
DROP TABLE IF EXISTS admin_invitations;