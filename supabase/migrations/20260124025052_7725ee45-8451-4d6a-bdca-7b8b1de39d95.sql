-- Fix search_path for functions to resolve security warnings
CREATE OR REPLACE FUNCTION ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE public.user_addresses 
    SET is_default = false 
    WHERE user_id = NEW.user_id 
    AND id != NEW.id 
    AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION notify_users_on_blog_post()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.published = true AND (OLD.published IS NULL OR OLD.published = false) THEN
    INSERT INTO public.user_notifications (user_id, title, message, type, related_id)
    SELECT 
      p.id,
      'New Blog Post: ' || NEW.title,
      COALESCE(NEW.subtitle, 'Check out our latest article!'),
      'blog_post',
      NEW.id
    FROM public.profiles p
    WHERE p.id IS NOT NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;