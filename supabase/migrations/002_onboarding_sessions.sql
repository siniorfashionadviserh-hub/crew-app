-- Onboarding Sessions table for step-by-step form tracking
CREATE TABLE onboarding_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,

  -- Form data (JSON for flexibility)
  purpose TEXT, -- 'awareness' | 'followers' | 'traffic' | 'sales' | 'affiliate' | 'influencer'
  genre TEXT, -- 'fashion' | 'beauty' | 'travel' | 'food' | 'lifestyle' | 'health' | 'business' | 'other'
  target_age_group TEXT, -- '20s' | '30s' | '40s' | '50s' | '60s' | '70s+' | 'mixed'
  target_gender TEXT, -- 'male' | 'female' | 'mixed'
  target_pain_point TEXT,
  creator_age_group TEXT,
  can_show_face BOOLEAN DEFAULT FALSE,
  can_use_voice BOOLEAN DEFAULT FALSE,
  posting_frequency INTEGER, -- per week

  -- Status
  current_step INTEGER DEFAULT 1, -- 1-4
  status TEXT DEFAULT 'in_progress', -- 'in_progress' | 'completed'

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE onboarding_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own sessions
CREATE POLICY onboarding_sessions_user_isolation
  ON onboarding_sessions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Auto-update timestamp
CREATE TRIGGER onboarding_sessions_updated_at
  BEFORE UPDATE ON onboarding_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Index for fast lookup
CREATE INDEX onboarding_sessions_user_id_idx ON onboarding_sessions(user_id);
CREATE INDEX onboarding_sessions_account_id_idx ON onboarding_sessions(account_id);
