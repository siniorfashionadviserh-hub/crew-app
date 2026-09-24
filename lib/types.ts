// User
export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

// Account
export interface Account {
  id: string;
  user_id: string;
  account_name: string;
  platform: 'instagram' | 'tiktok' | 'youtube';
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Account Strategy - Phase 2.1 Enhanced
// ============================================================================

// Brand / Positioning
export interface BrandPositioning {
  account_concept: string;
  positioning: string;
  target_problem: string;
  value_proposition: string;
  differentiation: string;
  creator_strength: string;
}

// Persona Details
export interface PersonaDetails {
  persona_name: string;
  age: string;
  lifestyle: string;
  situation: string;
  frustrations: string[];
  desires: string[];
  information_needs: string[];
  social_media_behavior: string;
  follow_reason: string;
}

// Account Naming
export interface AccountNaming {
  account_name_candidates: string[];
  account_name_rationales: string[];
  display_name_candidates: string[];
  username_candidates: string[];
}

// Profile
export interface ProfileStrategy {
  profile_bio_candidates: string[];
  profile_image_direction: string;
  cta: string;
}

// Content Pillar Details
export interface ContentPillarDetail {
  name: string;
  purpose: string;
  audience_need: string;
  content_examples: string[];
  recommended_format: string;
  content_ratio: number;
  primary_kpi: string;
}

// Visual Identity
export interface VisualIdentity {
  visual_keywords: string[];
  color_direction: string;
  photo_direction: string;
  reel_direction: string;
  carousel_direction: string;
  typography_direction: string;
}

// First 30 Days Seed Idea
export interface SeedIdea {
  title: string;
  objective: string;
  content_pillar: string;
  recommended_format: string;
  audience_need: string;
  day_of_week?: string; // 投稿予定曜日（例：月、水、金）
}

// Main Account Strategy (Phase 2.1)
export interface AccountStrategy {
  id: string;
  account_id: string;

  // Phase 1 (Original)
  concept: string;
  target_audience: Record<string, string | number | boolean>;
  posting_frequency: string;
  tone_and_manner: Record<string, string>;
  kpi: Record<string, number | string>;
  monetization_candidates: string[];
  reference_accounts: string[];
  purpose: string;
  genre: string;

  // Phase 2.1 (New)
  editorial_summary?: string;
  brand_positioning?: BrandPositioning;
  persona_details?: PersonaDetails;
  account_naming?: AccountNaming;
  profile_strategy?: ProfileStrategy;
  content_pillars_detailed?: ContentPillarDetail[];
  visual_identity?: VisualIdentity;
  seed_ideas?: SeedIdea[];

