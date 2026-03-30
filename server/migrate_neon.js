import 'dotenv/config';
import pkg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pkg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runSchema() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('[Migration] Connected to Neon database.');

        // --- Run base schema ---
        const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
        await client.query(schema);
        console.log('[Migration] Base schema applied (schema.sql).');

        // --- Additional columns added over time ---
        const migrations = [
            // Admin / soft-delete
            `ALTER TABLE users ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE`,
            `ALTER TABLE users ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE`,
            // Expert performance
            `CREATE EXTENSION IF NOT EXISTS "pgcrypto"`,
            `ALTER TABLE producer_profiles ADD COLUMN IF NOT EXISTS years_of_experience INTEGER`,
            `ALTER TABLE producer_profiles ADD COLUMN IF NOT EXISTS qualification VARCHAR(255)`,
            `ALTER TABLE producer_profiles ADD COLUMN IF NOT EXISTS service_city VARCHAR(100)`,
            `ALTER TABLE producer_profiles ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP WITH TIME ZONE`,
            // Payment / Bank
            `ALTER TABLE producer_profiles ADD COLUMN IF NOT EXISTS bank_account_number VARCHAR(50)`,
            `ALTER TABLE producer_profiles ADD COLUMN IF NOT EXISTS ifsc_code VARCHAR(20)`,
            `ALTER TABLE producer_profiles ADD COLUMN IF NOT EXISTS account_holder_name VARCHAR(100)`,
            // Transactions extended columns
            `ALTER TABLE transactions ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'job'`,
            `ALTER TABLE transactions ADD COLUMN IF NOT EXISTS expert_id UUID REFERENCES users(id) ON DELETE SET NULL`,
            `ALTER TABLE transactions ADD COLUMN IF NOT EXISTS base_amount DECIMAL(12,2)`,
            `ALTER TABLE transactions ADD COLUMN IF NOT EXISTS expert_amount DECIMAL(12,2)`,
            `ALTER TABLE transactions ADD COLUMN IF NOT EXISTS platform_fee DECIMAL(12,2)`,
            `ALTER TABLE transactions ADD COLUMN IF NOT EXISTS provider_price DECIMAL(12,2)`,
            `ALTER TABLE transactions ADD COLUMN IF NOT EXISTS provider_payout DECIMAL(12,2)`,
            `ALTER TABLE transactions ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(100)`,
            `ALTER TABLE transactions ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(100)`,
            `ALTER TABLE transactions ADD COLUMN IF NOT EXISTS razorpay_payout_id VARCHAR(100)`,
            `ALTER TABLE transactions ADD COLUMN IF NOT EXISTS razorpay_transfer_id VARCHAR(100)`,
            // Declined jobs
            `CREATE TABLE IF NOT EXISTS declined_jobs (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                request_id UUID REFERENCES service_requests(id) ON DELETE CASCADE,
                reason TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, request_id)
            )`,
            // Admin activity log
            `CREATE TABLE IF NOT EXISTS admin_activity_log (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                admin_id UUID,
                action VARCHAR(255) NOT NULL,
                target_id UUID,
                details JSONB,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )`,
            // Admin users table
            `CREATE TABLE IF NOT EXISTS admin_users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                name VARCHAR(255),
                role VARCHAR(20) DEFAULT 'admin',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )`,
        ];

        for (const sql of migrations) {
            try {
                await client.query(sql);
            } catch (err) {
                console.warn('[Migration] Skipped (may already exist):', err.message.split('\n')[0]);
            }
        }

        console.log('[Migration] All migrations applied successfully.');
        console.log('[Migration] ✅ Neon database is ready.');
    } catch (err) {
        console.error('[Migration] FAILED:', err.message);
    } finally {
        await client.end();
    }
}

runSchema();
