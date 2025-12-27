-- Add distance-based shipping fee columns to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS shipping_fee_2km_5km numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS shipping_fee_over_5km numeric DEFAULT 0;