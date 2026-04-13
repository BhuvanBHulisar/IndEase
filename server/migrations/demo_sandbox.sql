-- Demo Sandbox Migration
-- Adds is_demo flag to all relevant tables and creates demo accounts

-- 1. Add is_demo column to all relevant tables
ALTER TABLE users              ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE machines           ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE service_requests   ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE transactions       ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE chat_messages      ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE notifications      ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE reviews            ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Indexes for fast filtering
CREATE INDEX IF NOT EXISTS idx_users_is_demo              ON users(is_demo);
CREATE INDEX IF NOT EXISTS idx_machines_is_demo           ON machines(is_demo);
CREATE INDEX IF NOT EXISTS idx_service_requests_is_demo   ON service_requests(is_demo);
CREATE INDEX IF NOT EXISTS idx_transactions_is_demo       ON transactions(is_demo);

-- 3. Demo accounts (idempotent)
INSERT INTO users (email, password, first_name, last_name, role, is_verified, is_demo)
VALUES
  ('demo_fleet@originode.com',  '$2a$10$demoHashFleet000000000000000000000000000000000000000000', 'Demo', 'Fleet',  'consumer', TRUE, TRUE),
  ('demo_expert@originode.com', '$2a$10$demoHashExpert00000000000000000000000000000000000000000', 'Demo', 'Expert', 'producer', TRUE, TRUE)
ON CONFLICT (email) DO UPDATE SET is_demo = TRUE;
