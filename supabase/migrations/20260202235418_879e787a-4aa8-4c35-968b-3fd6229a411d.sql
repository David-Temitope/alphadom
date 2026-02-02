-- Drop and recreate the policy for public viewing of site settings including hero_slides
DROP POLICY IF EXISTS "Public can view site settings" ON admin_settings;

CREATE POLICY "Public can view site settings" 
ON admin_settings 
FOR SELECT 
USING (setting_key = ANY (ARRAY['site_config'::text, 'navbar_config'::text, 'hero_config'::text, 'hero_images'::text, 'hero_slides'::text]));