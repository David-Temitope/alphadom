-- Drop and recreate the view without SECURITY DEFINER
DROP VIEW IF EXISTS public.vendor_profiles_public;

CREATE VIEW public.vendor_profiles_public AS
SELECT 
    p.id,
    p.full_name,
    p.avatar_url,
    p.created_at,
    av.store_name,
    av.product_category,
    av.total_products,
    av.total_orders,
    av.created_at AS vendor_since
FROM profiles p
JOIN approved_vendors av ON av.user_id = p.id
WHERE av.is_active = true;

-- Grant select access on the view
GRANT SELECT ON public.vendor_profiles_public TO anon, authenticated;