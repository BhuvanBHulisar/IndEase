-- Waitlist for service requests: experts can queue up for a job
CREATE TABLE IF NOT EXISTS job_waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
    expert_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    position INT NOT NULL DEFAULT 1,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(job_id, expert_id)
);

CREATE INDEX IF NOT EXISTS idx_waitlist_job ON job_waitlist(job_id, position ASC);
