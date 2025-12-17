-- Add customer_service role to admin_role enum
ALTER TYPE public.admin_role ADD VALUE IF NOT EXISTS 'customer_service';