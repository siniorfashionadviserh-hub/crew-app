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

// Account Strategy
export interface AccountStrategy {
  id: string;
  account_id: string;
  concept: string;
  target_audience: Record<string, any>;
  persona: Record<string, any>;
  content_pillars: string[]; // ["ピラー1", "ピラー2", ...]
  posting_frequency: string;
  tone_and_manner: Record<string, any>;
  visual_direction: string;
  kpi: Record<string, any>;
  monetization_candidates: string[];
  reference_accounts: string[]; // ["@user1", "https://..."]
  purpose: string; // 'awareness', 'followers', 'traffic', 'sales', 'affiliate', 'influencer'
  genre: string; // 'fashion', 'beauty', 'travel', 'food', 'lifestyle', 'health', 'business', 'other'
  ai_generated: boolean;
  created_at: string;
  updated_at: string;
}

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
  hook_structure: Record<string, any>;
  content_structure: Record<string, any>;
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
  metadata: Record<string, any>;
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
  model: string; // 'claude-3-5-sonnet-20241022'
  input_tokens: number;
  output_tokens: number;
  api_call_count: number;
  estimated_cost: number;
  processing_time_ms: number;
  created_at: string;
}