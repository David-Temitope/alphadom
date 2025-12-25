-- Drop overly permissive profile policies that expose full customer data
DROP POLICY IF EXISTS "Vendors can view customer profiles for their orders" ON public.profiles;
DROP POLICY IF EXISTS "Dispatchers can view customer profiles for their deliveries" ON public.profiles;

-- Create secure function to get customer contact info from ORDER data (not full profiles)
-- This only returns name and phone from shipping_address for authorized parties
CREATE OR REPLACE FUNCTION public.get_order_customer_contact(_order_id uuid)
RETURNS TABLE(customer_name text, customer_phone text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.full_name as customer_name,
    (o.shipping_address->>'phone')::text as customer_phone
  FROM orders o
  JOIN profiles p ON p.id = o.user_id
  WHERE o.id = _order_id
    AND (
      -- Vendor owns the order
      EXISTS (SELECT 1 FROM approved_vendors av WHERE av.id = o.vendor_id AND av.user_id = auth.uid())
      OR
      -- Dispatcher is assigned to delivery for this order
      EXISTS (SELECT 1 FROM delivery_requests dr 
              JOIN approved_dispatchers ad ON dr.dispatcher_id = ad.id 
              WHERE dr.order_id = o.id AND ad.user_id = auth.uid())
      OR
      -- User is admin
      is_admin(auth.uid())
      OR
      -- User owns the order
      o.user_id = auth.uid()
    )
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_order_customer_contact(uuid) TO authenticated;