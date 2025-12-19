-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view all applications for admin" ON public.shop_applications;

-- Create new policy: Only admins can view all applications
CREATE POLICY "Admins can view all shop applications" 
ON public.shop_applications 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE admin_roles.user_id = auth.uid() 
    AND admin_roles.is_active = true
  )
);

-- The existing "Users can view own shop applications" policy already handles users viewing their own applications:
-- USING (auth.uid() = user_id)