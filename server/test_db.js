const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: 'originode_db',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});
pool.query('SELECT 1').then(() => {
    console.log("Connected successfully!");
    process.exit(0);
}).catch(err => {
    require('fs').writeFileSync('db_error.txt', err.stack || err.message);
    console.error("Connection failed:", err.message);
    process.exit(1);
});
