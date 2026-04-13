-- Add city field to users for proximity matching
ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100);

-- Add broadcast timestamp to track when to escalate to global
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS first_broadcast_at TIMESTAMPTZ DEFAULT NOW();
