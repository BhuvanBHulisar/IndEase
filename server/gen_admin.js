import db from './config/db.js';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

async function generate() {
    try {
        const res = await db.query("SELECT id, email, role FROM users WHERE role = 'admin' LIMIT 1");
        if (res.rows.length === 0) {
            console.log('ERROR: No admin user found in database.');
            process.exit(1);
        }

        const user = res.rows[0];
        const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;

        if (!secret) {
            console.log('ERROR: JWT secret not found in .env');
            process.exit(1);
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            secret,
            { expiresIn: '30d' }
        );

        console.log('--- ADMIN TOKEN START ---');
        console.log(token);
        console.log('--- ADMIN TOKEN END ---');
        process.exit(0);
    } catch (err) {
        console.error('ERROR: ' + err.message);
        process.exit(1);
    }
}

generate();
