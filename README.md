# Kloser - AI 결합 지인추천 캠페인 SaaS

> 멀티테넌트 환경에서 추천 링크 생성, 전환 추적, 보상 계산, AI 카피 생성까지 end-to-end 지인추천 캠페인 플랫폼

## 🚀 배포 상태

- **로컬 개발**: ✅ 정상 작동 (localhost:3001)
- **Vercel 배포**: 🔄 배포 중 (kloser.vercel.app)
- **GitHub**: ✅ 동기화 완료

## 🚀 주요 기능

- **멀티테넌트 관리**: 조직별 워크스페이스와 역할 기반 권한 관리
- **실시간 추적**: 클릭부터 전환까지 모든 단계를 실시간으로 추적
- **AI 카피 생성**: 업종과 채널에 최적화된 추천 메시지 자동 생성
- **부정 방지**: AI 기반 부정 탐지 시스템으로 사기 행위 사전 차단
- **성과 분석**: 세그먼트별 성과 분석과 A/B 테스트
- **자동화**: 보상 지급부터 리포트 발송까지 모든 프로세스 자동화

## 🛠 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **AI**: OpenAI API (GPT-4, Moderation)
- **Payment**: Stripe
- **Email**: Resend
- **Automation**: n8n (워크플로우 자동화)
- **Charts**: Recharts
- **State Management**: React Query, Server Actions

## 📋 요구사항

- Node.js 18+ 
- npm 또는 yarn
- Supabase 계정
- OpenAI API 키
- Stripe 계정 (선택사항)

## 🚀 빠른 시작

### 1. 저장소 클론

```bash
git clone <repository-url>
cd kloser
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe 설정
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# OpenAI 설정
OPENAI_API_KEY=sk-...

# Resend (이메일 발송)
RESEND_API_KEY=re_...

# 앱 설정
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# n8n 웹훅 (선택사항)
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/kloser
```

### 4. 데이터베이스 설정

Supabase 프로젝트에서 SQL 에디터를 열고 다음 파일들을 실행하세요:

1. `supabase/schema.sql` - 데이터베이스 스키마 생성
2. `supabase/rls.sql` - Row-Level Security 정책 설정

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 📁 프로젝트 구조

```
kloser/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # 인증 관련 페이지
│   │   ├── (dashboard)/       # 대시보드 페이지
│   │   ├── api/               # API 라우트
│   │   └── r/                 # 추천 링크 리다이렉트
│   ├── components/            # React 컴포넌트
│   │   ├── ui/               # 기본 UI 컴포넌트
│   │   └── ...               # 기능별 컴포넌트
│   ├── lib/                  # 유틸리티 함수
│   ├── hooks/                # 커스텀 훅
│   └── types/                # TypeScript 타입 정의
├── supabase/                 # 데이터베이스 스키마
├── public/                   # 정적 파일
└── ...
```

## 🔧 주요 기능 구현

### 멀티테넌트 아키텍처

- Supabase Row-Level Security (RLS)를 사용한 데이터 격리
- 조직별 사용자 권한 관리 (Owner, Admin, Analyst)
- 테넌트별 설정 및 제한사항 관리

### 추천 링크 시스템

- 짧은 고유 코드 생성 (`/r/[code]`)
- UTM 파라미터 자동 추가
- 클릭 추적 및 전환 기록
- QR 코드 자동 생성

### AI 기능

- **카피 생성**: 업종/채널/톤별 최적화된 메시지 생성
- **보상 제안**: 데이터 기반 보상 전략 제안
- **부정 탐지**: AI 모더레이션으로 부적절한 콘텐츠 필터링
- **성과 최적화**: 캠페인 성과 분석 및 개선 제안

### 보상 시스템

- 양방향 보상 정책 (추천인/피추천인)
- 다양한 보상 유형 (현금, 크레딧, 할인, 기프트)
- 자동 보상 계산 및 지급 예약
- 부정 방지를 위한 검토 프로세스

### 대시보드 및 분석

- 실시간 KPI 모니터링
- 세그먼트별 성과 분석
- 채널별 전환율 비교
- 상위 추천인 랭킹
- 시계열 차트 및 히트맵

## 🔒 보안 및 컴플라이언스

- **PIPEDA 준수**: 캐나다 개인정보보호법 준수
- **CASL 준수**: 스팸 방지법 준수 (명시적 동의)
- **데이터 암호화**: 전송 및 저장 시 암호화
- **감사 로그**: 모든 AI 사용 내역 기록
- **접근 제어**: 역할 기반 권한 관리

