-- Add zone-based shipping fee columns to products table
-- Remove distance-based columns and add zone-based columns
ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS shipping_fee_zone1 numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shipping_fee_zone2 numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shipping_fee_zone3 numeric DEFAULT 0;

-- Add comment for clarity
COMMENT ON COLUMN public.products.shipping_fee_zone1 IS 'Local zone shipping - same city/state as vendor';
COMMENT ON COLUMN public.products.shipping_fee_zone2 IS 'Regional zone shipping - neighboring states';
COMMENT ON COLUMN public.products.shipping_fee_zone3 IS 'National zone shipping - far-away states';