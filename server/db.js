const { Pool } = require('pg');

// Create a new pool instance using environment variables
// This pool manages multiple simultaneous connections to the industrial database
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Confirmation of database linkage
pool.on('connect', () => {
    console.log('[Database] Secure connection established to PostgreSQL');
});

pool.on('error', (err) => {
    console.error('[Database] Unexpected error on idle client', err);
    process.exit(-1);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};
