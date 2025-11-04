-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Super admins can manage all admin roles" ON admin_roles;

-- Create a security definer function to check admin roles without recursion
CREATE OR REPLACE FUNCTION public.has_admin_role(_user_id uuid, _role admin_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_roles
    WHERE user_id = _user_id
      AND role = _role
      AND is_active = true
  )
$$;

-- Create new policies using the security definer function
CREATE POLICY "Super admins can manage all admin roles"
ON admin_roles
FOR ALL
TO authenticated
USING (has_admin_role(auth.uid(), 'super_admin'));

-- Allow users to view their own admin role
CREATE POLICY "Users can view own admin role"
ON admin_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());