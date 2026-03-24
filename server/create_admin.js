import 'dotenv/config';
import db from './config/db.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';

const logFile = 'C:\\Users\\user2\\OneDrive\\Desktop\\OrigiNode\\server\\create_admin_log.txt';
function log(msg) {
    fs.appendFileSync(logFile, msg + '\r\n', 'utf8');
}

async function run() {
    try {
        log('Starting v2...');
        const email = 'admin@originode.com';
        const password = 'Demo@1234';

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        log('Attempting UPDATE...');
        await db.query(`UPDATE users SET password_hash = $1, role = $2 WHERE email = $3`, [hashedPassword, 'admin', email]);
        log('UPDATE successful.');
        process.exit(0);
    } catch (err) {
        log('Failed v2: ' + (err.message || String(err)));
        process.exit(1);
    }
}

// Clear log
fs.writeFileSync(logFile, '');
run();
