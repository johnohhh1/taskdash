-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TASKS POLICIES
-- ============================================

-- Public read access for demo (can be restricted later by owner)
DROP POLICY IF EXISTS "read_all_tasks" ON tasks;
CREATE POLICY "read_all_tasks" ON tasks
  FOR SELECT
  USING (true);

-- Deny direct writes by default (only service role can write)
DROP POLICY IF EXISTS "deny_writes_default" ON tasks;
CREATE POLICY "deny_writes_default" ON tasks
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- Optional: Allow authenticated users to insert/update their own tasks
-- Uncomment when ready to implement user-scoped tasks
-- DROP POLICY IF EXISTS "users_insert_own_tasks" ON tasks;
-- CREATE POLICY "users_insert_own_tasks" ON tasks
--   FOR INSERT
--   WITH CHECK (auth.uid()::text = owner);

-- DROP POLICY IF EXISTS "users_update_own_tasks" ON tasks;
-- CREATE POLICY "users_update_own_tasks" ON tasks
--   FOR UPDATE
--   USING (auth.uid()::text = owner)
--   WITH CHECK (auth.uid()::text = owner);

-- DROP POLICY IF EXISTS "users_delete_own_tasks" ON tasks;
-- CREATE POLICY "users_delete_own_tasks" ON tasks
--   FOR DELETE
--   USING (auth.uid()::text = owner);

-- ============================================
-- SYNC LOGS POLICIES
-- ============================================

-- Public read access for sync logs
DROP POLICY IF EXISTS "read_sync_logs" ON sync_logs;
CREATE POLICY "read_sync_logs" ON sync_logs
  FOR SELECT
  USING (true);

-- Deny writes by default (only service role can write)
DROP POLICY IF EXISTS "deny_sync_logs_writes" ON sync_logs;
CREATE POLICY "deny_sync_logs_writes" ON sync_logs
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Public read access for profiles
DROP POLICY IF EXISTS "read_all_profiles" ON profiles;
CREATE POLICY "read_all_profiles" ON profiles
  FOR SELECT
  USING (true);

-- Users can update their own profile
DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;
CREATE POLICY "users_update_own_profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Service role can insert profiles
DROP POLICY IF EXISTS "deny_profile_writes" ON profiles;
CREATE POLICY "deny_profile_writes" ON profiles
  FOR INSERT
  USING (false)
  WITH CHECK (false);

-- ============================================
-- GRANTS
-- ============================================

-- Grant appropriate permissions to authenticated users
GRANT SELECT ON tasks TO authenticated;
GRANT SELECT ON sync_logs TO authenticated;
GRANT SELECT, UPDATE ON profiles TO authenticated;

-- Grant all permissions to service role (implicit, but explicit is better)
GRANT ALL ON tasks TO service_role;
GRANT ALL ON sync_logs TO service_role;
GRANT ALL ON profiles TO service_role;

-- Grant select to anon users (public read)
GRANT SELECT ON tasks TO anon;
GRANT SELECT ON sync_logs TO anon;
GRANT SELECT ON profiles TO anon;