## 🚀 배포

### Vercel 배포
1. [Vercel](https://vercel.com) 계정 생성
2. GitHub 저장소 연결
3. 환경 변수 설정
4. 자동 배포 활성화

### 환경 변수 설정
Vercel 대시보드에서 다음 환경 변수를 설정하세요:

```bash
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI 설정
OPENAI_API_KEY=your_openai_api_key

# Stripe 설정
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# 이메일 설정
RESEND_API_KEY=your_resend_api_key

# NextAuth 설정
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-domain.vercel.app
```

### Supabase 배포
1. Supabase 프로젝트 생성
2. 데이터베이스 마이그레이션 실행
3. Edge Functions 배포 (필요시)

### 배포 전 체크리스트
- [ ] 환경 변수 설정 완료
- [ ] Supabase 데이터베이스 마이그레이션 실행
- [ ] 도메인 설정 (선택사항)
- [ ] SSL 인증서 확인
- [ ] 성능 모니터링 설정

### 배포 후 확인사항
- [ ] 홈페이지 접속 확인
- [ ] 인증 기능 테스트
- [ ] API 엔드포인트 테스트
- [ ] 성능 모니터링 대시보드 확인
- [ ] 에러 로깅 확인

## 📊 성능 최적화

### Core Web Vitals 최적화
- **LCP (Largest Contentful Paint)**: 이미지 최적화 및 프리로딩
- **FID (First Input Delay)**: JavaScript 번들 최적화
- **CLS (Cumulative Layout Shift)**: 레이아웃 안정성 보장

### 기술적 최적화
- **이미지 최적화**: Next.js Image 컴포넌트 사용
- **코드 스플리팅**: 동적 import로 번들 크기 최적화
- **캐싱**: React Query로 서버 상태 캐싱
- **CDN**: Vercel Edge Network 활용
- **압축**: gzip/brotli 압축 활성화
- **미니피케이션**: CSS/JS 파일 최소화

### 성능 모니터링
- **실시간 모니터링**: Core Web Vitals 추적
- **사용자 행동 분석**: 세션 및 페이지뷰 분석
- **에러 추적**: 자동 에러 감지 및 알림
- **성능 대시보드**: 실시간 성능 지표 확인

## 🧪 테스트

```bash
# 단위 테스트 실행
npm run test

# 테스트 UI 실행
npm run test:ui

# E2E 테스트 (선택사항)
npm run test:e2e
```

## 📈 모니터링

### 실시간 모니터링
- **Core Web Vitals**: LCP, FID, CLS 실시간 추적
- **사용자 행동**: 세션, 페이지뷰, 이탈률 분석
- **에러 추적**: 자동 에러 감지 및 알림
- **성능 대시보드**: 실시간 성능 지표 확인

### 외부 도구 연동
- **에러 추적**: Sentry 연동 (선택사항)
- **성능 모니터링**: Vercel Analytics
- **사용자 행동**: Google Analytics 4
- **서버 상태**: Supabase 대시보드

### 알림 설정
- **성능 임계값**: Core Web Vitals 임계값 초과 시 알림
- **에러 알림**: 중요 에러 발생 시 즉시 알림
- **사용량 알림**: 리소스 사용량 임계값 알림

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🆘 지원

- **문서**: [docs.kloser.com](https://docs.kloser.com)
- **이메일**: support@kloser.com
- **Discord**: [Kloser Community](https://discord.gg/kloser)

## 🗺 로드맵

### MVP (4-6주) ✅
- [x] 멀티테넌트 기본 구조
- [x] 추천 링크 생성 및 추적
- [x] 기본 AI 카피 생성
- [x] 대시보드 및 분석

### V1 (2-3개월) 🚧
- [ ] A/B 테스트 기능
- [ ] 고급 AI 최적화
- [ ] Shopify/WooCommerce 통합
- [ ] 자동 리포트 발송

### V1.5 (3-4개월) 📋
- [ ] 보상 지급 자동화
- [ ] 멤버 포털
- [ ] 다국어 지원

### V2 (5-6개월) 📋
- [ ] AI 운영 코파일럿
- [ ] 고급 부정 탐지
- [ ] 로컬라이제이션

---

**Kloser**로 지인추천 캠페인의 성과를 극대화하세요! 🚀
#   k l o s e r _ a i 
 
 