import 'dotenv/config';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fixSchema() {
  try {
    console.log("Fixing database schema mismatch...");
    
    // STEP 1 — Add password column (Rename if exists or add new)
    // Check if password_hash exists and password does NOT
    const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'");
    const cols = res.rows.map(r => r.column_name);
    
    if (cols.includes('password_hash') && !cols.includes('password')) {
        console.log("Renaming password_hash to password...");
        await pool.query("ALTER TABLE users RENAME COLUMN password_hash TO password");
    } else if (!cols.includes('password')) {
        console.log("Adding password column...");
        await pool.query("ALTER TABLE users ADD COLUMN password TEXT");
    }

    // STEP 2 — Ensure OAuth columns exist
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS google_id TEXT,
      ADD COLUMN IF NOT EXISTS provider VARCHAR(20) DEFAULT 'local',
      ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
    `);
    
    // Ensure password is not NULL (if needed) but user's snippets don't have NOT NULL
    
    console.log("Schema fixed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Failed to fix schema:", err);
    process.exit(1);
  }
}

fixSchema();
