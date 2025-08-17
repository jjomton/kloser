# Kloser Database Migrations

이 디렉토리는 Kloser SaaS의 데이터베이스 마이그레이션 파일들을 포함합니다.

## 마이그레이션 파일 구조

### 001_initial_schema.sql
- 초기 데이터베이스 스키마 생성
- 모든 테이블, 인덱스, 제약조건 정의
- 업데이트 트리거 함수 생성

### 002_row_level_security.sql
- Row-Level Security (RLS) 정책 설정
- 멀티테넌트 데이터 격리 보장
- 공개 접근 정책 (추천 링크, 이벤트 기록)

### 003_seed_data.sql
- 개발 및 테스트용 샘플 데이터
- 조직, 캠페인, 참여자, 링크, 이벤트, 전환, 보상 데이터
- AI 감사 로그 샘플

### 004_functions_and_triggers.sql
- 비즈니스 로직 함수들
- 자동 통계 업데이트 트리거
- 사기 탐지 로직
- 성과 분석 뷰들

### 005_rollback_migration.sql
- 모든 변경사항을 되돌리는 롤백 스크립트
- **주의**: 모든 데이터가 삭제됩니다!

## 마이그레이션 실행 방법

### Supabase CLI 사용 (권장)

1. Supabase CLI 설치:
```bash
npm install -g supabase
```

2. 프로젝트 초기화:
```bash
supabase init
```

3. 마이그레이션 실행:
```bash
# 로컬 개발 환경
supabase db reset

# 프로덕션 환경
supabase db push
```

### 수동 실행

1. Supabase 대시보드에서 SQL Editor 접속
2. 각 마이그레이션 파일을 순서대로 실행:
   - 001_initial_schema.sql
   - 002_row_level_security.sql
   - 003_seed_data.sql (선택사항)
   - 004_functions_and_triggers.sql

## 데이터베이스 스키마 개요

### 핵심 테이블

1. **organizations** - 조직(테넌트) 정보
2. **org_users** - 조직-사용자 매핑 및 역할
3. **campaigns** - 추천 캠페인
4. **participants** - 참여자 (추천자/피추천자)
5. **referral_links** - 추천 링크
6. **events** - 이벤트 추적 (클릭, 가입, 구매 등)
7. **conversions** - 전환 (보상 산정 기준)
8. **rewards** - 보상
9. **fraud_signals** - 사기 신호
10. **ai_audit** - AI 사용 로그

### 주요 기능

- **멀티테넌트**: RLS를 통한 데이터 격리
- **자동 통계**: 이벤트 발생시 자동 카운터 업데이트
- **자동 보상**: 전환 발생시 자동 보상 생성
- **사기 탐지**: 의심스러운 패턴 자동 감지
- **성과 분석**: 실시간 통계 뷰 제공

## 보안 고려사항

1. **RLS 정책**: 모든 테이블에 RLS 활성화
2. **역할 기반 접근**: owner, admin, analyst 역할 구분
3. **공개 접근**: 추천 링크와 이벤트 기록만 공개 허용
4. **데이터 격리**: org_id 기반 완전한 데이터 격리

## 성능 최적화

1. **인덱스**: 자주 조회되는 컬럼에 인덱스 생성
2. **JSONB**: 유연한 메타데이터 저장
3. **뷰**: 복잡한 조인을 뷰로 캐싱
4. **트리거**: 실시간 통계 업데이트

## 문제 해결

### 마이그레이션 실패시

1. 롤백 스크립트 실행:
```sql
-- 005_rollback_migration.sql 실행
```

2. 다시 마이그레이션 실행:
```sql
-- 001부터 순서대로 재실행
```

### RLS 정책 문제

1. 정책 확인:
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

2. 정책 재생성:
```sql
-- 002_row_level_security.sql 재실행
```

## 개발 환경 설정

1. 환경 변수 설정:
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

2. 데이터베이스 타입 생성:
```bash
npx supabase gen types typescript --project-id your_project_id > src/types/database.ts
```

## 모니터링

### 주요 쿼리

1. 조직별 통계:
```sql
SELECT * FROM organization_stats;
```

2. 캠페인 성과:
```sql
SELECT * FROM campaign_performance;
```

3. 참여자 성과:
```sql
SELECT * FROM participant_performance;
```

### 알림 설정

- 사기 신호 발생시 알림
- 전환율 임계값 초과시 알림
- 보상 지급 완료시 알림

## 백업 및 복구

### 백업
```bash
# 전체 데이터베이스 백업
pg_dump your_database > backup.sql
```

### 복구
```bash
# 백업에서 복구
psql your_database < backup.sql
```

## 라이센스

이 마이그레이션 파일들은 MIT 라이센스 하에 배포됩니다.
