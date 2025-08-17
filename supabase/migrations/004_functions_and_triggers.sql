-- Migration: 004_functions_and_triggers.sql
-- Description: Additional database functions and triggers for business logic
-- Date: 2024-01-01

-- 추천 링크 코드 생성 함수
CREATE OR REPLACE FUNCTION generate_referral_code(participant_name TEXT, campaign_id UUID)
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  counter INTEGER := 0;
  max_attempts INTEGER := 10;
BEGIN
  LOOP
    -- 이름 기반 코드 생성 (최대 3글자) + 랜덤 숫자
    code := UPPER(LEFT(participant_name, 3)) || LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0');
    
    -- 중복 확인
    IF NOT EXISTS (SELECT 1 FROM referral_links WHERE referral_code = code) THEN
      RETURN code;
    END IF;
    
    counter := counter + 1;
    IF counter >= max_attempts THEN
      -- 최대 시도 횟수 초과시 UUID 기반 코드 생성
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
  -- 클릭 이벤트 발생시
  IF NEW.type = 'click' THEN
    UPDATE referral_links 
    SET clicks_count = clicks_count + 1
    WHERE id = NEW.link_id;
  END IF;
  
  -- 전환 이벤트 발생시
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
  -- 캠페인의 보상 정책 조회
  SELECT reward_policy INTO campaign_reward_policy
  FROM campaigns
  WHERE id = NEW.campaign_id;
  
  -- 보상 정책이 있는 경우에만 보상 생성
  IF campaign_reward_policy IS NOT NULL THEN
    reward_type := campaign_reward_policy->>'type';
    reward_amount := (campaign_reward_policy->>'amount')::NUMERIC;
    reward_currency := COALESCE(campaign_reward_policy->>'currency', 'USD');
    
    -- 보상 생성
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
  suspicious_patterns TEXT[];
BEGIN
  -- 1. 짧은 시간 내 많은 이벤트 발생 체크
  SELECT COUNT(*) INTO recent_events_count
  FROM events
  WHERE link_id = NEW.link_id
    AND created_at > NOW() - INTERVAL '1 hour';
  
  IF recent_events_count > 50 THEN
    fraud_score := fraud_score + 30;
    fraud_reasons := array_append(fraud_reasons, 'Too many events in short time');
  END IF;
  
  -- 2. 같은 IP에서의 이벤트 체크
  SELECT COUNT(*) INTO same_ip_events_count
  FROM events
  WHERE link_id = NEW.link_id
    AND ip = NEW.ip
    AND created_at > NOW() - INTERVAL '24 hours';
  
  IF same_ip_events_count > 10 THEN
    fraud_score := fraud_score + 25;
    fraud_reasons := array_append(fraud_reasons, 'Multiple events from same IP');
  END IF;
  
  -- 3. 의심스러운 User-Agent 체크
  IF NEW.user_agent LIKE '%bot%' OR NEW.user_agent LIKE '%crawler%' THEN
    fraud_score := fraud_score + 20;
    fraud_reasons := array_append(fraud_reasons, 'Suspicious user agent');
  END IF;
  
  -- 4. 높은 전환율 체크 (비현실적으로 높은 경우)
  IF EXISTS (
    SELECT 1 FROM referral_links 
    WHERE id = NEW.link_id 
    AND conversions_count::FLOAT / NULLIF(clicks_count, 0) > 0.8
  ) THEN
    fraud_score := fraud_score + 15;
    fraud_reasons := array_append(fraud_reasons, 'Unrealistically high conversion rate');
  END IF;
  
  -- 사기 점수가 임계값을 넘으면 사기 신호 생성
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

-- 조직 통계 뷰 생성
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

-- 캠페인 성과 뷰 생성
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

-- 참여자 성과 뷰 생성
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
