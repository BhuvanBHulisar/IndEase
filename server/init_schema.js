const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: false
    }
});

async function initSchema() {
    try {
        console.log('Connecting to database...');

        // Users Table (Ensure exists)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(50) NOT NULL,
                first_name VARCHAR(100),
                last_name VARCHAR(100),
                phone VARCHAR(20),
                dob DATE,
                photo_url TEXT,
                organization VARCHAR(255),
                location VARCHAR(255),
                tax_id VARCHAR(50),
                is_verified BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Initialize Extensions
        await pool.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

        // Users Migration (For existing tables)
        await pool.query(`
            DO $$ 
            BEGIN 
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='password') THEN
                    ALTER TABLE users RENAME COLUMN password TO password_hash;
                END IF;
            END $$;
        `);

        await pool.query(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
            ALTER TABLE users ADD COLUMN IF NOT EXISTS dob DATE;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS photo_url TEXT;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS organization VARCHAR(255);
            ALTER TABLE users ADD COLUMN IF NOT EXISTS location VARCHAR(255);
            ALTER TABLE users ADD COLUMN IF NOT EXISTS tax_id VARCHAR(50);
            ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
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
                status VARCHAR(50) DEFAULT 'broadcast', -- broadcast, accepted, payment_pending, completed
                quoted_cost DECIMAL(12,2),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Migration for quoted_cost if table already existed
        await pool.query('ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS quoted_cost DECIMAL(12,2)');

        // Producer Profiles Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS producer_profiles (
                user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                skills TEXT[],
                certifications JSONB,
                service_radius INTEGER DEFAULT 50,
                rating DECIMAL(2,1) DEFAULT 5.0,
                status VARCHAR(20) DEFAULT 'available',
                location VARCHAR(255),
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // NEW: Declined Jobs Table (To prevent jobs from reappearing on radar)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS declined_jobs (
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                request_id INTEGER REFERENCES service_requests(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (user_id, request_id)
            );
        `);

        // NEW: Chat Messages Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS chat_messages (
                id SERIAL PRIMARY KEY,
                request_id INTEGER REFERENCES service_requests(id) ON DELETE CASCADE,
                sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                message_text TEXT,
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Transactions Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS transactions (
                id SERIAL PRIMARY KEY,
                request_id INTEGER REFERENCES service_requests(id),
                transaction_ref VARCHAR(255),
                amount DECIMAL(12,2),
                status VARCHAR(50) DEFAULT 'pending', -- pending, paid, failed
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Expert Schedules Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS expert_schedules (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                request_id INTEGER REFERENCES service_requests(id) ON DELETE SET NULL,
                day_of_week VARCHAR(10), -- Mon, Tue, etc.
                start_time TIME,
                end_time TIME,
                slot_type VARCHAR(20) DEFAULT 'job', -- job, break, unavailable
                title VARCHAR(255),
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // NEW: Notifications Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                type VARCHAR(50), -- job_update, payment, chat, system
                is_read BOOLEAN DEFAULT FALSE,
                link VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // NEW: Reviews Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS reviews (
                id SERIAL PRIMARY KEY,
                request_id INTEGER UNIQUE REFERENCES service_requests(id) ON DELETE CASCADE,
                consumer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                producer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                rating INTEGER CHECK (rating >= 1 AND rating <= 5),
                comment TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Legacy Manufacturers Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS legacy_manufacturers (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                operating_years VARCHAR(100),
                status VARCHAR(50),
                replacement VARCHAR(255),
                category VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Support Tickets Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS support_tickets (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                subject VARCHAR(255),
                description TEXT,
                status VARCHAR(20) DEFAULT 'open',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
