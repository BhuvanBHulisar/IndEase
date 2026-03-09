console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Loaded' : 'Missing');
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: process.env.NODE_ENV === 'production' && !process.env.DB_ALLOW_INSECURE_SSL
    }
});

pool.on('connect', () => {
    console.log('PostgreSQL connected successfully');
});

pool.on('error', (err) => {
    console.error('Unexpected PostgreSQL error:', err);
});

export default pool;
