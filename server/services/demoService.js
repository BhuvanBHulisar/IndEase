import bcrypt from 'bcryptjs';
import db from '../config/db.js';

const DEMO_FLEET_EMAIL  = 'demo_fleet@originode.com';
const DEMO_EXPERT_EMAIL = 'demo_expert@originode.com';
const DEMO_PASSWORD     = 'Demo@originode2026';

// ── Run once on server start ──────────────────────────────────────────────────
export async function ensureDemoSchema() {
    try {
        await db.query(`ALTER TABLE users            ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT FALSE`);
        await db.query(`ALTER TABLE machines         ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT FALSE`);
        await db.query(`ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT FALSE`);
        await db.query(`ALTER TABLE transactions     ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT FALSE`);
        await db.query(`ALTER TABLE chat_messages    ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT FALSE`);
        await db.query(`ALTER TABLE notifications    ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT FALSE`);
        await db.query(`ALTER TABLE reviews          ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT FALSE`);
        console.log('[Demo] Schema columns verified ✓');
    } catch (err) {
        console.error('[Demo] Schema migration failed:', err.message);
    }
}

// ── Upsert demo accounts ──────────────────────────────────────────────────────
export async function ensureDemoAccounts() {
    try {
        const hash = await bcrypt.hash(DEMO_PASSWORD, 10);

        for (const [email, role, firstName, lastName] of [
            [DEMO_FLEET_EMAIL,  'consumer', 'Demo', 'Fleet'],
            [DEMO_EXPERT_EMAIL, 'producer', 'Demo', 'Expert'],
        ]) {
            const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
            if (existing.rows.length === 0) {
                await db.query(
                    `INSERT INTO users (email, password, first_name, last_name, role, is_verified, is_demo)
                     VALUES ($1, $2, $3, $4, $5, TRUE, TRUE)`,
                    [email, hash, firstName, lastName, role]
                );
                console.log(`[Demo] Created account: ${email}`);
            } else {
                // Ensure is_demo flag is set
                await db.query(`UPDATE users SET is_demo = TRUE WHERE email = $1`, [email]);
            }
        }

        // Ensure expert has a producer_profile
        const expertRes = await db.query('SELECT id FROM users WHERE email = $1', [DEMO_EXPERT_EMAIL]);
        if (expertRes.rows.length > 0) {
            const expertId = expertRes.rows[0].id;
            await db.query(
                `INSERT INTO producer_profiles (user_id, skills, status, rating)
                 VALUES ($1, ARRAY['Hydraulics','CNC','Motors'], 'approved', 4.8)
                 ON CONFLICT (user_id) DO NOTHING`,
                [expertId]
            );
        }

        console.log('[Demo] Accounts ready ✓');
    } catch (err) {
        console.error('[Demo] Account setup failed:', err.message);
    }
}

// ── Seed initial demo data (machines + one open request) ─────────────────────
export async function seedDemoData() {
    try {
        const fleetRes  = await db.query('SELECT id FROM users WHERE email = $1', [DEMO_FLEET_EMAIL]);
        const expertRes = await db.query('SELECT id FROM users WHERE email = $1', [DEMO_EXPERT_EMAIL]);
        if (!fleetRes.rows.length || !expertRes.rows.length) return;

        const fleetId  = fleetRes.rows[0].id;
        const expertId = expertRes.rows[0].id;

        // Seed machines if none exist for demo fleet
        const machineCheck = await db.query('SELECT id FROM machines WHERE owner_id = $1 AND is_demo = TRUE LIMIT 1', [fleetId]);
        if (machineCheck.rows.length === 0) {
            const machines = [
                ['Hydraulic Press #08', 'Bosch Rexroth', 'Hydraulic Press', 72],
                ['CNC Lathe #03',       'Haas Automation', 'CNC Lathe',     91],
                ['Conveyor Motor #12',  'Siemens',         'Motor',         58],
            ];
            for (const [name, oem, type, score] of machines) {
                await db.query(
                    `INSERT INTO machines (owner_id, name, oem, machine_type, condition_score, is_demo)
                     VALUES ($1, $2, $3, $4, $5, TRUE)`,
                    [fleetId, name, oem, type, score]
                );
            }
            console.log('[Demo] Machines seeded ✓');
        }

        // Seed one open broadcast request if none exist
        const reqCheck = await db.query(
            `SELECT id FROM service_requests WHERE consumer_id = $1 AND is_demo = TRUE AND status = 'broadcast' LIMIT 1`,
            [fleetId]
        );
        if (reqCheck.rows.length === 0) {
            const machineRes = await db.query(
                'SELECT id FROM machines WHERE owner_id = $1 AND is_demo = TRUE LIMIT 1', [fleetId]
            );
            if (machineRes.rows.length > 0) {
                await db.query(
                    `INSERT INTO service_requests (machine_id, consumer_id, issue_description, priority, status, is_demo)
                     VALUES ($1, $2, 'Oil leakage from main cylinder seal', 'critical', 'broadcast', TRUE)`,
                    [machineRes.rows[0].id, fleetId]
                );
                console.log('[Demo] Seed request created ✓');
            }
        }
    } catch (err) {
        console.error('[Demo] Seed failed:', err.message);
    }
}

// ── Reset all demo data (keep accounts, wipe data) ───────────────────────────
export async function resetDemoData() {
    try {
        const fleetRes  = await db.query('SELECT id FROM users WHERE email = $1', [DEMO_FLEET_EMAIL]);
        const expertRes = await db.query('SELECT id FROM users WHERE email = $1', [DEMO_EXPERT_EMAIL]);
        if (!fleetRes.rows.length || !expertRes.rows.length) return { reset: false };

        const fleetId  = fleetRes.rows[0].id;
        const expertId = expertRes.rows[0].id;

        // Delete in dependency order
        await db.query(`DELETE FROM reviews          WHERE is_demo = TRUE`);
        await db.query(`DELETE FROM notifications    WHERE is_demo = TRUE`);
        await db.query(`DELETE FROM chat_messages    WHERE is_demo = TRUE`);
        await db.query(`DELETE FROM transactions     WHERE is_demo = TRUE`);
        await db.query(`DELETE FROM service_requests WHERE is_demo = TRUE`);
        await db.query(`DELETE FROM machines         WHERE is_demo = TRUE`);

        // Re-seed fresh data
        await seedDemoData();

        console.log('[Demo] Reset complete ✓');
        return { reset: true };
    } catch (err) {
        console.error('[Demo] Reset failed:', err.message);
        throw err;
    }
}

// ── Demo login — returns JWT-compatible user object ───────────────────────────
export async function getDemoUser(role) {
    const email = role === 'producer' ? DEMO_EXPERT_EMAIL : DEMO_FLEET_EMAIL;
    const res = await db.query(
        'SELECT id, email, first_name, last_name, role, is_demo FROM users WHERE email = $1',
        [email]
    );
    return res.rows[0] || null;
}
