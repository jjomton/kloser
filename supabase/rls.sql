-- Row-Level Security (RLS) 정책
-- 멀티테넌트 데이터 격리 보장

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
-- 사용자는 자신이 속한 조직만 조회 가능
CREATE POLICY "Users can view their organizations" ON organizations
  FOR SELECT USING (
    id IN (
      SELECT org_id FROM org_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- 소유자만 조직 생성/수정 가능
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

-- 소유자/관리자는 조직 사용자 관리 가능
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
  FOR INSERT WITH CHECK (true); -- 시스템에서 이벤트 삽입 허용

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

-- 공개 링크 접근을 위한 특별 정책 (인증 없이 접근 가능)
CREATE POLICY "Public can access referral links by code" ON referral_links
  FOR SELECT USING (true);

-- 공개 이벤트 기록을 위한 정책
CREATE POLICY "Public can insert events for tracking" ON events
  FOR INSERT WITH CHECK (true);
