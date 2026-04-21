// run-migrations.cjs — run all pending ALTER TABLE migrations
const { Client } = require('pg');
require('dotenv').config({ path: './.env' });

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log('✅ Connected to database');

  const queries = [
    // city column
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100)`,
    // state column
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS state VARCHAR(100)`,
    // pincode column
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS pincode VARCHAR(10)`,
    // first_broadcast_at on service_requests
    `ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS first_broadcast_at TIMESTAMPTZ DEFAULT NOW()`,
  ];

  for (const q of queries) {
    try {
      await client.query(q);
      console.log('✅ Ran:', q.slice(0, 60));
    } catch (e) {
      console.error('❌ Failed:', q.slice(0, 60), e.message);
    }
  }

  await client.end();
  console.log('Done.');
}

run().catch(console.error);
