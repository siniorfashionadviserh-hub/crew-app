-- Extend account_strategies table for Phase 2.1 (Complete SNS Account Design)
-- Adds new JSON columns to store Brand, Persona, Naming, Profile, Visual Identity, and Seed Ideas

-- ============================================================================
-- Add new columns to account_strategies table
-- ============================================================================

ALTER TABLE public.account_strategies
ADD COLUMN IF NOT EXISTS editorial_summary TEXT,
ADD COLUMN IF NOT EXISTS brand_positioning JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS persona_details JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS account_naming JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS profile_strategy JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS content_pillars_detailed JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS visual_identity JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS seed_ideas JSONB DEFAULT NULL;

-- ============================================================================
-- Schema documentation
-- ============================================================================
--
-- New columns store Phase 2.1 data:
--
-- editorial_summary: TEXT
--   One-paragraph summary of the account strategy
--
-- brand_positioning: JSONB
--   {
--     "account_concept": string,
--     "positioning": string,
--     "target_problem": string,
--     "value_proposition": string,
--     "differentiation": string,
--     "creator_strength": string
--   }
--
-- persona_details: JSONB
--   {
--     "persona_name": string,
--     "age": string,
--     "lifestyle": string,
--     "situation": string,
--     "frustrations": string[],
--     "desires": string[],
--     "information_needs": string[],
--     "social_media_behavior": string,
--     "follow_reason": string
--   }
--
-- account_naming: JSONB
--   {
--     "account_name_candidates": string[],
--     "account_name_rationales": string[],
--     "display_name_candidates": string[],
--     "username_candidates": string[]
--   }
--
-- profile_strategy: JSONB
--   {
--     "profile_bio_candidates": string[],
--     "profile_image_direction": string,
--     "cta": string
--   }
--
-- content_pillars_detailed: JSONB
--   Array of:
--   {
--     "name": string,
--     "purpose": string,
--     "audience_need": string,
--     "content_examples": string[],
--     "recommended_format": string,
--     "content_ratio": number,
--     "primary_kpi": string
--   }
--
-- visual_identity: JSONB
--   {
--     "visual_keywords": string[],
--     "color_direction": string,
--     "photo_direction": string,
--     "reel_direction": string,
--     "carousel_direction": string,
--     "typography_direction": string
--   }
--
-- seed_ideas: JSONB
--   Array of:
--   {
--     "title": string,
--     "objective": string,
--     "content_pillar": string,
--     "recommended_format": string,
--     "audience_need": string
--   }
--
-- ============================================================================
-- Note: Existing Phase 1 columns (concept, content_pillars, etc.) remain unchanged
-- ============================================================================
