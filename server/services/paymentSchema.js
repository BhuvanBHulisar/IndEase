import db from '../config/db.js';

export async function ensurePaymentSchema() {
    console.log('[Schema] Ensuring Bank Details & Salary Payment tracking...');

    try {
        // 1. Bank details for experts
        await db.query(`
            ALTER TABLE producer_profiles 
            ADD COLUMN IF NOT EXISTS bank_account_number VARCHAR(50),
            ADD COLUMN IF NOT EXISTS ifsc_code VARCHAR(20),
            ADD COLUMN IF NOT EXISTS account_holder_name VARCHAR(100);
        `);

        // 2. Transaction Type for categorizing payouts
        await db.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transactions' AND column_name='type') THEN
                    ALTER TABLE transactions ADD COLUMN type VARCHAR(20) DEFAULT 'job';
                END IF;
            END $$;
        `);

        // 3. Razorpay Payout ID tracking (for Razorpay X)
        await db.query(`
            ALTER TABLE transactions ADD COLUMN IF NOT EXISTS razorpay_payout_id VARCHAR(100),
            ADD COLUMN IF NOT EXISTS razorpay_transfer_id VARCHAR(100);
        `);

        console.log('[Schema] Payment schema verified.');
    } catch (err) {
        console.error('[Schema] Payment schema update failed:', err);
        throw err;
    }
}
