import 'dotenv/config';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function updateSchema() {
  try {
    console.log("Updating users table for Google OAuth...");
    
    // Add missing columns to users table
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS google_id VARCHAR(255),
      ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS provider VARCHAR(50) DEFAULT 'local';
    `);
    
    console.log("Schema updated successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Failed to update schema:", err);
    process.exit(1);
  }
}

updateSchema();
