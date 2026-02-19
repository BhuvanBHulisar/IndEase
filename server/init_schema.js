require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function initSchema() {
    try {
        console.log('Connecting to database...');

        // Users Table (Ensure exists)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY, -- or UUID if using string IDs
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(50) NOT NULL,
                first_name VARCHAR(100),
                last_name VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Machines Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS machines (
                id SERIAL PRIMARY KEY,
                owner_id INTEGER REFERENCES users(id), -- Assuming integer ID for users
                name VARCHAR(255) NOT NULL,
                oem VARCHAR(255),
                model_year INTEGER,
                machine_type VARCHAR(255),
                condition_score INTEGER DEFAULT 100,
                last_service TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Service Requests Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS service_requests (
                id SERIAL PRIMARY KEY,
                machine_id INTEGER REFERENCES machines(id),
                consumer_id INTEGER REFERENCES users(id),
                producer_id INTEGER REFERENCES users(id),
                issue_description TEXT,
                priority VARCHAR(50) DEFAULT 'normal',
                video_url TEXT,
                status VARCHAR(50) DEFAULT 'broadcast', -- broadcast, accepted, completed
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('Schema initialization complete.');
        process.exit(0);
    } catch (err) {
        console.error('Schema initialization failed:', err);
        process.exit(1);
    }
}

initSchema();
