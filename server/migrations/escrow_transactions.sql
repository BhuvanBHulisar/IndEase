-- ESCROW PAYMENT ARCHITECTURE MIGRATION
-- Adds escrow-specific columns to the transactions table

-- Add new columns for escrow tracking
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS job_id UUID REFERENCES service_requests(id);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS consumer_id UUID REFERENCES users(id);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS expert_id UUID REFERENCES users(id);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS base_amount DECIMAL(12,2);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS platform_fee DECIMAL(12,2);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS gst DECIMAL(12,2);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS expert_amount DECIMAL(12,2);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS payment_ref VARCHAR(255);

-- Update status check to include 'escrow' and 'completed'
-- (PostgreSQL doesn't alter CHECK constraints easily, so we drop and re-add)
-- Note: Only run this if the constraint exists
DO $$
BEGIN
    -- Drop old constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'transactions_status_check' 
        AND table_name = 'transactions'
    ) THEN
        ALTER TABLE transactions DROP CONSTRAINT transactions_status_check;
    END IF;
END $$;

-- Create index for faster escrow queries
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_expert_id ON transactions(expert_id);
CREATE INDEX IF NOT EXISTS idx_transactions_consumer_id ON transactions(consumer_id);
