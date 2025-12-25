-- Allow guests to read only non-sensitive marketing/site settings (needed for Hero images, navbar, etc.)
-- Keeps admin-only access for all other settings.

ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view site settings" ON public.admin_settings;

CREATE POLICY "Public can view site settings"
ON public.admin_settings
FOR SELECT
TO public
USING (
  setting_key IN ('site_config', 'navbar_config', 'hero_config', 'hero_images')
);
