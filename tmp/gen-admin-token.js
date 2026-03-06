import pg from 'pg';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import path from 'path';

// Force load server/.env
dotenv.config({ path: path.resolve('server/.env') });

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
    ssl: { rejectUnauthorized: false },
});

async function run() {
    try {
        console.log('--- ADMIN TOKEN GENERATOR ---');
        console.log(`Connecting to: ${process.env.DB_NAME || 'DATABASE_URL'}`);

        const result = await pool.query("SELECT id, email, role FROM users WHERE role = 'admin' LIMIT 1");

        if (result.rows.length === 0) {
            console.error('❌ NO ADMIN USER IN DB.');
            console.log('Update a user manually: UPDATE users SET role = \'admin\' WHERE email = \'your-email@example.com\';');
            process.exit(1);
        }

        const admin = result.rows[0];
        const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;

        const token = jwt.sign(
            { id: admin.id, email: admin.email, role: admin.role },
            secret,
            { expiresIn: '30d' }
        );

        console.log('\n--- TOKEN GENERATED ---');
        console.log(token);
        console.log('\n-----------------------');
        process.exit(0);
    } catch (err) {
        console.error('ERROR:', err.message);
        process.exit(1);
    }
}

run();
