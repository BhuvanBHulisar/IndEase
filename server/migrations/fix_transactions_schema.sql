-- Fix transactions table: add all required columns if missing
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'payment';
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS razorpay_payout_id VARCHAR(255);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS razorpay_transfer_id VARCHAR(255);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS consumer_id UUID REFERENCES users(id);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS gst NUMERIC(10,2) DEFAULT 0;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS base_amount NUMERIC(10,2);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS platform_fee NUMERIC(10,2);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS expert_amount NUMERIC(10,2);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS job_id UUID;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS request_id UUID;
