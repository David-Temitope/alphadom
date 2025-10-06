-- Create enum for admin roles
CREATE TYPE admin_role AS ENUM ('super_admin', 'vendor_admin', 'dispatch_admin', 'user_admin', 'orders_admin');

-- Create admin_roles table for role-based access
CREATE TABLE admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role admin_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id)
);

-- Enable RLS on admin_roles
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;

-- Super admins can manage all roles
CREATE POLICY "Super admins can manage all admin roles"
ON admin_roles FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM admin_roles ar
    WHERE ar.user_id = auth.uid() AND ar.role = 'super_admin'
  )
);

-- Add product_slots to approved_vendors for pay-per-slot model
ALTER TABLE approved_vendors
ADD COLUMN IF NOT EXISTS product_slots INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS used_slots INTEGER DEFAULT 0;

-- Add vendor_id to approved_dispatchers (dispatch linked to vendor)
ALTER TABLE approved_dispatchers
ADD COLUMN IF NOT EXISTS linked_vendor_id UUID REFERENCES approved_vendors(id) ON DELETE SET NULL;

-- Update orders table to track which vendor the order belongs to
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS vendor_owner_id UUID REFERENCES approved_vendors(id);

-- Function to check admin role
CREATE OR REPLACE FUNCTION has_admin_role(_user_id UUID, _role admin_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to check if user has any admin role
CREATE OR REPLACE FUNCTION is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_roles WHERE user_id = _user_id
  )
$$;

-- Function to get user's admin role
CREATE OR REPLACE FUNCTION get_admin_role(_user_id UUID)
RETURNS admin_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM admin_roles WHERE user_id = _user_id LIMIT 1
$$;

-- Update products vendor_id to allow NULL (for admin-added products)
-- No need to alter if it already exists and is nullable

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_admin_roles_user_id ON admin_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_vendor_owner ON orders(vendor_owner_id);
CREATE INDEX IF NOT EXISTS idx_dispatchers_vendor ON approved_dispatchers(linked_vendor_id);