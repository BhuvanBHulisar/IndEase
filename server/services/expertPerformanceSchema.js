import db from '../config/db.js';
import { calculateLevel } from './expertPerformanceService.js';

export async function ensureExpertPerformanceSchema() {
    await db.query(`
        CREATE EXTENSION IF NOT EXISTS "pgcrypto";

        ALTER TABLE producer_profiles ADD COLUMN IF NOT EXISTS points INTEGER NOT NULL DEFAULT 0;
        ALTER TABLE producer_profiles ADD COLUMN IF NOT EXISTS level VARCHAR(20) NOT NULL DEFAULT 'Starter';
        ALTER TABLE producer_profiles ADD COLUMN IF NOT EXISTS level_salary INTEGER NOT NULL DEFAULT 0;
        ALTER TABLE producer_profiles ADD COLUMN IF NOT EXISTS last_active_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        ALTER TABLE producer_profiles ADD COLUMN IF NOT EXISTS years_of_experience INTEGER;
        ALTER TABLE producer_profiles ADD COLUMN IF NOT EXISTS qualification VARCHAR(255);
        ALTER TABLE producer_profiles ADD COLUMN IF NOT EXISTS service_city VARCHAR(100);

        ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP WITH TIME ZONE;
        ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;
        ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS overdue_penalty_applied BOOLEAN NOT NULL DEFAULT FALSE;

        CREATE TABLE IF NOT EXISTS expert_point_events (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            expert_id UUID REFERENCES users(id) ON DELETE CASCADE,
            point_change INTEGER NOT NULL,
            reason TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS declined_jobs (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            request_id UUID REFERENCES service_requests(id) ON DELETE CASCADE,
            reason TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, request_id)
        );
    `);

    const starter = calculateLevel(0);
    const bronze = calculateLevel(100);
    const silver = calculateLevel(300);
    const gold = calculateLevel(600);
    const elite = calculateLevel(1000);

    await db.query(
        `UPDATE producer_profiles
         SET points = COALESCE(points, 0),
             level = CASE
                 WHEN COALESCE(points, 0) >= 1000 THEN '${elite.level}'
                 WHEN COALESCE(points, 0) >= 600 THEN '${gold.level}'
                 WHEN COALESCE(points, 0) >= 300 THEN '${silver.level}'
                 WHEN COALESCE(points, 0) >= 100 THEN '${bronze.level}'
                 ELSE '${starter.level}'
             END,
             level_salary = CASE
                 WHEN COALESCE(points, 0) >= 1000 THEN ${elite.salary}
                 WHEN COALESCE(points, 0) >= 600 THEN ${gold.salary}
                 WHEN COALESCE(points, 0) >= 300 THEN ${silver.salary}
                 WHEN COALESCE(points, 0) >= 100 THEN ${bronze.salary}
                 ELSE ${starter.salary}
             END,
             last_active_date = COALESCE(last_active_date, updated_at, CURRENT_TIMESTAMP)`
    );

    await db.query(
        `UPDATE service_requests
         SET accepted_at = COALESCE(accepted_at, created_at)
         WHERE producer_id IS NOT NULL
           AND status IN ('accepted', 'in_progress', 'payment_pending', 'completed')`
    );

    await db.query(
        `UPDATE service_requests
         SET completed_at = COALESCE(completed_at, created_at)
         WHERE status = 'completed'`
    );
}
