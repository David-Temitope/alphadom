-- Create admin settings table for configurable content
CREATE TABLE public.admin_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on admin_settings
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for admin settings
CREATE POLICY "Authenticated users can read admin settings"
ON public.admin_settings
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage admin settings"
ON public.admin_settings
FOR ALL
USING (auth.uid() IS NOT NULL);

-- Insert default settings
INSERT INTO public.admin_settings (setting_key, setting_value) VALUES 
('bank_details', '{"bank_name": "First Bank", "account_name": "Pilot Company", "account_number": "1234567890", "sort_code": "123456"}'),
('hero_images', '[]'),
('site_config', '{"site_name": "Pilot", "description": "Premium quality products you can trust"}');