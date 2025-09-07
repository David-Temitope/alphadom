-- Add receipt upload field to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS receipt_image TEXT;

-- Add vendor bank details to shop applications
ALTER TABLE public.shop_applications ADD COLUMN IF NOT EXISTS vendor_bank_details JSONB;