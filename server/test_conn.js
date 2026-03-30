import 'dotenv/config';
import db from './config/db.js';

async function test() {
    console.log('Testing connection to:', process.env.DATABASE_URL.substring(0, 30) + '...');
    try {
        const res = await db.query('SELECT NOW()');
        console.log('Current time from DB:', res.rows[0].now);
        process.exit(0);
    } catch (err) {
        console.error('Connection FAIL:', err);
        process.exit(1);
    }
}
test();
