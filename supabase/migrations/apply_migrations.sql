-- Kloser Database Migration - Complete Setup
-- 이 파일은 모든 마이그레이션을 순서대로 실행합니다.
-- 실행 전에 Supabase 프로젝트가 설정되어 있는지 확인하세요.

-- ========================================
-- 1. 초기 스키마 생성
-- ========================================

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
CREATE INDEX idx_conversions_campaign_id ON conversions(org_id);
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

-- ========================================
-- 2. Row-Level Security 설정
-- ========================================

-- RLS 활성화
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_audit ENABLE ROW LEVEL SECURITY;

-- 조직 테이블 정책
CREATE POLICY "Users can view their organizations" ON organizations
  FOR SELECT USING (
    id IN (
      SELECT org_id FROM org_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Owners can manage their organizations" ON organizations
  FOR ALL USING (
    id IN (
      SELECT org_id FROM org_users 
      WHERE user_id = auth.uid() AND role = 'owner' AND status = 'active'
    )
  );

-- 조직-사용자 테이블 정책
CREATE POLICY "Users can view org_users in their organizations" ON org_users
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM org_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Owners and admins can manage org_users" ON org_users
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM org_users 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active'
    )
  );

-- 캠페인 테이블 정책
CREATE POLICY "Users can view campaigns in their organizations" ON campaigns
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM org_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Owners and admins can manage campaigns" ON campaigns
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM org_users 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active'
    )
  );

-- 참여자 테이블 정책
CREATE POLICY "Users can view participants in their organizations" ON participants
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM org_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Owners and admins can manage participants" ON participants
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM org_users 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active'
    )
  );

-- 추천 링크 테이블 정책
CREATE POLICY "Users can view referral_links in their organizations" ON referral_links
  FOR SELECT USING (
    campaign_id IN (
      SELECT c.id FROM campaigns c
      JOIN org_users ou ON c.org_id = ou.org_id
      WHERE ou.user_id = auth.uid() AND ou.status = 'active'
    )
  );

CREATE POLICY "Owners and admins can manage referral_links" ON referral_links
  FOR ALL USING (
    campaign_id IN (
      SELECT c.id FROM campaigns c
      JOIN org_users ou ON c.org_id = ou.org_id
      WHERE ou.user_id = auth.uid() AND ou.role IN ('owner', 'admin') AND ou.status = 'active'
    )
  );

-- 이벤트 테이블 정책
CREATE POLICY "Users can view events in their organizations" ON events
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM org_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "System can insert events" ON events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Owners and admins can manage events" ON events
  FOR UPDATE USING (
    org_id IN (
      SELECT org_id FROM org_users 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active'
    )
  );

-- 전환 테이블 정책
CREATE POLICY "Users can view conversions in their organizations" ON conversions
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM org_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "System can insert conversions" ON conversions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Owners and admins can manage conversions" ON conversions
  FOR UPDATE USING (
    org_id IN (
      SELECT org_id FROM org_users 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active'
    )
  );

-- 보상 테이블 정책
CREATE POLICY "Users can view rewards in their organizations" ON rewards
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM org_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "System can insert rewards" ON rewards
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Owners and admins can manage rewards" ON rewards
  FOR UPDATE USING (
    org_id IN (
      SELECT org_id FROM org_users 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active'
    )
  );

-- 부정 신호 테이블 정책
CREATE POLICY "Users can view fraud_signals in their organizations" ON fraud_signals
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM org_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "System can insert fraud_signals" ON fraud_signals
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Owners and admins can manage fraud_signals" ON fraud_signals
  FOR UPDATE USING (
    org_id IN (
      SELECT org_id FROM org_users 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active'
    )
  );

-- AI 감사 로그 테이블 정책
CREATE POLICY "Users can view ai_audit in their organizations" ON ai_audit
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM org_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "System can insert ai_audit" ON ai_audit
  FOR INSERT WITH CHECK (true);

-- 공개 링크 접근을 위한 특별 정책
CREATE POLICY "Public can access referral links by code" ON referral_links
  FOR SELECT USING (true);

-- 공개 이벤트 기록을 위한 정책
CREATE POLICY "Public can insert events for tracking" ON events
  FOR INSERT WITH CHECK (true);

-- ========================================
-- 3. 비즈니스 로직 함수 및 트리거
-- ========================================

-- 추천 링크 코드 생성 함수
CREATE OR REPLACE FUNCTION generate_referral_code(participant_name TEXT, campaign_id UUID)
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  counter INTEGER := 0;
  max_attempts INTEGER := 10;
