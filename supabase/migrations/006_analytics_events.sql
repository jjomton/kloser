-- 분석 이벤트 테이블 생성
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event VARCHAR(255) NOT NULL,
  properties JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_id VARCHAR(255) NOT NULL,
  user_agent TEXT,
  ip_address VARCHAR(45),
  referer TEXT,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_analytics_events_event ON analytics_events(event);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_org_id ON analytics_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);

-- RLS 정책
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- 조직별 데이터 접근 정책
CREATE POLICY "Users can view analytics events for their organization" ON analytics_events
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM org_users 
      WHERE user_id = auth.uid()
    )
  );

-- 조직별 데이터 삽입 정책
CREATE POLICY "Users can insert analytics events for their organization" ON analytics_events
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM org_users 
      WHERE user_id = auth.uid()
    )
  );

-- 성능 분석 뷰 생성
CREATE OR REPLACE VIEW analytics_summary AS
SELECT 
  event,
  COUNT(*) as event_count,
  COUNT(DISTINCT session_id) as unique_sessions,
  COUNT(DISTINCT user_id) as unique_users,
  AVG(EXTRACT(EPOCH FROM (timestamp - LAG(timestamp) OVER (PARTITION BY session_id ORDER BY timestamp)))) as avg_time_between_events,
  MIN(timestamp) as first_occurrence,
  MAX(timestamp) as last_occurrence
FROM analytics_events
GROUP BY event
ORDER BY event_count DESC;

-- 세션별 분석 뷰
CREATE OR REPLACE VIEW session_analytics AS
SELECT 
  session_id,
  organization_id,
  user_id,
  COUNT(*) as total_events,
  COUNT(DISTINCT event) as unique_events,
  MIN(timestamp) as session_start,
  MAX(timestamp) as session_end,
  EXTRACT(EPOCH FROM (MAX(timestamp) - MIN(timestamp))) as session_duration_seconds,
  STRING_AGG(DISTINCT event, ', ' ORDER BY event) as events_sequence
FROM analytics_events
GROUP BY session_id, organization_id, user_id
ORDER BY session_start DESC;
