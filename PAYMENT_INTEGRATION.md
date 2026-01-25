# PayPal Payment Integration - 변경사항 정리

## 📅 작업 일자
2026년 1월 26일

## 🎯 작업 목표
ParrotKit Early Access 결제 시스템 구축 및 사용자 트래킹 구현

---

## 📁 신규 파일 생성

### 1. `/app/preorder/page.tsx`
**목적**: PayPal 결제 체크아웃 페이지

**주요 기능**:
- PayPal Hosted Buttons 통합 (Button ID: `Q2CKSCLB439NS`)
- 결제 전 이메일 수집 및 유효성 검사
- 실시간 카운트다운 타이머 (`landingConfig.nextBatchDeadline`과 동기화)
- 2-column 레이아웃: 좌측 features, 우측 sticky payment sidebar
- 소셜 프루프: "411+ creators joined this month"
- 긴급성 표시: "Only 89/500 spots left"
- 가격 표시: $99 → $9.99 (90% OFF)
- GA4 이벤트: `payment_checkout_view`, `email_entered`, `paypal_button_render`

**기술 스택**:
- PayPal SDK: `afterInteractive` 로딩 전략
- 15회 polling으로 SDK 안정적 렌더링 보장
- Email validation with real-time feedback
- localStorage를 통한 이메일 저장

### 2. `/app/thanks/page.tsx`
**목적**: 결제 완료 확인 페이지

**주요 기능**:
- 결제 성공 메시지 및 체크 아이콘
- localStorage에서 이메일 가져와서 표시
- `/api/save-preorder` API 호출하여 결제 정보 저장
- GA4 purchase 이벤트 (value: 9.99 USD)
- Next Steps 안내 (이메일 확인, 런칭 안내 대기, 커뮤니티 참여)
- 홈으로 돌아가기 버튼

### 3. `/app/api/save-preorder/route.ts`
**목적**: 결제 정보 저장 API 엔드포인트

**주요 기능**:
- POST 요청으로 이메일, 타임스탬프, 금액 수신
- 이메일 유효성 검사
- 콘솔 로그 출력 (임시)
- TODO: 실제 데이터베이스 연동 필요
- TODO: 이메일 발송 로직 추가 가능

---

## 🔧 수정된 파일

### 1. `components/Hero.tsx`
**변경사항**:
- Primary CTA 버튼 추가: "🔥 90% SALE 🔥 Get Early Access ($9.99)"
  - `/preorder` 페이지로 링크
  - `payment_cta_click` GA4 이벤트
- Secondary CTA: "Analyze (Free)" - 기존 분석 기능 유지
- CTA 버튼 순서: Analyze (secondary) → Get Early Access (primary)

**GA4 이벤트**:
```typescript
gtag('event', 'payment_cta_click', {
  event_category: 'payment_conversion',
  event_label: 'Hero Get Early Access'
})
```

### 2. `components/Header.tsx`
**변경사항**:
- CTA 버튼 텍스트: "🔥 90% SALE → $9.99"
- onClick 이벤트로 `/preorder` 이동
- `payment_cta_click` GA4 이벤트 추가

### 3. `components/Pricing.tsx`
**변경사항**:
- 4-column 그리드로 변경 (기존 3-column)
- 신규 플랜 추가: "Early Access"
  - 가격: ~~$99~~ → **$9.99**
  - 기간: 3 months
  - 특징: "90% OFF - LIMITED TIME", "All features included", "Priority access", "Cancel anytime"
  - CTA 링크: `/preorder`
  - 하이라이트 스타일 (purple gradient border)
- 모든 플랜 CTA에 `payment_pricing_click` GA4 이벤트

### 4. `components/FinalCTA.tsx`
**변경사항**:
- 버튼 텍스트 변경: "Get early access" → **"Get your Recipe"**
- GA4 이벤트: `recipe_lead`, `recipe_signup_success`
- **목적**: 결제 폼과 구분하여 레시피 전달 폼임을 명확히 표시

### 5. `components/UnlockModal.tsx`
**변경사항**:
- GA4 이벤트 이름 변경:
  - `recipe_modal_submit` (기존: unlock_modal_submit)
  - `recipe_modal_success` (기존: unlock_modal_success)
- **목적**: recipe_conversion 카테고리로 분류하여 payment_conversion과 구분

---

## 📊 Analytics 전략

### 전환 퍼널 분리
1. **Payment Conversion** (결제 전환)
   - Hero CTA → Header CTA → Pricing CTA → `/preorder` → PayPal → `/thanks`
   - GA4 이벤트: `payment_cta_click`, `payment_checkout_view`, `email_entered`, `paypal_button_render`, `purchase`

2. **Recipe Conversion** (레시피 전환)
   - FinalCTA → UnlockModal → 이메일 제출 → 레시피 전달
   - GA4 이벤트: `recipe_lead`, `recipe_modal_submit`, `recipe_modal_success`, `recipe_signup_success`

