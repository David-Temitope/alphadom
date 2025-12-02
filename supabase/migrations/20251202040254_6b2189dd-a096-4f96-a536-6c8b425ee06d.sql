-- Create a sitemap generation function to help with SEO
-- This will be used by a cron job or manual trigger to generate sitemap data

CREATE OR REPLACE FUNCTION public.generate_sitemap_data()
RETURNS TABLE (
  url text,
  lastmod timestamp with time zone,
  changefreq text,
  priority numeric
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  -- Homepage
  SELECT 
    '/' as url,
    now() as lastmod,
    'daily'::text as changefreq,
    1.0::numeric as priority
  
  UNION ALL
  
  -- Products page
  SELECT 
    '/products' as url,
    now() as lastmod,
    'hourly'::text as changefreq,
    0.9::numeric as priority
  
  UNION ALL
  
  -- Individual products
  SELECT 
    '/product/' || id as url,
    updated_at as lastmod,
    'weekly'::text as changefreq,
    0.8::numeric as priority
  FROM products
  WHERE in_stock = true
  
  UNION ALL
  
  -- Vendor profiles
  SELECT 
    '/vendor/' || user_id as url,
    updated_at as lastmod,
    'weekly'::text as changefreq,
    0.7::numeric as priority
  FROM approved_vendors
  WHERE is_active = true;
END;
$$;