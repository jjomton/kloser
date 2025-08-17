-- Kloser MVP 데이터베이스 스키마
-- 멀티테넌트 지인추천 캠페인 SaaS

-- 확장 기능 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 조직(테넌트) 테이블
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'pro')),
  region TEXT DEFAULT 'CA',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 조직-사용자 맵핑 + 역할 관리
CREATE TABLE org_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- supabase auth.users.id
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'analyst')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, user_id)
);

-- 캠페인 테이블
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'ended')),
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  goal JSONB DEFAULT '{"target_conversions": 0, "target_revenue": 0}',
  reward_policy JSONB NOT NULL, -- 보상정책 JSON
  landing_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 참여자 테이블 (추천하는 사람/받는 사람 모두)
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT,
  phone TEXT,
  name TEXT,
  locale TEXT DEFAULT 'ko',
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, email),
  UNIQUE(org_id, phone)
);

-- 추천 링크 테이블
CREATE TABLE referral_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id) ON DELETE SET NULL,
  code TEXT UNIQUE NOT NULL, -- 짧은 고유 코드
  utm JSONB DEFAULT '{}', -- utm 파라미터
  clicks_count INTEGER DEFAULT 0,
  conversions_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 이벤트 테이블 (클릭/가입/구매 등)
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id) ON DELETE SET NULL,
  link_id UUID REFERENCES referral_links(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('click', 'join', 'purchase', 'signup')),
  value NUMERIC DEFAULT 0, -- purchase 금액 등
  ip INET,
  user_agent TEXT,
  referrer TEXT,
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 전환 테이블 (보상 산정 기준)
CREATE TABLE conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  referrer_participant_id UUID REFERENCES participants(id) ON DELETE SET NULL,
  referee_participant_id UUID REFERENCES participants(id) ON DELETE SET NULL,
  value NUMERIC DEFAULT 0,
  first_purchase BOOLEAN DEFAULT FALSE,
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 보상 테이블
CREATE TABLE rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  conversion_id UUID REFERENCES conversions(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('cash', 'credit', 'gift', 'discount')),
  amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'void', 'cancelled')),
  reason JSONB DEFAULT '{}', -- 어떤 전환으로 인한 보상인지
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 부정(사기) 신호 테이블
CREATE TABLE fraud_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  reasons JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'ignored', 'blocked', 'resolved')),
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI 감사 로그 테이블
CREATE TABLE ai_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('copy', 'reward_suggest', 'moderation', 'optimization')),
  input_summary TEXT,
  output_summary TEXT,
  model TEXT,
  prompt_id TEXT,
  tokens_used INTEGER,
  cost NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_org_users_user_id ON org_users(user_id);
CREATE INDEX idx_org_users_org_id ON org_users(org_id);
CREATE INDEX idx_campaigns_org_id ON campaigns(org_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_participants_org_id ON participants(org_id);
CREATE INDEX idx_participants_email ON participants(email);
CREATE INDEX idx_referral_links_campaign_id ON referral_links(campaign_id);
CREATE INDEX idx_referral_links_code ON referral_links(code);
CREATE INDEX idx_events_org_id ON events(org_id);
CREATE INDEX idx_events_campaign_id ON events(campaign_id);
CREATE INDEX idx_events_type ON events(type);
CREATE INDEX idx_events_created_at ON events(created_at);
CREATE INDEX idx_conversions_org_id ON conversions(org_id);
CREATE INDEX idx_conversions_campaign_id ON conversions(campaign_id);
CREATE INDEX idx_rewards_org_id ON rewards(org_id);
CREATE INDEX idx_rewards_participant_id ON rewards(participant_id);
CREATE INDEX idx_rewards_status ON rewards(status);
CREATE INDEX idx_fraud_signals_org_id ON fraud_signals(org_id);
CREATE INDEX idx_fraud_signals_status ON fraud_signals(status);
CREATE INDEX idx_ai_audit_org_id ON ai_audit(org_id);
CREATE INDEX idx_ai_audit_kind ON ai_audit(kind);

-- 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 업데이트 트리거 적용
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_org_users_updated_at BEFORE UPDATE ON org_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_participants_updated_at BEFORE UPDATE ON participants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_referral_links_updated_at BEFORE UPDATE ON referral_links FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rewards_updated_at BEFORE UPDATE ON rewards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fraud_signals_updated_at BEFORE UPDATE ON fraud_signals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