### 이벤트 카테고리
- `payment_conversion`: 실제 결제 전환 추적
- `recipe_conversion`: 무료 레시피 전달 추적
- `engagement`: 일반 참여도 추적

---

## 🎨 디자인 일관성

### 카운트다운 타이머
- **소스**: `landingConfig.nextBatchDeadline` (2026-01-29 23:59:59)
- **위치**: 
  - Hero 섹션: FOMOWidget
  - Preorder 페이지: Flash Sale Banner
- **형식**: Days, Hours, Minutes, Seconds

### 숫자 일관성
- **총 크리에이터**: 10K+ (Hero, Preorder)
- **이번 달 가입**: 411+ creators (Preorder)
- **남은 자리**: 89/500 spots (FOMOWidget, Preorder)

### 이메일 주소 통일
- **변경 전**: `support@parrotkit.com`, `parrotkit.contact@gmail.com`
- **변경 후**: `contact@parrotkit.online` (모든 페이지 통일)

---

## 🔐 PayPal 설정 요구사항

### Dashboard 설정 (수동 작업 필요)
1. **Shipping Address**: OFF
   - 이유: 디지털 서비스이므로 배송 주소 불필요

2. **Auto-Return URL**: `https://parrotkit.vercel.app/thanks`
   - 이유: 결제 완료 후 자동 리디렉션

### Button 정보
- **Button ID**: Q2CKSCLB439NS
- **SDK URL**: PayPal Client ID 포함
- **Components**: hosted-buttons
- **Disabled Funding**: venmo
- **Currency**: USD

---

## ✅ 제거된 요소

### 30-Day Money-Back Guarantee
- **위치**: `/app/preorder/page.tsx`
- **이유**: 사용자 요청에 따라 제거
- **제거 전**: Blue box with "💯 30-Day Money-Back Guarantee" 섹션

---

## 📝 추가 구현 사항

### 이메일 트래킹 플로우
1. **사용자**: `/preorder` 페이지에서 이메일 입력
2. **검증**: 실시간 유효성 검사 (정규식)
3. **저장**: localStorage에 `preorder_email` 키로 저장
4. **결제**: PayPal 버튼 클릭 → 결제 진행
5. **리디렉션**: PayPal에서 `/thanks` 페이지로 auto-return
6. **API 호출**: `/api/save-preorder`로 이메일 + 결제 정보 전송
7. **확인**: 이메일 주소 화면에 표시

### 서비스 제공 안내
- **위치**: `/preorder` 페이지, Payment Section
- **텍스트**: "Access will be granted after product launch"
- **스타일**: 작은 이탤릭 텍스트 (text-xs, italic, text-gray-500)

---

## 🚀 배포 전 체크리스트

- [x] TypeScript 컴파일 오류 없음
- [x] 빌드 성공
- [x] PayPal Button ID 정확함
- [x] GA4 이벤트 구현 완료
- [x] 이메일 트래킹 플로우 테스트
- [x] 모든 링크 정상 작동
- [x] 반응형 디자인 확인
- [x] 이메일 주소 통일
- [ ] PayPal Dashboard 설정 (Auto-return URL, Shipping OFF)
- [ ] 실제 데이터베이스 연동 (`/api/save-preorder`)
- [ ] 이메일 발송 시스템 구현 (선택)

---

## 📌 향후 개선 사항

1. **데이터베이스 연동**
   - Neon DB에 `preorders` 테이블 생성
   - 스키마: email (text), timestamp (timestamp), amount (numeric), currency (text)
   - `/api/save-preorder` 라우트에서 실제 저장 로직 구현

2. **이메일 자동화**
   - 결제 완료 시 확인 이메일 발송
   - 서비스 런칭 시 접근 권한 이메일 발송
   - 이메일 템플릿 디자인

3. **보안 강화**
   - PayPal IPN (Instant Payment Notification) 구현
   - 결제 검증 로직 추가
   - CSRF 토큰 보호

4. **Admin Dashboard**
   - 결제 내역 확인 페이지
   - 이메일 목록 내보내기 기능
   - 통계 및 차트

---

## 🎓 기술 학습 포인트

### PayPal Hosted Buttons
- Merchant-hosted 방식으로 빠른 통합 가능
- No server-side code required (초기 단계에 유리)
- Auto-return URL로 사용자 경험 개선

### Next.js App Router
- Server/Client Components 구분
- API Routes with Route Handlers
- Script component의 `afterInteractive` 전략

### GA4 Event Tracking
- Custom event categories로 전환 퍼널 분리
- event_category, event_label로 세분화된 추적

---

**작성자**: GitHub Copilot  
**검토 상태**: 최종 완료  
**브랜치**: `feature/payment-integration`  
**베이스**: `prod`
