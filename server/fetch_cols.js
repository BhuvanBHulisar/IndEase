import pg from 'pg';
import fs from 'fs';
const { Client } = pg;
const client = new Client({
    connectionString: 'postgres://origi_node_db_user:t1hoDGTUvSaEXzovoRGmknusoCawvoOy@dpg-d6enectm5p6s739v6urg-a.oregon-postgres.render.com/origi_node_db',
    ssl: { rejectUnauthorized: false }
});

async function main() {
    await client.connect();
    let text = "";
    try {
        let res = await client.query("SELECT * FROM service_requests LIMIT 1");
        text += "SR: " + JSON.stringify(res.rows) + "\n";
    } catch (err) {
        text += "SR ERROR: " + err.message + "\n";
    }

    try {
        let res = await client.query("SELECT * FROM notifications LIMIT 1");
        text += "NOTIF: " + JSON.stringify(res.rows) + "\n";
    } catch (err) {
        text += "NOTIF ERROR: " + err.message + "\n";
    }

    fs.writeFileSync('out.txt', text);
    await client.end();
}
main().catch(err => fs.writeFileSync('out.txt', 'FATAL: ' + err.message));
