-- Add vendor_bank_details to shop_applications if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'shop_applications' AND column_name = 'vendor_bank_details'
  ) THEN
    ALTER TABLE shop_applications ADD COLUMN vendor_bank_details jsonb;
  END IF;
END $$;

-- Ensure products table has required columns for shipping
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'shipping_fee'
  ) THEN
    ALTER TABLE products ADD COLUMN shipping_fee numeric DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'shipping_type'
  ) THEN
    ALTER TABLE products ADD COLUMN shipping_type text DEFAULT 'one_time';
  END IF;
END $$;

-- Add vendor_user_id to orders for tracking which vendor/admin added product
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'added_by_user_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN added_by_user_id uuid;
  END IF;
END $$;

-- Add self_delivery option to orders
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'self_delivery'
  ) THEN
    ALTER TABLE orders ADD COLUMN self_delivery boolean DEFAULT false;
  END IF;
END $$;