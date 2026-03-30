import 'dotenv/config';
import pkg from 'pg';
import bcrypt from 'bcryptjs';
const { Client } = pkg;

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function seed() {
    await client.connect();
    console.log('✅ Connected to Neon.\n');

    // 1. Drop old role CHECK constraint and add new one that includes 'admin'
    await client.query(`
        ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
        ALTER TABLE users ADD CONSTRAINT users_role_check
            CHECK (role IN ('consumer', 'producer', 'admin'));
    `);
    console.log('✅ Role constraint updated to allow admin.');

    // 2. Ensure any utility columns expected by auth_tokens exist
    await client.query(`
        CREATE TABLE IF NOT EXISTS auth_tokens (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            token_hash VARCHAR(255) NOT NULL,
            revoked BOOLEAN DEFAULT FALSE,
            expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
    `);
    console.log('✅ auth_tokens table verified.');

    // 3. Upsert admin user
    const email    = 'admin@originode.com';
    const password = 'Demo@1234';
    const hash     = await bcrypt.hash(password, 10);

    const res = await client.query(`
        INSERT INTO users (email, password_hash, role, first_name, last_name)
        VALUES ($1, $2, 'admin', 'System', 'Admin')
        ON CONFLICT (email) DO UPDATE
            SET password_hash = EXCLUDED.password_hash,
                role = 'admin'
        RETURNING id, email, role
    `, [email, hash]);

    const user = res.rows[0];
    console.log('\n✅ Admin account ready:');
    console.log(`   ID    : ${user.id}`);
    console.log(`   Email : ${user.email}`);
    console.log(`   Role  : ${user.role}`);
    console.log(`   Pass  : ${password}`);

    await client.end();
    console.log('\n🚀 Database seeded. You can now log in to the admin portal.');
}

seed().catch(e => { console.error('❌', e.message); process.exit(1); });
