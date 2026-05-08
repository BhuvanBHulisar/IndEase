-- Add bank detail columns to producer_profiles if they don't already exist
-- Using VARCHAR/TEXT so leading zeros in account numbers are preserved

ALTER TABLE producer_profiles
  ADD COLUMN IF NOT EXISTS bank_account_number VARCHAR(20),
  ADD COLUMN IF NOT EXISTS account_number VARCHAR(20),
  ADD COLUMN IF NOT EXISTS ifsc_code VARCHAR(11),
  ADD COLUMN IF NOT EXISTS account_holder_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS bank_account_name VARCHAR(255);

ALTER TABLE producer_profiles
  ALTER COLUMN bank_account_number TYPE VARCHAR(20) USING bank_account_number::TEXT,
  ALTER COLUMN account_number TYPE VARCHAR(20) USING account_number::TEXT,
  ALTER COLUMN ifsc_code TYPE VARCHAR(11) USING ifsc_code::TEXT;
