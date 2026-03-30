import 'dotenv/config';
import pkg from 'pg';
const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL;
console.log('DATABASE_URL:', connectionString ? 'Loaded' : 'MISSING - server will fail to start');

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }, // Required for Neon (and was needed for Render too)
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 60000,
    max: 10,
});

pool.on('error', (err) => {
    console.error('[DB] Unexpected pool error:', err.message);
});

pool.on('connect', () => {
    console.log("Database connected successfully");
});

export default pool;
