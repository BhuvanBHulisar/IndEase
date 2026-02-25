import 'dotenv/config';
import { Client } from 'pg';

// Build connection string if DATABASE_URL is not set
let connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  const {
    DB_USER,
    DB_PASSWORD,
    DB_HOST,
    DB_PORT,
    DB_NAME
  } = process.env;
  connectionString = `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
}

const client = new Client({
  connectionString,
  ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false }
});

const migrationSQL = `
  ALTER TABLE users
  ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE,
  ADD COLUMN IF NOT EXISTS photo_url VARCHAR(500);
`;

async function runMigration() {
  try {
    await client.connect();
    await client.query(migrationSQL);
    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
    process.exit();
  }
}

runMigration();
