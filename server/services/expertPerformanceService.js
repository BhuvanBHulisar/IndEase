import cron from 'node-cron';
import db from '../config/db.js';

const ONE_HOUR_IN_MS = 60 * 60 * 1000;
const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function calculateLevel(points = 0) {
    const normalizedPoints = Math.max(0, Number(points) || 0);

    if (normalizedPoints >= 1000) {
        return { level: 'Elite', salary: 28000 };
    }
    if (normalizedPoints >= 600) {
        return { level: 'Gold', salary: 18000 };
    }
    if (normalizedPoints >= 300) {
        return { level: 'Silver', salary: 10000 };
    }
    if (normalizedPoints >= 100) {
        return { level: 'Bronze', salary: 5000 };
    }

    return { level: 'Starter', salary: 0 };
}

async function ensureExpertProfile(expertId, client = db) {
    await client.query(
        `INSERT INTO producer_profiles (user_id, points, level, level_salary, last_active_date)
         SELECT $1, 0, 'Starter', 0, CURRENT_TIMESTAMP
         WHERE EXISTS (
             SELECT 1
             FROM users
             WHERE id = $1
               AND role = 'producer'
         )
         ON CONFLICT (user_id) DO NOTHING`,
        [expertId]
    );
}

export async function updateExpertPoints(expertId, pointChange = 0, reason = 'Point update', clientOverride = null) {
    if (!expertId || expertId === 'demo-123') {
        const { level, salary } = calculateLevel(Math.max(0, Number(pointChange) || 0));
        return {
            expertId,
            points: Math.max(0, Number(pointChange) || 0),
            level,
            salary,
            pointChange: Number(pointChange) || 0,
            reason,
            skipped: true
        };
    }

    const client = clientOverride || await db.connect();
    const ownsClient = !clientOverride;

    try {
        if (ownsClient) {
            await client.query('BEGIN');
        }

        await ensureExpertProfile(expertId, client);

        const profileResult = await client.query(
            'SELECT points FROM producer_profiles WHERE user_id = $1 FOR UPDATE',
            [expertId]
        );

        if (profileResult.rows.length === 0) {
            if (ownsClient) {
                await client.query('COMMIT');
            }

            return null;
        }

        const currentPoints = Number(profileResult.rows[0]?.points) || 0;
        const nextPoints = Math.max(0, currentPoints + (Number(pointChange) || 0));
        const { level, salary } = calculateLevel(nextPoints);

        await client.query(
            `UPDATE producer_profiles
             SET points = $1,
                 level = $2,
                 level_salary = $3,
                 last_active_date = CURRENT_TIMESTAMP,
                 updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $4`,
            [nextPoints, level, salary, expertId]
        );

        await client.query(
            `INSERT INTO expert_point_events (expert_id, point_change, reason)
             VALUES ($1, $2, $3)`,
            [expertId, Number(pointChange) || 0, reason]
        );

        if (ownsClient) {
            await client.query('COMMIT');
        }

        return {
            expertId,
            points: nextPoints,
            level,
            salary,
            pointChange: Number(pointChange) || 0,
            reason
        };
    } catch (error) {
        if (ownsClient) {
            await client.query('ROLLBACK');
        }
        throw error;
    } finally {
        if (ownsClient) {
            client.release();
        }
    }
}

export function wasAcceptedUnderOneHour(requestCreatedAt, acceptedAt = new Date()) {
    if (!requestCreatedAt) return false;
    return new Date(acceptedAt).getTime() - new Date(requestCreatedAt).getTime() <= ONE_HOUR_IN_MS;
}

export function wasCompletedUnderTwentyFourHours(referenceStartedAt, completedAt = new Date()) {
    if (!referenceStartedAt) return false;
    return new Date(completedAt).getTime() - new Date(referenceStartedAt).getTime() <= ONE_DAY_IN_MS;
}

