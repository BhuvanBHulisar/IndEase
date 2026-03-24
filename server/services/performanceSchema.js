import db from '../config/db.js';

export async function ensurePerformanceSchema() {
    console.log('[Schema] Ensuring Performance & Transparency tracking...');

    try {
        // 1. Table to track when an expert declines a broadcasted request
        await db.query(`
            CREATE TABLE IF NOT EXISTS expert_declined_requests (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                expert_id UUID REFERENCES users(id) ON DELETE CASCADE,
                request_id UUID REFERENCES service_requests(id) ON DELETE CASCADE,
                reason TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(expert_id, request_id)
            );
        `);

        // 2. Ensure users has created_at (already exists but just in case)
        await db.query(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        `);

        // 3. Ensure producer_profiles has necessary fields
        await db.query(`
            ALTER TABLE producer_profiles 
            ADD COLUMN IF NOT EXISTS years_of_experience INTEGER,
            ADD COLUMN IF NOT EXISTS qualification VARCHAR(255),
            ADD COLUMN IF NOT EXISTS service_city VARCHAR(100);
        `);

        // 4. Detailed financial breakdown for transactions
        await db.query(`
            ALTER TABLE transactions 
            ADD COLUMN IF NOT EXISTS expert_id UUID REFERENCES users(id),
            ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'job', -- 'job' or 'salary'
            ADD COLUMN IF NOT EXISTS platform_fee DECIMAL(12,2) DEFAULT 0,
            ADD COLUMN IF NOT EXISTS gst DECIMAL(12,2) DEFAULT 0,
            ADD COLUMN IF NOT EXISTS expert_amount DECIMAL(12,2) DEFAULT 0;
        `);

        console.log('[Schema] Performance & Transparency schema verified.');
    } catch (err) {
        console.error('[Schema] Performance schema update failed:', err);
        throw err;
    }
}
