# PayPal 결제 추적 설정 가이드

## ✅ 완료된 작업

### 1. 데이터베이스 스키마 업데이트
[database/schema.sql](database/schema.sql)에 다음 필드 추가됨:
- `first_name` - 고객 이름 (PayPal에서 자동 수집)
- `last_name` - 고객 성 (PayPal에서 자동 수집)
- `paypal_transaction_id` - PayPal 거래 ID (tx)
- `paypal_order_id` - PayPal 주문 ID
- `payment_status` - 결제 상태 (completed/pending)
- `payer_id` - PayPal 구매자 ID

### 2. API 업데이트
[app/api/save-preorder/route.ts](app/api/save-preorder/route.ts):
- 이름, 거래ID, 결제 상태 저장
- 중복 이메일 시 정보 업데이트 (UPSERT)
- 로그에 고객 이름 표시

### 3. Thank You 페이지 업데이트
[app/thanks/page.tsx](app/thanks/page.tsx):
- URL 파라미터에서 PayPal 데이터 자동 파싱
- 고객 이름 표시
- 거래 ID를 GA4에 전송

## 🔧 PayPal 설정 필요

### Step 1: PayPal Button에서 Return URL 설정

1. PayPal.com 로그인 → **Seller Tools** → **PayPal Buttons**
2. 생성한 버튼 찾기 (호스팅 버튼 ID: `Q2CKSCLB479NS`)
3. **Edit** 클릭
4. **Step 3: Customize advanced features** 섹션에서:
   - ✅ **Take customers to this URL when they finish checkout:** 체크
   - URL 입력: `https://yourdomain.com/thanks`
   - ✅ **Add advanced variables** 체크 (선택사항)

### Step 2: Return URL에 전달되는 정보

PayPal이 자동으로 다음 파라미터를 `/thanks` 페이지에 전달합니다:

```
/thanks?tx=TRANSACTION_ID&st=Completed&amt=9.99&cc=USD
       &first_name=John&last_name=Doe&payer_email=user@example.com
       &payer_id=PAYERID123&order_id=ORDER123
```

**주요 파라미터:**
- `tx` - 거래 ID (필수)
- `st` - 상태 (Completed, Pending, etc.)
- `amt` - 금액
- `cc` - 통화
- `first_name` - 구매자 이름
- `last_name` - 구매자 성
- `payer_email` - PayPal 이메일
- `payer_id` - PayPal 구매자 ID

### Step 3: 데이터 저장 확인

결제 완료 후:
1. 사용자가 `/thanks` 페이지로 리다이렉트
2. URL 파라미터에서 PayPal 정보 자동 추출
3. DB에 저장:
   ```sql
   INSERT INTO preorders (
     email, first_name, last_name,
     paypal_transaction_id, payment_status
   ) VALUES (...) ON CONFLICT (email) DO UPDATE ...
   ```

## 📊 결제 데이터 조회

### 모든 preorder 보기
```sql
SELECT 
  id,
  email,
  CONCAT(first_name, ' ', last_name) as customer_name,
  amount,
  currency,
  paypal_transaction_id,
  payment_status,
  created_at
FROM preorders
ORDER BY created_at DESC;
```

### 이메일 발송 대상자 리스트
```sql
SELECT 
  email,
  first_name,
  last_name,
  created_at
FROM preorders
WHERE access_granted = FALSE
  AND payment_status = 'completed'
ORDER BY created_at ASC;
```

### CSV로 내보내기 (Neon 콘솔에서)
```sql
COPY (
  SELECT 
    email,
    first_name,
    last_name,
    amount,
    paypal_transaction_id,
    created_at
  FROM preorders
  WHERE payment_status = 'completed'
  ORDER BY created_at DESC
) TO STDOUT WITH CSV HEADER;
```

## 🚀 서비스 출시 시 이메일 발송

### 1. Mailchimp/SendGrid 준비
```javascript
// lib/email.ts 예시
import sendgrid from '@sendgrid/mail'

export async function sendLaunchEmail(email: string, firstName: string) {
  await sendgrid.send({
    to: email,
    from: 'contact@parrotkit.online',
    subject: `${firstName}, ParrotKit is now LIVE! 🎉`,
    html: `
      <h1>Hi ${firstName}!</h1>
      <p>ParrotKit is officially launched!</p>
      <p>Click here to access: <a href="https://app.parrotkit.com">Login Now</a></p>
    `
  })
}
```

### 2. 대량 발송 스크립트
```javascript
// scripts/send-launch-emails.js
import { sql } from '@/lib/db'
import { sendLaunchEmail } from '@/lib/email'

const customers = await sql`
  SELECT email, first_name 
  FROM preorders 
  WHERE access_granted = FALSE 
    AND payment_status = 'completed'
`

for (const customer of customers) {
  await sendLaunchEmail(customer.email, customer.first_name)
  
  // DB 업데이트
  await sql`
    UPDATE preorders 
    SET access_granted = TRUE, 
        access_granted_at = NOW()
    WHERE email = ${customer.email}
  `
  
  console.log(`✅ Email sent to ${customer.first_name} (${customer.email})`)
  
  // Rate limiting
  await new Promise(resolve => setTimeout(resolve, 100))
}
```

## ✅ 체크리스트

- [x] DB 스키마에 이름 필드 추가
- [x] API에서 PayPal 데이터 저장
- [x] Thanks 페이지에서 URL 파라미터 파싱
- [ ] PayPal Button에서 Return URL 설정 (`https://yourdomain.com/thanks`)
- [ ] 테스트 결제로 데이터 저장 확인
- [ ] 이메일 발송 시스템 연동 (SendGrid/Mailchimp)

## ⚠️ 중요 참고사항

1. **이름 정보**: PayPal이 자동으로 제공하므로 별도 입력 불필요
2. **거래 검증**: PayPal IPN(Instant Payment Notification)으로 추가 검증 가능
3. **중복 방지**: 같은 이메일로 재결제 시 기존 데이터 업데이트
4. **GDPR**: 유럽 고객 데이터는 개인정보 보호 규정 준수 필요

## 🔗 추가 리소스

- [PayPal Buttons Documentation](https://developer.paypal.com/docs/paypal-payments-standard/)
- [PayPal IPN Setup](https://developer.paypal.com/api/nvp-soap/ipn/)
- [Neon Database Docs](https://neon.tech/docs)
