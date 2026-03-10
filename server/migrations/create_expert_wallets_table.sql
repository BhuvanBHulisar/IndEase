-- Migration for expert_wallets table
CREATE TABLE expert_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expert_id UUID REFERENCES users(id),
    balance NUMERIC DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW()
);