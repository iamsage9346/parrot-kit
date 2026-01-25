# Neon Database Setup Instructions

## 개발자에게 전달할 내용

### 1. Neon Database 생성
1. [Neon Console](https://console.neon.tech)에 로그인
2. 새 프로젝트 생성: `parrotkit-production`
3. Region 선택: 가장 가까운 지역 (예: AWS ap-northeast-2 Seoul)
4. PostgreSQL 버전: 최신 버전 사용

### 2. Database Schema 생성
`database/schema.sql` 파일의 내용을 Neon SQL Editor에서 실행:

```sql
-- schema.sql 내용 전체 복사 & 실행
```

### 3. Connection String 설정
Neon Dashboard에서 Connection String 복사:

**형식**:
```
postgresql://[user]:[password]@[endpoint]/[database]?sslmode=require
```

**환경변수 설정**:
```bash
# .env.local 파일에 추가
DATABASE_URL="postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require"
```

**Vercel 배포 시**:
1. Vercel Dashboard → Project Settings → Environment Variables
2. `DATABASE_URL` 추가
3. Value에 Neon Connection String 붙여넣기
4. Production, Preview, Development 모두 체크

### 4. 테이블 확인
SQL Editor에서 다음 쿼리 실행하여 테이블 생성 확인:

```sql
-- 테이블 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- preorders 테이블 구조 확인
\d preorders
```

### 5. 테스트 데이터 삽입 (선택사항)
```sql
-- 테스트 preorder 생성
INSERT INTO preorders (email, amount, currency)
VALUES ('test@example.com', 9.99, 'USD');

-- 확인
SELECT * FROM preorders;
```

---

## API 엔드포인트 정보

### POST /api/save-preorder
결제 완료 시 호출되는 API

**Request Body**:
```json
{
  "email": "user@example.com",
  "amount": 9.99,
  "currency": "USD",
  "timestamp": "2026-01-26T10:30:00.000Z"
}
```

**Response (Success)**:
```json
{
  "success": true,
  "message": "Preorder saved successfully",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "created_at": "2026-01-26T10:30:00.000Z"
  }
}
```

**Response (Error)**:
```json
{
  "error": "Invalid email address"
}
```

---

## 보안 고려사항

### 1. Connection String 보안
- ✅ `.env.local`에만 저장 (절대 커밋하지 말 것)
- ✅ Vercel Environment Variables 사용
- ❌ 코드에 하드코딩 금지

### 2. Email Validation
- 현재: 간단한 `@` 체크
- 권장: 정규식으로 강화된 검증

### 3. Rate Limiting
- 권장: 동일 이메일로 반복 결제 방지
- 구현 예시:
```sql
-- 중복 이메일 체크
SELECT COUNT(*) FROM preorders WHERE email = $1;
```

---

## 유용한 쿼리

### 전체 Preorder 수 확인
```sql
SELECT COUNT(*) as total_preorders FROM preorders;
```

### 최근 10개 주문 조회
```sql
SELECT id, email, amount, created_at 
FROM preorders 
ORDER BY created_at DESC 
LIMIT 10;
```

### 접근 권한 미부여 사용자 조회
```sql
SELECT email, created_at 
FROM preorders 
WHERE access_granted = FALSE
ORDER BY created_at ASC;
```

### 특정 날짜 범위 주문 조회
```sql
SELECT * 
FROM preorders 
WHERE created_at >= '2026-01-26' 
  AND created_at < '2026-01-27';
```

### 일별 매출 통계
```sql
SELECT 
  DATE(created_at) as order_date,
  COUNT(*) as orders,
  SUM(amount) as total_revenue
FROM preorders
GROUP BY DATE(created_at)
ORDER BY order_date DESC;
```

---

## Troubleshooting

### 연결 오류
```
Error: No database connection string was provided to `neon()`
```
**해결**: `.env.local`에 `DATABASE_URL` 추가 확인

### SSL 오류
```
Error: SSL connection required
```
**해결**: Connection string에 `?sslmode=require` 추가

### 권한 오류
```
Error: permission denied for table preorders
```
**해결**: Neon user에게 테이블 권한 부여
```sql
GRANT ALL PRIVILEGES ON TABLE preorders TO your_neon_user;
GRANT USAGE, SELECT ON SEQUENCE preorders_id_seq TO your_neon_user;
```

---

## 다음 단계 (선택사항)

### 1. 이메일 알림 시스템
- Resend, SendGrid 등 이메일 서비스 연동
- 결제 완료 시 자동 확인 이메일 발송
- 서비스 런칭 시 접근 권한 이메일 발송

### 2. Admin Dashboard
- 결제 내역 조회 페이지 제작
- 이메일 목록 CSV 내보내기 기능
- 접근 권한 부여 토글 기능

### 3. Analytics 연동
- GA4와 DB 데이터 동기화
- 결제 성공률 추적
- 일별/주별 매출 대시보드

---

**작성일**: 2026-01-26  
**작성자**: ParrotKit Dev Team  
**문의**: contact@parrotkit.online
