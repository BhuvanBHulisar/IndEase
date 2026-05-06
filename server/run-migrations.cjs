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
    `ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`,
    // progress tracking columns on service_requests
    `ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS progress_stage VARCHAR(30)`,
    `ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS progress_note TEXT`,

    // job_progress_history table
    `CREATE TABLE IF NOT EXISTS job_progress_history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      job_id UUID REFERENCES service_requests(id) ON DELETE CASCADE,
      stage VARCHAR(30) NOT NULL,
      note TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )`,
    `ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS pending_confirmation_at TIMESTAMP WITH TIME ZONE`,
    `ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS completion_summary TEXT`,
    `ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS parts_actually_used TEXT`,
    `ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS follow_up_deadline TIMESTAMP WITH TIME ZONE`,
    `ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS follow_up_raised BOOLEAN DEFAULT FALSE`,
    `ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS escrow_status VARCHAR(20) DEFAULT 'none'`,
    `ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS arrived_at TIMESTAMP WITH TIME ZONE`,
    `ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS work_started_at TIMESTAMP WITH TIME ZONE`,
    `ALTER TABLE transactions ADD COLUMN IF NOT EXISTS consumer_fee DECIMAL(12,2) DEFAULT 0`,
    `ALTER TABLE transactions ADD COLUMN IF NOT EXISTS consumer_gst DECIMAL(12,2) DEFAULT 0`,
    `ALTER TABLE transactions ADD COLUMN IF NOT EXISTS expert_fee DECIMAL(12,2) DEFAULT 0`,
    `ALTER TABLE transactions ADD COLUMN IF NOT EXISTS expert_gst DECIMAL(12,2) DEFAULT 0`,
    `ALTER TABLE transactions ADD COLUMN IF NOT EXISTS platform_profit DECIMAL(12,2) DEFAULT 0`,
    `ALTER TABLE transactions ADD COLUMN IF NOT EXISTS immediate_release DECIMAL(12,2) DEFAULT 0`,
    `ALTER TABLE transactions ADD COLUMN IF NOT EXISTS hold_amount DECIMAL(12,2) DEFAULT 0`,
    `ALTER TABLE transactions ADD COLUMN IF NOT EXISTS hold_release_at TIMESTAMP`,
    `CREATE TABLE IF NOT EXISTS expert_wallets (expert_id UUID PRIMARY KEY, balance DECIMAL(12,2) DEFAULT 0, updated_at TIMESTAMP DEFAULT NOW())`,
    `ALTER TABLE expert_wallets ADD COLUMN IF NOT EXISTS pending_balance DECIMAL(12,2) DEFAULT 0`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,7)`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS longitude DECIMAL(10,7)`,
    `ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,7)`,
    `ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS longitude DECIMAL(10,7)`,
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
