-- Drop the constraint if it exists (in case it's in a broken state)
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;

-- Create the foreign key constraint from orders.user_id to profiles.id
ALTER TABLE orders 
ADD CONSTRAINT orders_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE;