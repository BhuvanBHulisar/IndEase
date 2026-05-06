CREATE TABLE IF NOT EXISTS job_progress_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES service_requests(id) ON DELETE CASCADE,
  stage VARCHAR(30) NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE service_requests
  ADD COLUMN IF NOT EXISTS progress_stage VARCHAR(30),
  ADD COLUMN IF NOT EXISTS progress_note TEXT;

CREATE INDEX IF NOT EXISTS idx_progress_history_job_id ON job_progress_history(job_id);
