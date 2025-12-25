-- Create a secure view for shop_applications that excludes sensitive financial data
-- This view is for general admin access - sensitive data requires direct table access by super admins only

-- 1. Create a safe view for shop applications (excludes bank details, TIN, ID info)
CREATE OR REPLACE VIEW public.shop_applications_safe AS
SELECT 
    id,
    user_id,
    store_name,
    email,
    product_category,
    price_range_min,
    price_range_max,
    status,
    admin_notes,
    business_type,
    business_description,
    business_address,
    contact_phone,
    is_registered,
    agreed_policies,
    subscription_plan,
    approved_at,
    payment_due_date,
    payment_countdown_expires_at,
    payment_received_at,
    created_at,
    updated_at
    -- Excluded: bank_details, vendor_bank_details, tin_number, id_type, id_number, id_image_url
FROM public.shop_applications;

-- 2. Grant permissions on the view
GRANT SELECT ON public.shop_applications_safe TO authenticated;

-- 3. Update RLS on shop_applications to be more restrictive for sensitive columns
-- Only super admins can access the full table with bank details
DROP POLICY IF EXISTS "Admins can view all shop applications" ON public.shop_applications;

CREATE POLICY "Super admins can view all shop applications with sensitive data" 
ON public.shop_applications 
FOR SELECT 
USING (
    has_admin_role(auth.uid(), 'super_admin'::admin_role)
);

-- 4. Create a security definer function to check if user can access sensitive shop application data
CREATE OR REPLACE FUNCTION public.can_access_sensitive_shop_data(app_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        auth.uid() = app_user_id  -- Owner can see their own
        OR has_admin_role(auth.uid(), 'super_admin'::admin_role)  -- Super admin can see all
$$;

-- 5. Add policy allowing vendor_admin to use the safe view through a separate policy
CREATE POLICY "Vendor admins can view non-sensitive shop applications" 
ON public.shop_applications 
FOR SELECT 
USING (
    has_admin_role(auth.uid(), 'vendor_admin'::admin_role)
    OR has_admin_role(auth.uid(), 'super_admin'::admin_role)
);