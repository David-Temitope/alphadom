-- Add discount fields to products table
ALTER TABLE public.products 
ADD COLUMN has_discount BOOLEAN DEFAULT FALSE,
ADD COLUMN discount_percentage INTEGER DEFAULT 0,
ADD COLUMN original_price NUMERIC DEFAULT NULL;