import db from './config/db.js';
import fs from 'fs';

async function checkDb() {
    try {
        const res = await db.query('SELECT * FROM users WHERE email = $1', ['admin@originode.com']);
        const logContent = JSON.stringify(res.rows, null, 2);
        fs.writeFileSync('C:\\Users\\user2\\OneDrive\\Desktop\\OrigiNode\\server\\db_check_log.txt', logContent, 'utf8');
        process.exit(0);
    } catch (err) {
        fs.writeFileSync('C:\\Users\\user2\\OneDrive\\Desktop\\OrigiNode\\server\\db_check_log.txt', String(err), 'utf8');
        process.exit(1);
    }
}
checkDb();
