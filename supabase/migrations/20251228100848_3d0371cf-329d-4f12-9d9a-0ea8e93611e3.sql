-- Add policy for vendors to update their orders
CREATE POLICY "Vendors can update their orders" 
ON public.orders 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM approved_vendors av 
    WHERE av.id = orders.vendor_id 
    AND av.user_id = auth.uid()
  )
);