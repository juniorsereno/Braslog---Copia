-- Create table: cost_centers
CREATE TABLE IF NOT EXISTS cost_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'ATIVO',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add columns to clients
ALTER TABLE clients 
  ADD COLUMN IF NOT EXISTS cost_center_id UUID NULL REFERENCES cost_centers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_key_account BOOLEAN NOT NULL DEFAULT FALSE;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_clients_cost_center_id ON clients(cost_center_id);
CREATE UNIQUE INDEX IF NOT EXISTS uix_cost_centers_name ON cost_centers(name);

-- Trigger to update updated_at on cost_centers
CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_cost_centers_updated_at ON cost_centers;
CREATE TRIGGER trg_cost_centers_updated_at
BEFORE UPDATE ON cost_centers
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp();

