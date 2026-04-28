-- PROMPT 1 — Add admin_escalated column for auto-escalation tracking
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS admin_escalated BOOLEAN DEFAULT FALSE;