BEGIN
  LOOP
    code := UPPER(LEFT(participant_name, 3)) || LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0');
    
    IF NOT EXISTS (SELECT 1 FROM referral_links WHERE code = code) THEN
      RETURN code;
    END IF;
    
    counter := counter + 1;
    IF counter >= max_attempts THEN
      code := 'REF' || SUBSTRING(gen_random_uuid()::TEXT, 1, 6);
      RETURN code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 이벤트 발생시 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_link_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'click' THEN
    UPDATE referral_links 
    SET clicks_count = clicks_count + 1
    WHERE id = NEW.link_id;
  END IF;
  
  IF NEW.type IN ('purchase', 'signup', 'join') THEN
    UPDATE referral_links 
    SET conversions_count = conversions_count + 1
    WHERE id = NEW.link_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 이벤트 테이블에 트리거 적용
CREATE TRIGGER update_link_stats_trigger
  AFTER INSERT ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_link_stats();

-- 전환 발생시 자동 보상 생성 함수
CREATE OR REPLACE FUNCTION create_reward_on_conversion()
RETURNS TRIGGER AS $$
DECLARE
  campaign_reward_policy JSONB;
  reward_amount NUMERIC;
  reward_type TEXT;
  reward_currency TEXT;
BEGIN
  SELECT reward_policy INTO campaign_reward_policy
  FROM campaigns
  WHERE id = NEW.campaign_id;
  
  IF campaign_reward_policy IS NOT NULL THEN
    reward_type := campaign_reward_policy->>'type';
    reward_amount := (campaign_reward_policy->>'amount')::NUMERIC;
    reward_currency := COALESCE(campaign_reward_policy->>'currency', 'USD');
    
    INSERT INTO rewards (
      org_id,
      participant_id,
      campaign_id,
      conversion_id,
      type,
      amount,
      currency,
      status,
      reason
    ) VALUES (
      NEW.org_id,
      NEW.referrer_participant_id,
      NEW.campaign_id,
      NEW.id,
      reward_type,
      reward_amount,
      reward_currency,
      'pending',
      jsonb_build_object(
        'reason', 'conversion_referral',
        'conversion_value', NEW.value,
        'conversion_type', CASE WHEN NEW.first_purchase THEN 'first_purchase' ELSE 'repeat_purchase' END
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 전환 테이블에 트리거 적용
CREATE TRIGGER create_reward_on_conversion_trigger
  AFTER INSERT ON conversions
  FOR EACH ROW
  EXECUTE FUNCTION create_reward_on_conversion();

-- 사기 탐지 함수
CREATE OR REPLACE FUNCTION detect_fraud()
RETURNS TRIGGER AS $$
DECLARE
  fraud_score INTEGER := 0;
  fraud_reasons TEXT[] := ARRAY[]::TEXT[];
  recent_events_count INTEGER;
  same_ip_events_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO recent_events_count
  FROM events
  WHERE link_id = NEW.link_id
    AND created_at > NOW() - INTERVAL '1 hour';
  
  IF recent_events_count > 50 THEN
    fraud_score := fraud_score + 30;
    fraud_reasons := array_append(fraud_reasons, 'Too many events in short time');
  END IF;
  
  SELECT COUNT(*) INTO same_ip_events_count
  FROM events
  WHERE link_id = NEW.link_id
    AND ip = NEW.ip
    AND created_at > NOW() - INTERVAL '24 hours';
  
  IF same_ip_events_count > 10 THEN
    fraud_score := fraud_score + 25;
    fraud_reasons := array_append(fraud_reasons, 'Multiple events from same IP');
  END IF;
  
  IF NEW.user_agent LIKE '%bot%' OR NEW.user_agent LIKE '%crawler%' THEN
    fraud_score := fraud_score + 20;
    fraud_reasons := array_append(fraud_reasons, 'Suspicious user agent');
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM referral_links 
    WHERE id = NEW.link_id 
    AND conversions_count::FLOAT / NULLIF(clicks_count, 0) > 0.8
  ) THEN
    fraud_score := fraud_score + 15;
    fraud_reasons := array_append(fraud_reasons, 'Unrealistically high conversion rate');
  END IF;
  
  IF fraud_score >= 50 THEN
    INSERT INTO fraud_signals (
      org_id,
      event_id,
      score,
      reasons,
      status
    ) VALUES (
      NEW.org_id,
      NEW.id,
      fraud_score,
      to_jsonb(fraud_reasons),
      'open'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 이벤트 테이블에 사기 탐지 트리거 적용
CREATE TRIGGER detect_fraud_trigger
  AFTER INSERT ON events
  FOR EACH ROW
  EXECUTE FUNCTION detect_fraud();

-- ========================================
-- 4. 성과 분석 뷰 생성
-- ========================================

-- 조직 통계 뷰
CREATE OR REPLACE VIEW organization_stats AS
SELECT 
  o.id as org_id,
  o.name as org_name,
  o.plan,
  COUNT(DISTINCT c.id) as total_campaigns,
  COUNT(DISTINCT p.id) as total_participants,
  COUNT(DISTINCT rl.id) as total_referral_links,
  COUNT(DISTINCT e.id) as total_events,
  COUNT(DISTINCT conv.id) as total_conversions,
  COUNT(DISTINCT rew.id) as total_rewards,
  SUM(CASE WHEN e.type = 'click' THEN 1 ELSE 0 END) as total_clicks,
  SUM(CASE WHEN e.type IN ('purchase', 'signup', 'join') THEN 1 ELSE 0 END) as total_conversion_events,
  SUM(CASE WHEN conv.value IS NOT NULL THEN conv.value ELSE 0 END) as total_conversion_value,
  AVG(CASE WHEN rl.clicks_count > 0 THEN rl.conversions_count::FLOAT / rl.clicks_count ELSE 0 END) as avg_conversion_rate
FROM organizations o
LEFT JOIN campaigns c ON o.id = c.org_id
LEFT JOIN participants p ON o.id = p.org_id
LEFT JOIN referral_links rl ON c.id = rl.campaign_id
LEFT JOIN events e ON o.id = e.org_id
LEFT JOIN conversions conv ON o.id = conv.org_id
LEFT JOIN rewards rew ON o.id = rew.org_id
GROUP BY o.id, o.name, o.plan;

-- 캠페인 성과 뷰
CREATE OR REPLACE VIEW campaign_performance AS
SELECT 
  c.id as campaign_id,
  c.name as campaign_name,
  c.status,
  c.start_at,
  c.end_at,
  o.name as org_name,
  COUNT(DISTINCT rl.id) as total_links,
  COUNT(DISTINCT e.id) as total_events,
  SUM(CASE WHEN e.type = 'click' THEN 1 ELSE 0 END) as total_clicks,
  SUM(CASE WHEN e.type IN ('purchase', 'signup', 'join') THEN 1 ELSE 0 END) as total_conversions,
  COUNT(DISTINCT conv.id) as qualified_conversions,
  SUM(CASE WHEN conv.value IS NOT NULL THEN conv.value ELSE 0 END) as total_revenue,
  AVG(CASE WHEN rl.clicks_count > 0 THEN rl.conversions_count::FLOAT / rl.clicks_count ELSE 0 END) as conversion_rate,
  COUNT(DISTINCT rew.id) as total_rewards_issued,
  SUM(CASE WHEN rew.amount IS NOT NULL THEN rew.amount ELSE 0 END) as total_rewards_value
FROM campaigns c
JOIN organizations o ON c.org_id = o.id
LEFT JOIN referral_links rl ON c.id = rl.campaign_id
LEFT JOIN events e ON c.id = e.campaign_id
LEFT JOIN conversions conv ON c.id = conv.campaign_id
LEFT JOIN rewards rew ON c.id = rew.campaign_id
GROUP BY c.id, c.name, c.status, c.start_at, c.end_at, o.name;

-- 참여자 성과 뷰
CREATE OR REPLACE VIEW participant_performance AS
SELECT 
  p.id as participant_id,
  p.name as participant_name,
  p.email,
  o.name as org_name,
  COUNT(DISTINCT rl.id) as total_referral_links,
  SUM(rl.clicks_count) as total_clicks_generated,
  SUM(rl.conversions_count) as total_conversions_generated,
  COUNT(DISTINCT conv.id) as qualified_conversions,
  SUM(CASE WHEN conv.value IS NOT NULL THEN conv.value ELSE 0 END) as total_revenue_generated,
  COUNT(DISTINCT rew.id) as total_rewards_earned,
  SUM(CASE WHEN rew.amount IS NOT NULL THEN rew.amount ELSE 0 END) as total_rewards_value,
  AVG(CASE WHEN rl.clicks_count > 0 THEN rl.conversions_count::FLOAT / rl.clicks_count ELSE 0 END) as avg_conversion_rate
FROM participants p
JOIN organizations o ON p.org_id = o.id
LEFT JOIN referral_links rl ON p.id = rl.participant_id
LEFT JOIN conversions conv ON p.id = conv.referrer_participant_id
LEFT JOIN rewards rew ON p.id = rew.participant_id
GROUP BY p.id, p.name, p.email, o.name;

-- ========================================
-- 마이그레이션 완료
-- ========================================

-- 성공 메시지
DO $$
BEGIN
  RAISE NOTICE 'Kloser 데이터베이스 마이그레이션이 성공적으로 완료되었습니다!';
  RAISE NOTICE '생성된 테이블: organizations, org_users, campaigns, participants, referral_links, events, conversions, rewards, fraud_signals, ai_audit';
  RAISE NOTICE '생성된 뷰: organization_stats, campaign_performance, participant_performance';
  RAISE NOTICE 'RLS 정책이 모든 테이블에 적용되었습니다.';
END $$;
