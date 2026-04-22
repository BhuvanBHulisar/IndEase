import "dotenv/config";
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load env from server/.env
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, 'server', '.env') });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

async function cleanDB() {
  try {
    const result = await pool.query(`
      UPDATE service_requests 
      SET video_url = NULL 
      WHERE video_url LIKE '%commondatastorage.googleapis.com%'
         OR video_url LIKE '%mixkit.co%'
         OR video_url LIKE '%gtv-videos-bucket%'
    `);
    console.log("Successfully cleaned DB:", result.rowCount, "rows updated.");
    process.exit(0);
  } catch (err) {
    console.error("DB clean failed:", err);
    process.exit(1);
  }
}

cleanDB();
