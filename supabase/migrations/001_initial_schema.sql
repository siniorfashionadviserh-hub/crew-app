-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. Users テーブル (Supabase Auth連携)
-- ============================================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- ============================================================================
-- 2. Accounts テーブル
-- ============================================================================

CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_name TEXT NOT NULL,
  platform TEXT CHECK (platform IN ('instagram', 'tiktok', 'youtube')) DEFAULT 'instagram',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_accounts_user_id ON accounts(user_id);

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own accounts"
  ON accounts FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- 3. Account Strategy テーブル
-- ============================================================================

CREATE TABLE account_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL UNIQUE REFERENCES accounts(id) ON DELETE CASCADE,
  concept TEXT NOT NULL,
  target_audience JSONB,
  persona JSONB,
  content_pillars JSONB, -- ["ピラー1", "ピラー2", ...]
  posting_frequency TEXT,
  tone_and_manner JSONB,
  visual_direction TEXT,
  kpi JSONB,
  monetization_candidates JSONB,
  reference_accounts JSONB, -- ["@user1", "https://instagram.com/user2", ...]
  purpose TEXT, -- 'awareness', 'followers', 'traffic', 'sales', 'affiliate', 'influencer'
  genre TEXT, -- 'fashion', 'beauty', 'travel', 'food', 'lifestyle', 'health', 'business', 'other'
  ai_generated BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE account_strategies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own strategy"
  ON account_strategies FOR ALL
  USING (
    account_id IN (
      SELECT id FROM accounts WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- 4. Brand Kit テーブル
-- ============================================================================

CREATE TABLE brand_kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL UNIQUE REFERENCES accounts(id) ON DELETE CASCADE,
  color_primary TEXT NOT NULL,
  color_secondary TEXT,
  color_background TEXT,
  font_primary TEXT,
  font_secondary TEXT,
  logo_storage_path TEXT, -- storage_path (Supabase Storage)
  photo_style TEXT,
  copy_tone TEXT,
  default_cta TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE brand_kits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own brand kit"
  ON brand_kits FOR ALL
  USING (
    account_id IN (
      SELECT id FROM accounts WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- 5. Formats テーブル (Trend Format Library)
-- ============================================================================

CREATE TABLE formats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  content_type TEXT CHECK (content_type IN ('reel', 'carousel', 'single')) NOT NULL,
  suited_content_pillars JSONB, -- ["ピラー1", "ピラー2"] → content_pillars との比較用
  suited_goals JSONB, -- ["awareness", "followers", "traffic"] → purpose との比較用
  niches JSONB, -- ["fashion", "beauty"] → genre との比較用
  hook_structure JSONB,
  content_structure JSONB,
  recommended_duration INTEGER,
  recommended_cut_count INTEGER,
  cta_template TEXT,
  trend_score DECIMAL(3, 1) DEFAULT 5.0,
  reference_posts JSONB, -- [{"url": "...", "impressions": 1000}, ...]
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_formats_content_type ON formats(content_type);
CREATE INDEX idx_formats_trend_score ON formats(trend_score DESC);

ALTER TABLE formats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to formats"
  ON formats FOR SELECT
  USING (true);

-- ============================================================================
-- 6. Projects テーブル
-- ============================================================================

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  mode TEXT CHECK (mode IN ('daily', 'campaign')) DEFAULT 'daily',
  status TEXT CHECK (status IN ('planning', 'shooting', 'editing', 'review', 'ready')) DEFAULT 'planning',
  title TEXT,
  format_id UUID REFERENCES formats(id),
  content_type TEXT CHECK (content_type IN ('reel', 'carousel', 'single')),
  estimated_cost DECIMAL(10, 2),
  actual_cost DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_account_id ON projects(account_id);
CREATE INDEX idx_projects_status ON projects(status);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own projects"
  ON projects FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- 7. Content Ideas テーブル
-- ============================================================================

CREATE TABLE content_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  recommended_score DECIMAL(3, 2),
  reason TEXT,
  format_id UUID REFERENCES formats(id),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_content_ideas_project_id ON content_ideas(project_id);

ALTER TABLE content_ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own ideas"
  ON content_ideas FOR ALL
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- 8. Shooting Guides テーブル
-- ============================================================================

CREATE TABLE shooting_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  format_id UUID REFERENCES formats(id),
  total_cut_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_shooting_guides_project_id ON shooting_guides(project_id);

ALTER TABLE shooting_guides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own guides"
  ON shooting_guides FOR ALL
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- 9. Shooting Guide Cuts テーブル (新規 - 修正1で追加)
-- ============================================================================

CREATE TABLE shooting_guide_cuts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shooting_guide_id UUID NOT NULL REFERENCES shooting_guides(id) ON DELETE CASCADE,
  cut_number INTEGER NOT NULL,
  purpose TEXT, -- 'hook', 'problem', 'solution', 'proof', 'cta'
  content TEXT NOT NULL,
  recommended_duration INTEGER,
  smartphone_orientation TEXT, -- 'portrait', 'landscape'
  smartphone_height TEXT, -- 'chest_level', 'eye_level', 'waist_level'
  camera_distance INTEGER, -- cm
  person_product_position TEXT, -- 'center', 'left', 'right'
  actions JSONB, -- ["action1", "action2"]
  dialogue TEXT,
  notes TEXT,
  sample_image_url TEXT, -- テンプレートイメージURL（将来AI画像に対応）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_shooting_guide_cuts_shooting_guide_id ON shooting_guide_cuts(shooting_guide_id);
CREATE INDEX idx_shooting_guide_cuts_cut_number ON shooting_guide_cuts(shooting_guide_id, cut_number);

ALTER TABLE shooting_guide_cuts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own cuts"
  ON shooting_guide_cuts FOR ALL
  USING (
    shooting_guide_id IN (
      SELECT id FROM shooting_guides
      WHERE project_id IN (
        SELECT id FROM projects WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- 10. Assets テーブル (修正2で修正: storage_path を使用)
-- ============================================================================

CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  shooting_guide_id UUID REFERENCES shooting_guides(id),
  shooting_guide_cut_id UUID REFERENCES shooting_guide_cuts(id),
  cut_number INTEGER,
  storage_path TEXT NOT NULL, -- "assets/[user_id]/[project_id]/cut_01.mp4"
  file_type TEXT CHECK (file_type IN ('image', 'video', 'audio')),
  file_size INTEGER,
  duration INTEGER, -- 秒
  source TEXT CHECK (source IN ('user_upload', 'ai_generated', 'reference')),
  status TEXT CHECK (status IN ('pending', 'processing', 'approved', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_assets_project_id ON assets(project_id);
CREATE INDEX idx_assets_shooting_guide_id ON assets(shooting_guide_id);
CREATE INDEX idx_assets_shooting_guide_cut_id ON assets(shooting_guide_cut_id);

ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own assets"
  ON assets FOR ALL
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- 11. Usage Logs テーブル (修正5で修正: AI料金の動的管理)
-- ============================================================================

CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  operation_type TEXT NOT NULL, -- 'strategy_generation', 'idea_generation', 'shooting_guide_generation'
  provider TEXT NOT NULL, -- 'claude'
  model TEXT NOT NULL, -- 'claude-3-5-sonnet-20241022'
  input_tokens INTEGER,
  output_tokens INTEGER,
  api_call_count INTEGER DEFAULT 1,
  estimated_cost DECIMAL(10, 4),
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX idx_usage_logs_created_at ON usage_logs(created_at);
CREATE INDEX idx_usage_logs_project_id ON usage_logs(project_id);

ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only view their own logs"
  ON usage_logs FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- Timestamp 自動更新 Trigger
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_accounts_updated_at
BEFORE UPDATE ON accounts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_account_strategies_updated_at
BEFORE UPDATE ON account_strategies
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_brand_kits_updated_at
BEFORE UPDATE ON brand_kits
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_shooting_guides_updated_at
BEFORE UPDATE ON shooting_guides
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_shooting_guide_cuts_updated_at
BEFORE UPDATE ON shooting_guide_cuts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_assets_updated_at
BEFORE UPDATE ON assets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();