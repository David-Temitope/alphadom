-- Fix the function search path security warning
CREATE OR REPLACE FUNCTION update_vendor_revenue()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update vendor revenue when order status changes to 'shipped'
  IF NEW.status = 'shipped' AND OLD.status != 'shipped' THEN
    UPDATE approved_vendors 
    SET 
      total_revenue = total_revenue + NEW.total_amount,
      total_orders = total_orders + 1,
      updated_at = now()
    WHERE id = NEW.vendor_id;
  END IF;
  
  RETURN NEW;
END;
$$;