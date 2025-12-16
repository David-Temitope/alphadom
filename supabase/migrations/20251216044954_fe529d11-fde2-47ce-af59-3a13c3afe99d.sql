-- Add paystack_subaccount_code column to approved_vendors
-- Commission is derived dynamically from subscription_plan, NOT stored
ALTER TABLE public.approved_vendors 
ADD COLUMN IF NOT EXISTS paystack_subaccount_code TEXT DEFAULT NULL;

-- Add comment explaining the commission derivation logic
COMMENT ON COLUMN public.approved_vendors.paystack_subaccount_code IS 'Vendor Paystack subaccount code for split payments. Commission is derived from subscription_plan: free=15%, economy=9%, first_class=5%';