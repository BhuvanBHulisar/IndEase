import db from './config/db.js';

async function check() {
    console.log("Starting");
    try {
        const res = await db.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log(res.rows);
    } catch (e) {
        console.error("DB error:", e);
    }
    process.exit();
}
check().catch(console.error);
