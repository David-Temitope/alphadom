-- Check current constraint on dispatch_applications status
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE table_name = 'dispatch_applications';

-- Drop the existing constraint if it exists
ALTER TABLE dispatch_applications DROP CONSTRAINT IF EXISTS dispatch_applications_status_check;

-- Add new constraint with correct status values
ALTER TABLE dispatch_applications 
ADD CONSTRAINT dispatch_applications_status_check 
CHECK (status IN ('pending', 'approved', 'rejected', 'payment', 'active'));

-- Also add reapplication functionality by allowing users to delete rejected applications
-- Add policy to allow users to delete their own rejected applications
CREATE POLICY "Users can delete own rejected applications" 
ON dispatch_applications 
FOR DELETE 
USING (auth.uid() = user_id AND status = 'rejected');

-- Add same policy for shop applications
CREATE POLICY "Users can delete own rejected shop applications" 
ON shop_applications 
FOR DELETE 
USING (auth.uid() = user_id AND status = 'rejected');