import pg from 'pg';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from the server directory
const envPath = path.resolve('server/.env');
dotenv.config({ path: envPath });

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
    ssl: { rejectUnauthorized: false }
});

async function generate() {
    try {
        const res = await pool.query("SELECT id, email, role FROM users WHERE role = 'admin' LIMIT 1");
        if (res.rows.length === 0) {
            fs.writeFileSync('admin-token.txt', 'ERROR: No admin user found in database.');
            process.exit(1);
        }

        const user = res.rows[0];
        const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            secret,
            { expiresIn: '30d' }
        );

        fs.writeFileSync('admin-token.txt', token);
        console.log('Token written to admin-token.txt');
        process.exit(0);
    } catch (err) {
        fs.writeFileSync('admin-token.txt', 'ERROR: ' + err.message);
        process.exit(1);
    }
}

generate();
