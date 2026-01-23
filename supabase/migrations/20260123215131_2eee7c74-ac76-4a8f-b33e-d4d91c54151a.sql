-- Add cover_image column to approved_vendors table for store cover images
ALTER TABLE public.approved_vendors 
ADD COLUMN IF NOT EXISTS cover_image TEXT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.approved_vendors.cover_image IS 'URL for vendor store cover/banner image';