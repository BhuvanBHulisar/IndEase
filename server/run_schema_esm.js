import pg from 'pg';
import fs from 'fs';
const { Client } = pg;
const client = new Client({
    connectionString: 'postgres://origi_node_db_user:t1hoDGTUvSaEXzovoRGmknusoCawvoOy@dpg-d6enectm5p6s739v6urg-a.oregon-postgres.render.com/origi_node_db',
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();
        console.log("Connected to DB, reading schema.sql...");
        const sql = fs.readFileSync('schema.sql', 'utf8');
        await client.query(sql);
        console.log("SCHEMA APPLIED SUCCESSFULLY");
        fs.writeFileSync('schema_ok.txt', 'SUCCESS');
        process.exit(0);
    } catch (err) {
        fs.writeFileSync('schema_err.txt', err.stack || err.message);
        console.error("FAILED:", err);
        process.exit(1);
    }
}

run();
