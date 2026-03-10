-- Migration for payouts table
CREATE TABLE payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expert_id UUID REFERENCES users(id),
    amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending',
    requested_at TIMESTAMP DEFAULT NOW(),
    paid_at TIMESTAMP
);