  ai_generated: boolean;
  created_at: string;
  updated_at: string;
}

// Account Strategy form data
export type AccountStrategyInput = Pick<
  AccountStrategy,
  'purpose' | 'genre' | 'reference_accounts'
> & {
  targetAgeGroup: string;
  targetGender: string;
  targetPainPoint: string;
  creatorAgeGroup: string;
  canShowFace: boolean;
  canUseVoice: boolean;
  postingFrequency: number;
};

// Brand Kit
export interface BrandKit {
  id: string;
  account_id: string;
  color_primary: string;
  color_secondary: string;
  color_background: string;
  font_primary: string;
  font_secondary: string;
  logo_storage_path: string; // "logos/[user_id]/[account_id]/logo.png"
  photo_style: string;
  copy_tone: string;
  default_cta: string;
  created_at: string;
  updated_at: string;
}

// Format (Trend Format Library)
export interface Format {
  id: string;
  name: string;
  content_type: 'reel' | 'carousel' | 'single';
  suited_content_pillars: string[]; // ["ピラー1", "ピラー2"]
  suited_goals: string[]; // ["awareness", "followers"]
  niches: string[]; // ["fashion", "beauty"]
  hook_structure: Record<string, string | number | boolean>;
  content_structure: Record<string, string | number | boolean>;
  recommended_duration: number; // 秒
  recommended_cut_count: number;
  cta_template: string;
  trend_score: number; // 0-10
  reference_posts: Array<{
    url: string;
    impressions: number;
    engagement_rate?: number;
  }>;
  last_updated: string;
  created_at: string;
}

// Project
export interface Project {
  id: string;
  user_id: string;
  account_id: string;
  mode: 'daily' | 'campaign';
  status: 'planning' | 'shooting' | 'editing' | 'review' | 'ready';
  title: string;
  format_id: string;
  content_type: 'reel' | 'carousel' | 'single';
  estimated_cost: number;
  actual_cost: number;
  created_at: string;
  updated_at: string;
}

// Content Idea
export interface ContentIdea {
  id: string;
  project_id: string;
  title: string;
  description: string;
  recommended_score: number; // 0-1
  reason: string;
  format_id: string;
  metadata: Record<string, string | number | boolean>;
  created_at: string;
}

// Shooting Guide
export interface ShootingGuide {
  id: string;
  project_id: string;
  format_id: string;
  total_cut_count: number;
  created_at: string;
  updated_at: string;
}

// Shooting Guide Cut (修正1: 新規テーブル)
export interface ShootingGuideCut {
  id: string;
  shooting_guide_id: string;
  cut_number: number;
  purpose: 'hook' | 'problem' | 'solution' | 'proof' | 'cta';
  content: string;
  recommended_duration: number; // 秒
  smartphone_orientation: 'portrait' | 'landscape';
  smartphone_height: 'chest_level' | 'eye_level' | 'waist_level';
  camera_distance: number; // cm
  person_product_position: 'center' | 'left' | 'right';
  actions: string[];
  dialogue: string;
  notes: string;
  sample_image_url: string; // テンプレート画像URL
  created_at: string;
  updated_at: string;
}

// Asset (修正2: storage_path を使用)
export interface Asset {
  id: string;
  project_id: string;
  shooting_guide_id: string;
  shooting_guide_cut_id: string;
  cut_number: number;
  storage_path: string; // "assets/[user_id]/[project_id]/cut_01.mp4"
  file_type: 'image' | 'video' | 'audio';
  file_size: number;
  duration: number; // 秒
  source: 'user_upload' | 'ai_generated' | 'reference';
  status: 'pending' | 'processing' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

// Usage Log (修正5: AIモデル・料金を動的管理)
export interface UsageLog {
  id: string;
  user_id: string;
  project_id: string;
  operation_type: 'strategy_generation' | 'idea_generation' | 'shooting_guide_generation';
  provider: 'claude';
  model: string; // 'claude-sonnet-5'
  input_tokens: number;
  output_tokens: number;
  api_call_count: number;
  estimated_cost: number;
  processing_time_ms: number;
  created_at: string;
}

// Onboarding Session (Phase 2)
export interface OnboardingSession {
  id: string;
  user_id: string;
  account_id: string | null;
  purpose: 'awareness' | 'followers' | 'traffic' | 'sales' | 'affiliate' | 'influencer' | null;
  genre: 'fashion' | 'beauty' | 'travel' | 'food' | 'lifestyle' | 'health' | 'business' | 'other' | null;
  target_age_group: string | null;
  target_gender: 'male' | 'female' | 'mixed' | null;
  target_pain_point: string | null;
  creator_age_group: string | null;
  can_show_face: boolean;
  can_use_voice: boolean;
  posting_frequency: number | null;
  current_step: number;
  status: 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
}

// Strategy Generation Request
export interface StrategyGenerationRequest {
  purpose: AccountStrategy['purpose'];
  genre: AccountStrategy['genre'];
  targetAgeGroup: string;
  targetGender: string;
  targetPainPoint: string;
  creatorAgeGroup: string;
  canShowFace: boolean;
  canUseVoice: boolean;
  postingFrequency: number;
}

// Strategy Generation Result (Editorial format)
export interface StrategyResult {
  // Phase 1 (Original)
  concept: string;
  targetAudience: string;
  contentPillars: string[];
  recommendedPosts: string[];
  postingFrequency: string;
  visualDirection: string;
  monetizationCandidates: string[];
  kpi: Record<string, string | number>;

  // Phase 2.1 (New)
  editorialSummary?: string;
  brandPositioning?: BrandPositioning;
  personaDetails?: PersonaDetails;
  accountNaming?: AccountNaming;
  profileStrategy?: ProfileStrategy;
  contentPillarsDetailed?: ContentPillarDetail[];
  visualIdentity?: VisualIdentity;
  seedIdeas?: SeedIdea[];
}

// Reference Account
export interface ReferenceAccount {
  name: string;
  url?: string;
}