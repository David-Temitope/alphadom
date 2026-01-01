-- Add columns for admin gift subscription feature
ALTER TABLE approved_vendors ADD COLUMN IF NOT EXISTS gift_plan text;
ALTER TABLE approved_vendors ADD COLUMN IF NOT EXISTS gift_plan_expires_at timestamp with time zone;
ALTER TABLE approved_vendors ADD COLUMN IF NOT EXISTS gift_commission_rate numeric;
ALTER TABLE approved_vendors ADD COLUMN IF NOT EXISTS subscription_paused_at timestamp with time zone;
ALTER TABLE approved_vendors ADD COLUMN IF NOT EXISTS subscription_days_remaining integer;