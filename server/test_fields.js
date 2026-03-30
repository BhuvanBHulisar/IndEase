import 'dotenv/config';
import pkg from 'pg';
const { Pool } = pkg;

async function test() {
    console.log('Testing connection to fields:', process.env.DB_HOST);
    const pool = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT || 5432,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        const res = await pool.query('SELECT NOW()');
        console.log('Current time from DB:', res.rows[0].now);
        process.exit(0);
    } catch (err) {
        console.error('Connection FAIL:', err);
        process.exit(1);
    }
}
test();
