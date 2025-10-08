-- Create table for admin password reset requests
CREATE TABLE IF NOT EXISTS admin_password_resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admin_roles(id) ON DELETE CASCADE,
  reset_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for admin invitations
CREATE TABLE IF NOT EXISTS admin_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role admin_role NOT NULL,
  invitation_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID REFERENCES admin_roles(user_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE
);

-- Create table for admin login attempts
CREATE TABLE IF NOT EXISTS admin_login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  success BOOLEAN NOT NULL,
  ip_address TEXT,
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for admin activity logs
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES admin_roles(user_id),
  action_type TEXT NOT NULL,
  action_details JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add password field to admin_roles
ALTER TABLE admin_roles ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE admin_roles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE admin_roles ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false;
ALTER TABLE admin_roles ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- Update dispatch_applications to include vendor_id
ALTER TABLE dispatch_applications ADD COLUMN IF NOT EXISTS linked_vendor_id UUID REFERENCES approved_vendors(id);
ALTER TABLE dispatch_applications ADD COLUMN IF NOT EXISTS vendor_approval_status TEXT DEFAULT 'pending';
ALTER TABLE dispatch_applications ADD COLUMN IF NOT EXISTS vendor_approved_at TIMESTAMP WITH TIME ZONE;

-- Enable RLS
ALTER TABLE admin_password_resets ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin tables
CREATE POLICY "Super admins can manage password resets"
ON admin_password_resets FOR ALL
USING (public.has_admin_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can manage invitations"
ON admin_invitations FOR ALL
USING (public.has_admin_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can view login attempts"
ON admin_login_attempts FOR SELECT
USING (public.has_admin_role(auth.uid(), 'super_admin'));

CREATE POLICY "Anyone can insert login attempts"
ON admin_login_attempts FOR INSERT
WITH CHECK (true);

CREATE POLICY "Super admins can view all activity logs"
ON admin_activity_logs FOR SELECT
USING (public.has_admin_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can view own activity logs"
ON admin_activity_logs FOR SELECT
USING (auth.uid() = admin_user_id);

CREATE POLICY "System can create activity logs"
ON admin_activity_logs FOR INSERT
WITH CHECK (true);

-- Function to log admin activity
CREATE OR REPLACE FUNCTION log_admin_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO admin_activity_logs (admin_user_id, action_type, action_details)
  VALUES (
    auth.uid(),
    TG_ARGV[0],
    jsonb_build_object(
      'table', TG_TABLE_NAME,
      'operation', TG_OP,
      'record_id', COALESCE(NEW.id, OLD.id)
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add triggers for admin activity logging
CREATE TRIGGER log_admin_role_changes
AFTER INSERT OR UPDATE OR DELETE ON admin_roles
FOR EACH ROW
EXECUTE FUNCTION log_admin_activity('admin_role_change');

-- Function to clean up expired invitations
CREATE OR REPLACE FUNCTION cleanup_expired_admin_invitations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM admin_invitations
  WHERE expires_at < NOW() AND accepted_at IS NULL;
END;
$$;