import 'dotenv/config';
import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function check() {
    await client.connect();
    console.log('✅ Connected to Neon.\n');

    const tables = [
        'users', 'producer_profiles', 'machines', 'service_requests',
        'chat_messages', 'transactions', 'reviews', 'notifications',
        'expert_point_events', 'declined_jobs', 'admin_users', 'admin_activity_log'
    ];

    for (const t of tables) {
        try {
            const { rows } = await client.query(`SELECT COUNT(*) FROM ${t}`);
            console.log(`  ${t}: ${rows[0].count} rows`);
        } catch (e) {
            console.log(`  ${t}: ❌ ${e.message.split('\n')[0]}`);
        }
    }

    await client.end();
}

check().catch(console.error);
