-- Add delete policy for authenticated users on products table
CREATE POLICY "Authenticated users can delete products" 
ON public.products 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Add select policy for order management (admin access to profiles)
CREATE POLICY "Admin users can view profiles for order management" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Ensure orders can be properly joined with profiles
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users for order manageme" ON public.profiles;
CREATE POLICY "Profiles are viewable by authenticated users for orders" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL);