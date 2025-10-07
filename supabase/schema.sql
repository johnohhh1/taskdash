-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TASKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  details TEXT,
  source JSONB, -- { sender, subject, date, message_id }
  due TIMESTAMPTZ,
  priority TEXT CHECK (priority IN ('High', 'Med', 'Low')) DEFAULT 'Med',
  status TEXT CHECK (status IN ('Todo', 'In Progress', 'Waiting', 'Done')) DEFAULT 'Todo',
  owner TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS tasks_due_idx ON tasks(due);
CREATE INDEX IF NOT EXISTS tasks_status_idx ON tasks(status);
CREATE INDEX IF NOT EXISTS tasks_priority_idx ON tasks(priority);
CREATE INDEX IF NOT EXISTS tasks_source_msg_idx ON tasks((source->>'message_id'));
CREATE INDEX IF NOT EXISTS tasks_owner_idx ON tasks(owner);
CREATE INDEX IF NOT EXISTS tasks_created_at_idx ON tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS tasks_updated_at_idx ON tasks(updated_at DESC);

-- ============================================
-- SYNC LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS sync_logs (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  direction TEXT CHECK (direction IN ('in', 'out')) NOT NULL,
  op TEXT,
  count INT,
  summary TEXT
);

-- Index for sync log queries
CREATE INDEX IF NOT EXISTS sync_logs_created_at_idx ON sync_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS sync_logs_direction_idx ON sync_logs(direction);

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for profile lookups
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tasks
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
