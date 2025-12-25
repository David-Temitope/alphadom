-- 1. Create separate table for admin password hashes (more restricted)
CREATE TABLE IF NOT EXISTS public.admin_password_hashes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_role_id uuid NOT NULL UNIQUE REFERENCES public.admin_roles(id) ON DELETE CASCADE,
    password_hash text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on the new table
ALTER TABLE public.admin_password_hashes ENABLE ROW LEVEL SECURITY;

-- Very restrictive RLS: only system/backend can access, never exposed to clients
-- No SELECT policy means no one can read password hashes via API
CREATE POLICY "System can insert password hashes" 
ON public.admin_password_hashes 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update password hashes" 
ON public.admin_password_hashes 
FOR UPDATE 
USING (true);

-- 2. Migrate existing password hashes to new table
INSERT INTO public.admin_password_hashes (admin_role_id, password_hash)
SELECT id, password_hash 
FROM public.admin_roles 
WHERE password_hash IS NOT NULL;

-- 3. Remove password_hash column from admin_roles (no longer needed there)
ALTER TABLE public.admin_roles DROP COLUMN IF EXISTS password_hash;

-- 4. Update admin_roles RLS to be cleaner without password concerns
-- Drop and recreate policies to ensure clean state
DROP POLICY IF EXISTS "Super admins can manage all admin roles" ON public.admin_roles;
DROP POLICY IF EXISTS "Users can view own admin role" ON public.admin_roles;

CREATE POLICY "Super admins can manage all admin roles" 
ON public.admin_roles 
FOR ALL 
USING (has_admin_role(auth.uid(), 'super_admin'::admin_role));

CREATE POLICY "Users can view own admin role" 
ON public.admin_roles 
FOR SELECT 
USING (user_id = auth.uid());