export async function getExpertStats(expertId) {
    if (!expertId || expertId === 'IND-00000' || expertId === 'DEMO-001' || expertId === 'expert') {
        return null;
    }

    if (expertId === 'demo-123') {
        return {
            points: 0,
            level: 'Starter',
            salary: 0,
            levelSalary: 0,
            jobsCompleted: 0,
            rating: 5,
            recentPointEvents: [],
            specialization: 'General',
            machineTypes: 'Various',
            yearsOfExperience: 5,
            city: 'Mumbai',
            qualification: 'Certified Expert',
            memberSince: new Date().toISOString()
        };
    }

    if (!UUID_REGEX.test(expertId)) {
        console.warn(`[ExpertPerformance] Invalid UUID provided: ${expertId}`);
        return null;
    }

    await ensureExpertProfile(expertId);

    const result = await db.query(
        `SELECT
            COALESCE(pp.points, 0) AS points,
            COALESCE(pp.level, 'Starter') AS level,
            COALESCE(pp.level_salary, 0) AS salary,
            COALESCE(pp.rating, 5.0) AS rating,
            COALESCE(pp.years_of_experience, 0) AS years_of_experience,
            COALESCE(pp.qualification, 'Verified Expert') AS qualification,
            COALESCE(pp.service_city, u.location, 'Not set') AS service_city,
            ARRAY_TO_STRING(pp.skills, ', ') AS skills,
            COALESCE(job_counts.completed_jobs, 0) AS jobs_completed,
            u.created_at AS member_since
         FROM users u
         LEFT JOIN producer_profiles pp ON pp.user_id = u.id
         LEFT JOIN (
             SELECT producer_id, COUNT(*)::INT AS completed_jobs
             FROM service_requests
             WHERE status = 'completed'
             GROUP BY producer_id
         ) AS job_counts ON job_counts.producer_id = u.id
         WHERE u.id = $1 AND u.role = 'producer'`,
        [expertId]
    );

    if (result.rows.length === 0) {
        return null;
    }

    const row = result.rows[0];

    const recentEventsResult = await db.query(
        `SELECT id, point_change, reason, created_at
         FROM expert_point_events
         WHERE expert_id = $1
         ORDER BY created_at DESC
         LIMIT 20`,
        [expertId]
    );

    // Calculate response time (average accepted_at - created_at)
    const timeRes = await db.query(
        `SELECT AVG(EXTRACT(EPOCH FROM (accepted_at - created_at))/3600) as avg_response_hrs
         FROM service_requests
         WHERE producer_id = $1 AND accepted_at IS NOT NULL`,
        [expertId]
    );
    const avgResponseTime = Number(timeRes.rows[0].avg_response_hrs || 2).toFixed(1);

    return {
        points: Number(row.points) || 0,
        level: row.level || 'Starter',
        salary: Number(row.salary) || 0,
        levelSalary: Number(row.salary) || 0,
        jobsCompleted: Number(row.jobs_completed) || 0,
        rating: Number(row.rating) || 5,
        yearsOfExperience: row.years_of_experience,
        qualification: row.qualification,
        city: row.service_city,
        specialization: row.skills?.split(',')[0] || 'Expert',
        machineTypes: row.skills || 'All Machinery',
        memberSince: row.member_since,
        avgResponseTime: `${avgResponseTime} hrs`,
        recentPointEvents: recentEventsResult.rows.map((r) => ({
            id: r.id,
            pointChange: Number(r.point_change) || 0,
            reason: r.reason,
            createdAt: r.created_at
        }))
    };
}

