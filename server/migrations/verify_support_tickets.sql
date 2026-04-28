-- FIX 5 — Verify support_tickets table exists and check data
-- Run this SQL on Neon to verify tickets table exists and check data

-- Check if table exists and has data
SELECT id, name, email, subject, status, created_at 
FROM support_tickets 
ORDER BY created_at DESC 
LIMIT 10;

-- If this returns rows → tickets are in DB but admin portal fetch is failing (auth/CORS issue)
-- If this returns empty → DB insert is failing silently

-- Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'support_tickets'
ORDER BY ordinal_position;

-- Count tickets by status
SELECT status, COUNT(*) as count
FROM support_tickets
GROUP BY status
ORDER BY count DESC;
