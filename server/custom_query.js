import pg from 'pg';

const client = new pg.Client({
    connectionString: 'postgres://origi_node_db_user:t1hoDGTUvSaEXzovoRGmknusoCawvoOy@dpg-d6enectm5p6s739v6urg-a.oregon-postgres.render.com/origi_node_db',
    ssl: { rejectUnauthorized: false }
});

async function main() {
    try {
        await client.connect();
        let res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'notifications';");
        console.log('Notifications columns:', res.rows.map(r => r.column_name));
        res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'service_requests';");
        console.log('Service requests columns:', res.rows.map(r => r.column_name));
        res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';");
        console.log('Tables:', res.rows.map(r => r.table_name));
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}
main();
