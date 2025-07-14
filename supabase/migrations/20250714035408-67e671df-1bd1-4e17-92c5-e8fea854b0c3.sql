-- Add foreign key relationship between orders and profiles
ALTER TABLE public.orders 
ADD CONSTRAINT orders_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

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

-- Create policy for admin settings (authenticated users can read, but we'll add admin role later)
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

-- Create a function to send newsletter emails
CREATE OR REPLACE FUNCTION public.send_newsletter_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- This is a placeholder for the newsletter email sending
  -- The actual email sending will be handled by an edge function
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for newsletter subscriptions
CREATE TRIGGER newsletter_notification_trigger
  AFTER INSERT ON public.newsletter_subscribers
  FOR EACH ROW EXECUTE FUNCTION public.send_newsletter_notification();