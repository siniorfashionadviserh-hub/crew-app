-- Fix table privileges for authenticated role (RLS + GRANT model)
-- This migration ensures authenticated users can perform required operations on their own data

-- ============================================================================
-- Onboarding Sessions Table - Required operations: SELECT, INSERT, UPDATE
-- ============================================================================
GRANT SELECT ON public.onboarding_sessions TO authenticated;
GRANT INSERT ON public.onboarding_sessions TO authenticated;
GRANT UPDATE ON public.onboarding_sessions TO authenticated;

-- ============================================================================
-- Accounts Table - Required operations: INSERT
-- ============================================================================
GRANT SELECT ON public.accounts TO authenticated;
GRANT INSERT ON public.accounts TO authenticated;
GRANT UPDATE ON public.accounts TO authenticated;

-- ============================================================================
-- Account Strategies Table - Required operations: INSERT, UPDATE
-- ============================================================================
GRANT SELECT ON public.account_strategies TO authenticated;
GRANT INSERT ON public.account_strategies TO authenticated;
GRANT UPDATE ON public.account_strategies TO authenticated;

-- ============================================================================
-- Brand Kits Table - Required operations: INSERT
-- ============================================================================
GRANT SELECT ON public.brand_kits TO authenticated;
GRANT INSERT ON public.brand_kits TO authenticated;
GRANT UPDATE ON public.brand_kits TO authenticated;

-- ============================================================================
-- Users Table - Required operations: SELECT (self only via RLS)
-- ============================================================================
GRANT SELECT ON public.users TO authenticated;

-- ============================================================================
-- Formats Table - Required operations: SELECT (already public, but explicit)
-- ============================================================================
GRANT SELECT ON public.formats TO authenticated;

-- ============================================================================
-- Usage Logs Table - Required operations: INSERT, SELECT
-- ============================================================================
GRANT SELECT ON public.usage_logs TO authenticated;
GRANT INSERT ON public.usage_logs TO authenticated;

-- ============================================================================
-- Projects Table - Required operations: SELECT, INSERT, UPDATE
-- (included for future use in content creation flow)
-- ============================================================================
GRANT SELECT ON public.projects TO authenticated;
GRANT INSERT ON public.projects TO authenticated;
GRANT UPDATE ON public.projects TO authenticated;

-- ============================================================================
-- Related tables for projects flow (for future content creation)
-- ============================================================================
GRANT SELECT ON public.content_ideas TO authenticated;
GRANT INSERT ON public.content_ideas TO authenticated;
GRANT UPDATE ON public.content_ideas TO authenticated;

GRANT SELECT ON public.shooting_guides TO authenticated;
GRANT INSERT ON public.shooting_guides TO authenticated;
GRANT UPDATE ON public.shooting_guides TO authenticated;

GRANT SELECT ON public.shooting_guide_cuts TO authenticated;
GRANT INSERT ON public.shooting_guide_cuts TO authenticated;
GRANT UPDATE ON public.shooting_guide_cuts TO authenticated;

GRANT SELECT ON public.assets TO authenticated;
GRANT INSERT ON public.assets TO authenticated;
GRANT UPDATE ON public.assets TO authenticated;

-- ============================================================================
-- Sequence grants (required for INSERT operations on tables with auto-increment)
-- ============================================================================
-- (UUIDs use gen_random_uuid() which doesn't require sequence grants)

-- ============================================================================
-- Note on RLS + GRANT model:
-- - GRANT statements provide the baseline table-level permissions
-- - RLS policies enforce row-level isolation so users can only access their own data
-- - This combination maintains both table-level and row-level security
-- - No Service Role workarounds are used
-- ============================================================================
