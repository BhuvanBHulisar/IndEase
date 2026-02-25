import db from './config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function initializeDatabase() {
    try {
        console.log('[Init] Starting Industrial Core Identity synchronization...');

        const sqlPath = path.join(__dirname, 'final_auth_schema.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Execute schema
        await db.query(sql);
        console.log('[Init] Schema synchronization successful. All tables created/verified.');

        // Final probe
        const tables = ['users', 'refresh_tokens', 'verification_tokens'];
        for (const table of tables) {
            await db.query(`SELECT 1 FROM ${table} LIMIT 1`);
            console.log(`[Init] Table verification: ${table} [OK]`);
        }

        process.exit(0);
    } catch (err) {
        console.error('[Init] Critical failure during database synchronization:', err.message);
        process.exit(1);
    }
}

initializeDatabase();
