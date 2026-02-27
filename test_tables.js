import db from './server/config/db.js';

async function check() {
    const res = await db.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log(res.rows);
    process.exit();
}
check().catch(console.error);
