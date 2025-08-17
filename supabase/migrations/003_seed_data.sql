-- Migration: 003_seed_data.sql
-- Description: Seed data for development and testing
-- Date: 2024-01-01

-- 샘플 조직 데이터
INSERT INTO organizations (id, name, plan, region, settings) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', '테스트 회사 A', 'pro', 'KR', '{"timezone": "Asia/Seoul", "currency": "KRW"}'),
  ('550e8400-e29b-41d4-a716-446655440002', '샘플 스타트업', 'starter', 'CA', '{"timezone": "America/Toronto", "currency": "CAD"}'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Demo Corp', 'pro', 'US', '{"timezone": "America/New_York", "currency": "USD"}');

-- 샘플 캠페인 데이터
INSERT INTO campaigns (id, org_id, name, description, status, start_at, end_at, goal, reward_policy, landing_url) VALUES
  ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '친구 추천 이벤트', '친구를 추천하고 보상을 받으세요!', 'active', NOW(), NOW() + INTERVAL '30 days', '{"target_conversions": 100, "target_revenue": 1000000}', '{"type": "cash", "amount": 10000, "currency": "KRW", "conditions": ["first_purchase"]}', 'https://example.com/landing'),
  ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '신규 고객 유치', '새로운 고객을 소개해주세요', 'draft', NULL, NULL, '{"target_conversions": 50, "target_revenue": 500000}', '{"type": "discount", "amount": 20, "currency": "percent", "conditions": ["signup"]}', 'https://example.com/signup'),
  ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Referral Program', 'Bring your friends and earn rewards!', 'active', NOW(), NOW() + INTERVAL '60 days', '{"target_conversions": 200, "target_revenue": 50000}', '{"type": "credit", "amount": 50, "currency": "CAD", "conditions": ["first_purchase"]}', 'https://demo.com/referral');

-- 샘플 참여자 데이터
INSERT INTO participants (id, org_id, email, phone, name, locale, meta) VALUES
  ('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'user1@example.com', '010-1234-5678', '김철수', 'ko', '{"source": "email", "tags": ["early_adopter"]}'),
  ('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'user2@example.com', '010-2345-6789', '이영희', 'ko', '{"source": "social", "tags": ["influencer"]}'),
  ('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'user3@example.com', '010-3456-7890', '박민수', 'ko', '{"source": "referral", "tags": ["vip"]}'),
  ('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'john@demo.com', '+1-555-0123', 'John Smith', 'en', '{"source": "website", "tags": ["new_user"]}'),
  ('770e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 'jane@demo.com', '+1-555-0124', 'Jane Doe', 'en', '{"source": "referral", "tags": ["returning"]}');

-- 샘플 추천 링크 데이터
INSERT INTO referral_links (id, campaign_id, participant_id, code, utm, clicks_count, conversions_count) VALUES
  ('880e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'KIM123', '{"utm_source": "referral", "utm_medium": "email", "utm_campaign": "friend_event"}', 15, 3),
  ('880e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440002', 'LEE456', '{"utm_source": "referral", "utm_medium": "social", "utm_campaign": "friend_event"}', 8, 1),
  ('880e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440004', 'JOHN789', '{"utm_source": "referral", "utm_medium": "email", "utm_campaign": "referral_program"}', 25, 7),
  ('880e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440005', 'JANE012', '{"utm_source": "referral", "utm_medium": "social", "utm_campaign": "referral_program"}', 12, 4);

-- 샘플 이벤트 데이터
INSERT INTO events (id, org_id, campaign_id, participant_id, link_id, type, value, ip, user_agent, referrer, meta) VALUES
  ('990e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', 'click', 0, '192.168.1.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'https://facebook.com', '{"device": "desktop", "browser": "chrome"}'),
  ('990e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440002', 'click', 0, '192.168.1.2', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15', 'https://instagram.com', '{"device": "mobile", "browser": "safari"}'),
  ('990e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440001', 'purchase', 150000, '192.168.1.3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'https://example.com', '{"device": "desktop", "browser": "chrome", "order_id": "ORD123"}'),
  ('990e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440004', '880e8400-e29b-41d4-a716-446655440003', 'click', 0, '192.168.1.4', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 'https://twitter.com', '{"device": "desktop", "browser": "firefox"}'),
  ('990e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440004', 'purchase', 75.50, '192.168.1.5', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15', 'https://demo.com', '{"device": "mobile", "browser": "safari", "order_id": "ORD456"}');

-- 샘플 전환 데이터
INSERT INTO conversions (id, org_id, campaign_id, referrer_participant_id, referee_participant_id, value, first_purchase, meta) VALUES
  ('aa0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440003', 150000, TRUE, '{"conversion_type": "first_purchase", "product_category": "electronics"}'),
  ('aa0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440005', 75.50, TRUE, '{"conversion_type": "first_purchase", "product_category": "services"}');

-- 샘플 보상 데이터
INSERT INTO rewards (id, org_id, participant_id, campaign_id, conversion_id, type, amount, currency, status, reason, paid_at) VALUES
  ('bb0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440001', 'cash', 10000, 'KRW', 'approved', '{"reason": "first_purchase_referral", "conversion_value": 150000}', NULL),
  ('bb0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440003', 'aa0e8400-e29b-41d4-a716-446655440002', 'credit', 50, 'CAD', 'pending', '{"reason": "first_purchase_referral", "conversion_value": 75.50}', NULL);

-- 샘플 AI 감사 로그 데이터
INSERT INTO ai_audit (id, org_id, kind, input_summary, output_summary, model, prompt_id, tokens_used, cost) VALUES
  ('cc0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'copy', '친구 추천 이벤트 카피 생성', '친구를 추천하고 10,000원을 받으세요!', 'gpt-4', 'copy_gen_001', 150, 0.003),
  ('cc0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'reward_suggest', '보상 정책 최적화 제안', '현재 전환율을 고려할 때 15,000원으로 인상 권장', 'gpt-4', 'reward_opt_001', 200, 0.004),
  ('cc0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'moderation', '사용자 생성 콘텐츠 검토', '부적절한 내용 없음 - 승인', 'gpt-4', 'mod_001', 50, 0.001);
