-- Drop the existing constraint first
ALTER TABLE dispatch_applications DROP CONSTRAINT IF EXISTS dispatch_applications_status_check;

-- Add new constraint with correct status values including 'payment'
ALTER TABLE dispatch_applications 
ADD CONSTRAINT dispatch_applications_status_check 
CHECK (status IN ('pending', 'approved', 'rejected', 'payment', 'active'));

-- Add reapplication functionality by allowing users to delete rejected applications
CREATE POLICY "Users can delete own rejected applications" 
ON dispatch_applications 
FOR DELETE 
USING (auth.uid() = user_id AND status = 'rejected');

-- Add same policy for shop applications
CREATE POLICY "Users can delete own rejected shop applications" 
ON shop_applications 
FOR DELETE 
USING (auth.uid() = user_id AND status = 'rejected');