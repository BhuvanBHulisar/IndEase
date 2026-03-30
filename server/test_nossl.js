import 'dotenv/config';
import pkg from 'pg';
const { Pool } = pkg;

async function test() {
    console.log('Testing connection to fields WITH NO SSL:', process.env.DB_HOST);
    const pool = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT || 5432,
        ssl: false
    });

    try {
        const res = await pool.query('SELECT current_database(), current_user');
        console.log('Connected to:', res.rows[0]);
        process.exit(0);
    } catch (err) {
        console.error('Connection FAIL:', err.message);
        process.exit(1);
    }
}
test();
