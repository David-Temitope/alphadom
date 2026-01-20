-- Drop the permissive INSERT policy
DROP POLICY IF EXISTS "Track login attempts" ON admin_login_attempts;

-- Create a secure function to track login attempts (SECURITY DEFINER to bypass RLS)
CREATE OR REPLACE FUNCTION public.track_admin_login_attempt(
  _email text,
  _success boolean,
  _ip_address text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
BEGIN
  -- Validate email format to prevent injection
  IF _email !~ '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  
  -- Limit email length to prevent abuse
  IF LENGTH(_email) > 255 THEN
    RAISE EXCEPTION 'Email too long';
  END IF;
  
  -- Look up the user_id from the email (if exists)
  SELECT id INTO _user_id FROM auth.users WHERE email = LOWER(TRIM(_email)) LIMIT 1;
  
  -- Insert the login attempt record
  INSERT INTO admin_login_attempts (user_id, email, success, ip_address, attempted_at)
  VALUES (_user_id, LOWER(TRIM(_email)), _success, _ip_address, now());
  
  -- Rate limiting: Check for too many failed attempts from this email in last 15 minutes
  IF NOT _success THEN
    IF (
      SELECT COUNT(*) FROM admin_login_attempts
      WHERE email = LOWER(TRIM(_email))
        AND success = false
        AND attempted_at > now() - interval '15 minutes'
    ) > 10 THEN
      -- Log excessive attempts but don't expose this to the client
      INSERT INTO admin_activity_logs (admin_user_id, action_type, action_details)
      SELECT ar.user_id, 'security_alert', jsonb_build_object(
        'type', 'excessive_login_attempts',
        'email', _email,
        'count', 'over 10 in 15 minutes'
      )
      FROM admin_roles ar
      WHERE ar.role = 'super_admin'
      LIMIT 1;
    END IF;
  END IF;
END;
$$;

-- Create a new restrictive policy that prevents direct INSERTs
-- Only the secure function can insert (via SECURITY DEFINER)
CREATE POLICY "No direct inserts to login attempts"
  ON admin_login_attempts
  FOR INSERT
  WITH CHECK (false);

-- Add comment explaining the security model
COMMENT ON FUNCTION public.track_admin_login_attempt IS 'Secure function to track admin login attempts. Direct table inserts are blocked by RLS - use this function instead.';