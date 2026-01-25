-- ParrotKit Preorder Database Schema
-- Neon PostgreSQL

-- Preorders Table
-- Purpose: Track early access purchases with email for user identification
CREATE TABLE IF NOT EXISTS preorders (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL DEFAULT 9.99,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Additional fields for future use
  paypal_transaction_id VARCHAR(255),
  access_granted BOOLEAN DEFAULT FALSE,
  access_granted_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  
  -- Indexes
  CONSTRAINT email_unique UNIQUE (email)
);

-- Indexes for performance
CREATE INDEX idx_preorders_email ON preorders(email);
CREATE INDEX idx_preorders_created_at ON preorders(created_at DESC);
CREATE INDEX idx_preorders_access_granted ON preorders(access_granted) WHERE access_granted = FALSE;

-- Comments
COMMENT ON TABLE preorders IS 'Early access preorders with email tracking';
COMMENT ON COLUMN preorders.email IS 'User email for access delivery';
COMMENT ON COLUMN preorders.amount IS 'Payment amount (default $9.99)';
COMMENT ON COLUMN preorders.currency IS 'Payment currency (default USD)';
COMMENT ON COLUMN preorders.paypal_transaction_id IS 'PayPal transaction ID for verification';
COMMENT ON COLUMN preorders.access_granted IS 'Whether early access has been granted';
COMMENT ON COLUMN preorders.access_granted_at IS 'When access was granted';

-- Sample query to check preorders
-- SELECT * FROM preorders ORDER BY created_at DESC LIMIT 10;

-- Sample query to count pending access grants
-- SELECT COUNT(*) FROM preorders WHERE access_granted = FALSE;
