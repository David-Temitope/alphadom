-- First, ensure the admin user has an entry in admin_roles table
-- Note: This assumes the admin@ecomart.com user already exists in auth.users
-- If not, they need to sign up first at the auth page

-- Create a function to safely add admin role if user exists
CREATE OR REPLACE FUNCTION add_admin_role_if_user_exists()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Try to find the admin user by email
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'admin@ecomart.com'
  LIMIT 1;
  
  -- If user exists, ensure they have super_admin role
  IF admin_user_id IS NOT NULL THEN
    -- Delete existing role if any
    DELETE FROM admin_roles WHERE user_id = admin_user_id;
    
    -- Insert super_admin role
    INSERT INTO admin_roles (user_id, role, is_active)
    VALUES (admin_user_id, 'super_admin', true);
    
    RAISE NOTICE 'Admin role added for user: %', admin_user_id;
  ELSE
    RAISE NOTICE 'Admin user admin@ecomart.com does not exist in auth.users. Please sign up first.';
  END IF;
END;
$$;

-- Execute the function
SELECT add_admin_role_if_user_exists();

-- Clean up the function
DROP FUNCTION IF EXISTS add_admin_role_if_user_exists();