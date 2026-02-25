import db from './config/db.js';

async function migrate() {
    console.log('[Migration] Starting Industrial Identity Patch...');

    try {
        // 1. Patch Users Table
        const userColumns = [
            'ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100)',
            'ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(100)',
            'ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20) UNIQUE',
            'ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date DATE',
            'ALTER TABLE users ADD COLUMN IF NOT EXISTS company_name VARCHAR(255)',
            'ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE',
            'ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0',
            'ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE',
            'ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP'
        ];

        for (const sql of userColumns) {
            await db.query(sql);
        }
        console.log('[Migration] User columns synchronized.');

        // 2. Create Support Tables
        const supportTables = `
            CREATE TABLE IF NOT EXISTS auth_tokens (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                token_hash VARCHAR(255) NOT NULL,
                expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
                revoked BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS verification_tokens (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                token_hash VARCHAR(255) NOT NULL,
                type VARCHAR(20) CHECK (type IN ('email_verification', 'password_reset')),
                expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await db.query(supportTables);
        console.log('[Migration] Auth support tables verified.');

        // 3. Add Index
        await db.query('CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users (LOWER(email))');

        console.log('[Migration] Industrial Core patched successfully.');
        process.exit(0);
    } catch (err) {
        console.error('[Migration] Critical failure:', err.message);
        process.exit(1);
    }
}

migrate();
