-- Fix 1: Restrict shop_applications policies to actual admin roles
DROP POLICY IF EXISTS "Authenticated users can view all shop applications for admi" ON public.shop_applications;
DROP POLICY IF EXISTS "Authenticated users can update shop applications for admin" ON public.shop_applications;

-- Only admins can view all shop applications (not any authenticated user)
CREATE POLICY "Admins can view all shop applications"
ON public.shop_applications
FOR SELECT
USING (is_admin(auth.uid()));

-- Only admins can update shop applications
CREATE POLICY "Admins can update shop applications"
ON public.shop_applications
FOR UPDATE
USING (is_admin(auth.uid()) OR auth.uid() = user_id);

-- Fix 2: Restrict newsletter_subscribers viewing to admin roles only
DROP POLICY IF EXISTS "Authenticated users can view subscribers" ON public.newsletter_subscribers;

-- Only admins can view newsletter subscribers
CREATE POLICY "Only admins can view newsletter subscribers"
ON public.newsletter_subscribers
FOR SELECT
USING (is_admin(auth.uid()));

-- Allow admins to manage subscribers (update/delete)
CREATE POLICY "Only admins can update newsletter subscribers"
ON public.newsletter_subscribers
FOR UPDATE
USING (is_admin(auth.uid()));

CREATE POLICY "Only admins can delete newsletter subscribers"
ON public.newsletter_subscribers
FOR DELETE
USING (is_admin(auth.uid()));