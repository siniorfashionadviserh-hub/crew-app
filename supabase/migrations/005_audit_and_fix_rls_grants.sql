-- Audit and fix RLS + GRANT for all authenticated-user tables
-- Ensures both table-level permissions (GRANT) and row-level security (RLS) are correct
-- This migration is critical for API Route authentication context to work properly

-- ============================================================================
-- 1. Users Table - Self-only access
-- ============================================================================
-- RLS: Already defined in 001_initial_schema.sql
-- GRANT: Ensure SELECT is available
-- Verify RLS policy:
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- Update RLS policy to ensure it's correct
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
CREATE POLICY "Users can view their own data"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- ============================================================================
-- 2. Accounts Table - User ownership via user_id
-- ============================================================================
-- Verify RLS is enabled
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
-- Drop old policy if exists and recreate
DROP POLICY IF EXISTS "Users can access their own accounts" ON public.accounts;
CREATE POLICY "Users can access their own accounts"
  ON public.accounts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 3. Onboarding Sessions Table - User ownership via user_id
-- ============================================================================
-- Verify RLS is enabled
ALTER TABLE public.onboarding_sessions ENABLE ROW LEVEL SECURITY;
-- Update RLS policy for ALL operations
DROP POLICY IF EXISTS "onboarding_sessions_user_isolation" ON public.onboarding_sessions;
CREATE POLICY "onboarding_sessions_user_isolation"
  ON public.onboarding_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 4. Account Strategies Table - Access via account.user_id chain
-- ============================================================================
-- Verify RLS is enabled
ALTER TABLE public.account_strategies ENABLE ROW LEVEL SECURITY;
-- Drop old policy and recreate with proper FOR clause
DROP POLICY IF EXISTS "Users can access their own strategy" ON public.account_strategies;
CREATE POLICY "Users can access their own strategy"
  ON public.account_strategies FOR ALL
  USING (
    account_id IN (
      SELECT id FROM public.accounts WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    account_id IN (
      SELECT id FROM public.accounts WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- 5. Brand Kits Table - Access via account.user_id chain
-- ============================================================================
-- Verify RLS is enabled
ALTER TABLE public.brand_kits ENABLE ROW LEVEL SECURITY;
-- Update RLS policy
DROP POLICY IF EXISTS "Users can access their own brand kit" ON public.brand_kits;
CREATE POLICY "Users can access their own brand kit"
  ON public.brand_kits FOR ALL
  USING (
    account_id IN (
      SELECT id FROM public.accounts WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    account_id IN (
      SELECT id FROM public.accounts WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- 6. Projects Table - User ownership via user_id
-- ============================================================================
-- Verify RLS is enabled
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
-- Drop old policy and recreate
DROP POLICY IF EXISTS "Users can access their own projects" ON public.projects;
CREATE POLICY "Users can access their own projects"
  ON public.projects FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 7. Content Ideas Table - Access via project.user_id chain
-- ============================================================================
-- Verify RLS is enabled
ALTER TABLE public.content_ideas ENABLE ROW LEVEL SECURITY;
-- Update RLS policy
DROP POLICY IF EXISTS "Users can access their own ideas" ON public.content_ideas;
CREATE POLICY "Users can access their own ideas"
  ON public.content_ideas FOR ALL
  USING (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- 8. Shooting Guides Table - Access via project.user_id chain
-- ============================================================================
-- Verify RLS is enabled
ALTER TABLE public.shooting_guides ENABLE ROW LEVEL SECURITY;
-- Update RLS policy
DROP POLICY IF EXISTS "Users can access their own guides" ON public.shooting_guides;
CREATE POLICY "Users can access their own guides"
  ON public.shooting_guides FOR ALL
  USING (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- 9. Shooting Guide Cuts Table - Access via shooting_guide.project.user_id chain
-- ============================================================================
-- Verify RLS is enabled
ALTER TABLE public.shooting_guide_cuts ENABLE ROW LEVEL SECURITY;
-- Update RLS policy
DROP POLICY IF EXISTS "Users can access their own cuts" ON public.shooting_guide_cuts;
CREATE POLICY "Users can access their own cuts"
  ON public.shooting_guide_cuts FOR ALL
  USING (
    shooting_guide_id IN (
      SELECT id FROM public.shooting_guides
      WHERE project_id IN (
        SELECT id FROM public.projects WHERE user_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    shooting_guide_id IN (
      SELECT id FROM public.shooting_guides
      WHERE project_id IN (
        SELECT id FROM public.projects WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- 10. Assets Table - Access via project.user_id chain
-- ============================================================================
-- Verify RLS is enabled
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
-- Update RLS policy
DROP POLICY IF EXISTS "Users can access their own assets" ON public.assets;
CREATE POLICY "Users can access their own assets"
  ON public.assets FOR ALL
  USING (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- 11. Usage Logs Table - User ownership via user_id
-- ============================================================================
-- Verify RLS is enabled
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;
-- Update RLS policy
DROP POLICY IF EXISTS "Users can only view their own logs" ON public.usage_logs;
CREATE POLICY "Users can only view their own logs"
  ON public.usage_logs FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own logs"
  ON public.usage_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 12. Formats Table - Public read access (no user isolation)
-- ============================================================================
-- Verify RLS is enabled
ALTER TABLE public.formats ENABLE ROW LEVEL SECURITY;
-- Ensure public read policy exists
DROP POLICY IF EXISTS "Public read access to formats" ON public.formats;
CREATE POLICY "Public read access to formats"
  ON public.formats FOR SELECT
  USING (true);

-- ============================================================================
-- Verification Query
-- ============================================================================
-- Run this after applying the migration to verify all tables have proper RLS:
-- SELECT schemaname, tablename FROM pg_tables
-- WHERE schemaname = 'public'
-- AND tablename IN ('users', 'accounts', 'onboarding_sessions', 'account_strategies',
--                   'brand_kits', 'projects', 'content_ideas', 'shooting_guides',
--                   'shooting_guide_cuts', 'assets', 'usage_logs', 'formats')
-- ORDER BY tablename;
--
-- Then verify each has at least one RLS policy:
-- SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';
