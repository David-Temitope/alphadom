-- Create order_messages table for chat per order
CREATE TABLE public.order_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'vendor', 'dispatcher')),
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for faster lookups
CREATE INDEX idx_order_messages_order_id ON public.order_messages(order_id);
CREATE INDEX idx_order_messages_sender_id ON public.order_messages(sender_id);
CREATE INDEX idx_order_messages_created_at ON public.order_messages(created_at DESC);

-- Enable RLS
ALTER TABLE public.order_messages ENABLE ROW LEVEL SECURITY;

-- Customers can view messages for their own orders
CREATE POLICY "Customers can view their order messages"
ON public.order_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_messages.order_id 
    AND orders.user_id = auth.uid()
  )
);

-- Vendors can view messages for orders in their store
CREATE POLICY "Vendors can view their order messages"
ON public.order_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders o
    JOIN approved_vendors av ON o.vendor_id = av.id
    WHERE o.id = order_messages.order_id 
    AND av.user_id = auth.uid()
  )
);

-- Dispatchers can view messages for deliveries they're assigned to
CREATE POLICY "Dispatchers can view their delivery order messages"
ON public.order_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM delivery_requests dr
    JOIN approved_dispatchers ad ON dr.dispatcher_id = ad.id
    WHERE dr.order_id = order_messages.order_id 
    AND ad.user_id = auth.uid()
  )
);

-- Customers can send messages on their orders
CREATE POLICY "Customers can send messages on their orders"
ON public.order_messages
FOR INSERT
WITH CHECK (
  sender_id = auth.uid() 
  AND sender_type = 'customer'
  AND EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_messages.order_id 
    AND orders.user_id = auth.uid()
  )
);

-- Vendors can send messages on their orders
CREATE POLICY "Vendors can send messages on their orders"
ON public.order_messages
FOR INSERT
WITH CHECK (
  sender_id = auth.uid() 
  AND sender_type = 'vendor'
  AND EXISTS (
    SELECT 1 FROM orders o
    JOIN approved_vendors av ON o.vendor_id = av.id
    WHERE o.id = order_messages.order_id 
    AND av.user_id = auth.uid()
  )
);

-- Dispatchers can send messages on their deliveries
CREATE POLICY "Dispatchers can send messages on their deliveries"
ON public.order_messages
FOR INSERT
WITH CHECK (
  sender_id = auth.uid() 
  AND sender_type = 'dispatcher'
  AND EXISTS (
    SELECT 1 FROM delivery_requests dr
    JOIN approved_dispatchers ad ON dr.dispatcher_id = ad.id
    WHERE dr.order_id = order_messages.order_id 
    AND ad.user_id = auth.uid()
  )
);

-- Users can mark their received messages as read
CREATE POLICY "Users can update read status on their received messages"
ON public.order_messages
FOR UPDATE
USING (
  sender_id != auth.uid() AND (
    -- Customer can mark vendor/dispatcher messages as read
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_messages.order_id 
      AND orders.user_id = auth.uid()
    )
    OR
    -- Vendor can mark customer messages as read  
    EXISTS (
      SELECT 1 FROM orders o
      JOIN approved_vendors av ON o.vendor_id = av.id
      WHERE o.id = order_messages.order_id 
      AND av.user_id = auth.uid()
    )
    OR
    -- Dispatcher can mark messages as read
    EXISTS (
      SELECT 1 FROM delivery_requests dr
      JOIN approved_dispatchers ad ON dr.dispatcher_id = ad.id
      WHERE dr.order_id = order_messages.order_id 
      AND ad.user_id = auth.uid()
    )
  )
);

-- Enable realtime for order messages
ALTER PUBLICATION supabase_realtime ADD TABLE order_messages;