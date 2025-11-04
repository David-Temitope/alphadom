-- Create the super admin user in admin_roles if it doesn't exist
-- Note: This assumes the admin@ecomart.com user already exists in auth.users
-- If not, you'll need to create it through the Supabase dashboard first

-- Insert super admin role if it doesn't exist
INSERT INTO admin_roles (user_id, role, is_active, created_by)
SELECT 
  (SELECT id FROM auth.users WHERE email = 'admin@ecomart.com' LIMIT 1),
  'super_admin'::admin_role,
  true,
  (SELECT id FROM auth.users WHERE email = 'admin@ecomart.com' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM admin_roles 
  WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@ecomart.com' LIMIT 1)
)
AND EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'admin@ecomart.com'
);