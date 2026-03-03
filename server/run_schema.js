const fs = require('fs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        const sql = fs.readFileSync('schema.sql', 'utf8');
        await pool.query(sql);
        console.log("Schema from schema.sql created successfully!");
        process.exit(0);
    } catch (err) {
        fs.writeFileSync('schema_error.txt', err.stack || err.message);
        console.error("Failed:", err.message);
        process.exit(1);
    }
}
run();
