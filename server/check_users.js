import 'dotenv/config';
import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function check() {
    await client.connect();
    const res = await client.query("SELECT email, role FROM users");
    console.log(JSON.stringify(res.rows, null, 2));
    await client.end();
}

check().catch(console.error);
