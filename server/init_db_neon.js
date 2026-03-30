import 'dotenv/config';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function setup() {
  try {
    console.log("Connecting to Neon PostgreSQL...");
    
    // Drop in correct order to avoid FK issues if we want a clean slate
    // await pool.query('DROP TABLE IF EXISTS producer_profiles, machines, service_requests, chat_messages, transactions, reviews, expert_schedules, notifications, support_tickets, expert_point_events, users CASCADE');

    // 1. Users Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(100) UNIQUE NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        phone_number VARCHAR(20),
        date_of_birth DATE,
        organization VARCHAR(255),
        location VARCHAR(255),
        tax_id VARCHAR(50),
        photo_url TEXT,
        is_verified BOOLEAN DEFAULT FALSE,
        password TEXT NOT NULL,
        role VARCHAR(20) DEFAULT 'consumer',
        is_deleted BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Users table ensured.");

    // 2. Producer Profiles Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS producer_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        skills TEXT[],
        service_radius INTEGER DEFAULT 50,
        status VARCHAR(20) DEFAULT 'Offline',
        rating DECIMAL(2,1) DEFAULT 0,
        points INTEGER DEFAULT 0,
        level VARCHAR(20) DEFAULT 'Bronze',
        account_holder_name VARCHAR(255),
        account_number TEXT,
        ifsc_code VARCHAR(11),
        earnings DECIMAL(10,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Producer Profiles table ensured.");

    // 3. Machines Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS machines (
        id SERIAL PRIMARY KEY,
        owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        oem VARCHAR(255),
        model_year INTEGER,
        machine_type VARCHAR(100),
        condition_score INTEGER DEFAULT 100,
        last_service TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Machines table ensured.");

    // 4. Service Requests Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS service_requests (
        id SERIAL PRIMARY KEY,
        machine_id INTEGER REFERENCES machines(id) ON DELETE CASCADE,
        consumer_id INTEGER REFERENCES users(id),
        producer_id INTEGER REFERENCES users(id),
        issue_description TEXT,
        priority VARCHAR(20) DEFAULT 'normal',
        status VARCHAR(20) DEFAULT 'broadcast',
        quoted_cost DECIMAL(12,2),
        video_url TEXT,
        accepted_at TIMESTAMP,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Service Requests table ensured.");

    // 5. Chat Messages Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        request_id INTEGER REFERENCES service_requests(id) ON DELETE CASCADE,
        sender_id INTEGER REFERENCES users(id),
        message_text TEXT,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Chat Messages table ensured.");

    console.log("Database schema initialized successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  }
}

setup();
