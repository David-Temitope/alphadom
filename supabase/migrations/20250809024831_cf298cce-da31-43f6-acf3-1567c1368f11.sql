-- Update the calculate_order_totals function to fix shipping calculation for mixed cart items
CREATE OR REPLACE FUNCTION public.calculate_order_totals(subtotal_amount numeric, shipping_address jsonb)
 RETURNS TABLE(shipping_cost numeric, tax_amount numeric, total_amount numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  calculated_shipping DECIMAL;
  tax_rate DECIMAL := 0.08; -- 8% tax rate
  calculated_tax DECIMAL;
BEGIN
  -- Calculate shipping: free for orders >= $30, 5% of subtotal for orders < $30
  IF subtotal_amount >= 30 THEN
    calculated_shipping := 0;
  ELSE
    calculated_shipping := subtotal_amount * 0.05;
  END IF;
  
  -- Calculate tax
  calculated_tax := subtotal_amount * tax_rate;
  
  RETURN QUERY SELECT 
    calculated_shipping,
    calculated_tax,
    subtotal_amount + calculated_shipping + calculated_tax;
END;
$function$;