export async function getFullExpertPerformance(expertId) {
    const stats = await getExpertStats(expertId);
    if (!stats) return null;

    // 1. Acceptance Rate
    const acceptedCountRes = await db.query(`SELECT COUNT(*)::INT FROM service_requests WHERE producer_id = $1`, [expertId]);
    const declinedCountRes = await db.query(`SELECT COUNT(*)::INT FROM declined_jobs WHERE user_id = $1`, [expertId]);
    const accepted = acceptedCountRes.rows[0].count;
    const declined = declinedCountRes.rows[0].count;
    const totalRequests = accepted + declined;
    const acceptanceRate = totalRequests > 0 ? Math.round((accepted / totalRequests) * 100) : 100;

    // 2. Earnings Breakdown
    const earningsRes = await db.query(`
        SELECT 
            COALESCE(SUM(expert_amount), 0) as total_job_earnings,
            COALESCE(SUM(expert_amount) FILTER (WHERE created_at >= DATE_TRUNC('month', CURRENT_TIMESTAMP)), 0) as month_job_earnings
        FROM transactions
        WHERE expert_id = $1 AND status IN ('escrow', 'completed', 'paid') AND (type IS NULL OR type != 'salary')
    `, [expertId]);

    const salaryRes = await db.query(`
        SELECT COALESCE(SUM(amount), 0) as total_salary_paid
        FROM transactions
        WHERE expert_id = $1 AND status = 'completed' AND type = 'salary'
    `, [expertId]);

    // 3. Avg Completion Time
    const completionRes = await db.query(`
        SELECT AVG(EXTRACT(EPOCH FROM (completed_at - accepted_at))/3600) as avg_completion_hrs
        FROM service_requests
        WHERE producer_id = $1 AND status = 'completed' AND accepted_at IS NOT NULL AND completed_at IS NOT NULL
    `, [expertId]);
    const avgCompletionTime = Number(completionRes.rows[0].avg_completion_hrs || 0).toFixed(1);

    return {
        ...stats,
        acceptanceRate: `${acceptanceRate}%`,
        totalJobEarnings: Number(earningsRes.rows[0].total_job_earnings),
        monthJobEarnings: Number(earningsRes.rows[0].month_job_earnings),
        totalSalaryPaid: Number(salaryRes.rows[0].total_salary_paid),
        lifetimeEarnings: Number(earningsRes.rows[0].total_job_earnings) + Number(salaryRes.rows[0].total_salary_paid),
        avgCompletionTime: `${avgCompletionTime} hrs`,
        totalJobsDeclined: declined,
        nextSalaryDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString()
    };
}

export async function applyInactiveExpertPenalties() {
    const staleExperts = await db.query(
        `SELECT pp.user_id
         FROM producer_profiles pp
         JOIN users u ON u.id = pp.user_id
         WHERE u.role = 'producer'
           AND pp.last_active_date IS NOT NULL
           AND pp.last_active_date < NOW() - INTERVAL '10 days'`
    );

    for (const row of staleExperts.rows) {
        await updateExpertPoints(row.user_id, -20, 'Inactive for more than 10 days');
    }

    return staleExperts.rows.length;
}

export async function applyOverdueJobPenalties() {
    const client = await db.connect();

    try {
        await client.query('BEGIN');

        const overdueJobs = await client.query(
            `SELECT id, producer_id
             FROM service_requests
             WHERE producer_id IS NOT NULL
               AND status IN ('accepted', 'in_progress', 'payment_pending')
               AND accepted_at IS NOT NULL
               AND accepted_at < NOW() - INTERVAL '7 days'
               AND COALESCE(overdue_penalty_applied, FALSE) = FALSE
             FOR UPDATE SKIP LOCKED`
        );

        for (const row of overdueJobs.rows) {
            await updateExpertPoints(
                row.producer_id,
                -25,
                `Accepted job ${row.id} not completed in 7 days`,
                client
            );

            await client.query(
                `UPDATE service_requests
                 SET overdue_penalty_applied = TRUE
                 WHERE id = $1`,
                [row.id]
            );
        }

        await client.query('COMMIT');
        return overdueJobs.rows.length;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

export async function runExpertPerformanceMaintenance() {
    const inactivePenalties = await applyInactiveExpertPenalties();
    const overduePenalties = await applyOverdueJobPenalties();

    return { inactivePenalties, overduePenalties };
}

let performanceCronStarted = false;

export function startExpertPerformanceCron() {
    if (performanceCronStarted) {
        return;
    }

    cron.schedule('0 0 * * *', async () => {
        try {
            const results = await runExpertPerformanceMaintenance();
            console.log('[ExpertPerformance] Daily maintenance complete', results);
        } catch (error) {
            console.error('[ExpertPerformance] Daily maintenance failed:', error);
        }
    });

    performanceCronStarted = true;
    console.log('[ExpertPerformance] Daily cron scheduled');
}
