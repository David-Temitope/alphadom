-- Create user_types table for regular/vendor/dispatch classification
CREATE TABLE public.user_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('regular', 'vendor', 'dispatch')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, user_type)
);

-- Create dispatch_applications table
CREATE TABLE public.dispatch_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  dispatch_name TEXT NOT NULL,
  vehicle_type TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  availability TEXT NOT NULL,
  experience_years INTEGER,
  coverage_areas TEXT[],
  license_number TEXT,
  email TEXT NOT NULL,
  emergency_contact TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  payment_due_date TIMESTAMP WITH TIME ZONE,
  payment_received_at TIMESTAMP WITH TIME ZONE,
  payment_countdown_expires_at TIMESTAMP WITH TIME ZONE
);

-- Create approved_dispatchers table
CREATE TABLE public.approved_dispatchers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  application_id UUID NOT NULL,
  dispatch_name TEXT NOT NULL,
  vehicle_type TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  total_deliveries INTEGER NOT NULL DEFAULT 0,
  success_rate NUMERIC NOT NULL DEFAULT 0,
  rating NUMERIC NOT NULL DEFAULT 0,
  total_earnings NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create delivery_requests table
CREATE TABLE public.delivery_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL,
  dispatcher_id UUID,
  vendor_id UUID NOT NULL,
  product_details JSONB NOT NULL,
  pickup_address JSONB NOT NULL,
  delivery_address JSONB NOT NULL,
  shipping_fee NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'in_transit', 'delivered', 'cancelled')),
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  dispatcher_notes TEXT,
  vendor_notes TEXT
);

-- Create user_likes table for pilot page ratings
CREATE TABLE public.user_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  liker_id UUID NOT NULL,
  liked_user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(liker_id, liked_user_id)
);

-- Create vendor_activity_logs table for monitoring
CREATE TABLE public.vendor_activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('product_added', 'product_updated', 'product_deleted', 'order_processed', 'delivery_requested')),
  activity_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dispatch_activity_logs table for monitoring
CREATE TABLE public.dispatch_activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dispatcher_id UUID NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('availability_toggled', 'delivery_accepted', 'delivery_rejected', 'delivery_completed')),
  activity_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispatch_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approved_dispatchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispatch_activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_types
CREATE POLICY "Users can view own user types" ON public.user_types FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own user types" ON public.user_types FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated users can view all user types for admin" ON public.user_types FOR ALL USING (auth.uid() IS NOT NULL);

-- RLS Policies for dispatch_applications
CREATE POLICY "Users can view own dispatch applications" ON public.dispatch_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own dispatch applications" ON public.dispatch_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated users can view all dispatch applications for admin" ON public.dispatch_applications FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update dispatch applications for admin" ON public.dispatch_applications FOR UPDATE USING (auth.uid() IS NOT NULL);

-- RLS Policies for approved_dispatchers
CREATE POLICY "Dispatchers can view own data" ON public.approved_dispatchers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can view all dispatchers for admin" ON public.approved_dispatchers FOR ALL USING (auth.uid() IS NOT NULL);

-- RLS Policies for delivery_requests
CREATE POLICY "Vendors can view own delivery requests" ON public.delivery_requests FOR SELECT USING (EXISTS (SELECT 1 FROM approved_vendors WHERE approved_vendors.id = delivery_requests.vendor_id AND approved_vendors.user_id = auth.uid()));
CREATE POLICY "Dispatchers can view assigned delivery requests" ON public.delivery_requests FOR SELECT USING (EXISTS (SELECT 1 FROM approved_dispatchers WHERE approved_dispatchers.id = delivery_requests.dispatcher_id AND approved_dispatchers.user_id = auth.uid()));
CREATE POLICY "Vendors can create delivery requests" ON public.delivery_requests FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM approved_vendors WHERE approved_vendors.id = delivery_requests.vendor_id AND approved_vendors.user_id = auth.uid()));
CREATE POLICY "Dispatchers can update assigned delivery requests" ON public.delivery_requests FOR UPDATE USING (EXISTS (SELECT 1 FROM approved_dispatchers WHERE approved_dispatchers.id = delivery_requests.dispatcher_id AND approved_dispatchers.user_id = auth.uid()));
CREATE POLICY "Authenticated users can manage delivery requests for admin" ON public.delivery_requests FOR ALL USING (auth.uid() IS NOT NULL);

-- RLS Policies for user_likes
CREATE POLICY "Users can view all user likes" ON public.user_likes FOR SELECT USING (true);
CREATE POLICY "Users can like other users" ON public.user_likes FOR INSERT WITH CHECK (auth.uid() = liker_id AND liker_id != liked_user_id);
CREATE POLICY "Users can unlike other users" ON public.user_likes FOR DELETE USING (auth.uid() = liker_id);

-- RLS Policies for activity logs
CREATE POLICY "Vendors can view own activity logs" ON public.vendor_activity_logs FOR SELECT USING (EXISTS (SELECT 1 FROM approved_vendors WHERE approved_vendors.id = vendor_activity_logs.vendor_id AND approved_vendors.user_id = auth.uid()));
CREATE POLICY "Authenticated users can view all vendor activity logs for admin" ON public.vendor_activity_logs FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Dispatchers can view own activity logs" ON public.dispatch_activity_logs FOR SELECT USING (EXISTS (SELECT 1 FROM approved_dispatchers WHERE approved_dispatchers.id = dispatch_activity_logs.dispatcher_id AND approved_dispatchers.user_id = auth.uid()));
CREATE POLICY "Authenticated users can view all dispatch activity logs for admin" ON public.dispatch_activity_logs FOR ALL USING (auth.uid() IS NOT NULL);

-- Create triggers for updated_at columns
CREATE TRIGGER update_user_types_updated_at BEFORE UPDATE ON public.user_types FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_dispatch_applications_updated_at BEFORE UPDATE ON public.dispatch_applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_approved_dispatchers_updated_at BEFORE UPDATE ON public.approved_dispatchers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update dispatcher rating
CREATE OR REPLACE FUNCTION public.update_dispatcher_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Update dispatcher stats when delivery is completed
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    UPDATE approved_dispatchers 
    SET 
      total_deliveries = total_deliveries + 1,
      success_rate = CASE 
        WHEN total_deliveries = 0 THEN 100.0
        ELSE (total_deliveries + 1) * 100.0 / (total_deliveries + 1)
      END,
      rating = LEAST(5.0, GREATEST(1.0, 3.0 + (total_deliveries + 1) * 0.1)),
      updated_at = now()
    WHERE id = NEW.dispatcher_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for dispatcher rating updates
CREATE TRIGGER update_dispatcher_rating_trigger
  AFTER UPDATE ON public.delivery_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_dispatcher_rating();