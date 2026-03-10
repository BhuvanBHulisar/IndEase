-- Migration for payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES jobs(id),
    consumer_id UUID REFERENCES users(id),
    provider_id UUID REFERENCES users(id),
    total_amount NUMERIC NOT NULL,
    platform_fee NUMERIC NOT NULL,
    gst_amount NUMERIC NOT NULL,
    expert_amount NUMERIC NOT NULL,
    payment_gateway_id TEXT,
    status TEXT DEFAULT 'escrow',
    created_at TIMESTAMP DEFAULT NOW()
);