import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      email, 
      firstName, 
      lastName, 
      timestamp, 
      amount, 
      currency,
      paypalTransactionId,
      paypalOrderId,
      paymentStatus,
      payerId
    } = body

    // 이메일 유효성 검사
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Neon DB에 저장
    const result = await sql`
      INSERT INTO preorders (
        email, 
        first_name, 
        last_name, 
        amount, 
        currency, 
        paypal_transaction_id,
        paypal_order_id,
        payment_status,
        payer_id,
        created_at
      )
      VALUES (
        ${email}, 
        ${firstName || null}, 
        ${lastName || null}, 
        ${amount}, 
        ${currency}, 
        ${paypalTransactionId || null},
        ${paypalOrderId || null},
        ${paymentStatus || 'completed'},
        ${payerId || null},
        ${timestamp || new Date().toISOString()}
      )
      ON CONFLICT (email) 
      DO UPDATE SET
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        paypal_transaction_id = EXCLUDED.paypal_transaction_id,
        paypal_order_id = EXCLUDED.paypal_order_id,
        payment_status = EXCLUDED.payment_status,
        payer_id = EXCLUDED.payer_id,
        amount = EXCLUDED.amount
      RETURNING id, email, first_name, last_name, created_at
    `
    
    console.log('💰 New Preorder saved to DB:', {
      id: result[0].id,
      email: result[0].email,
      name: `${result[0].first_name || ''} ${result[0].last_name || ''}`.trim(),
      amount,
      currency,
      paypalTransactionId,
      paymentStatus,
      created_at: result[0].created_at
    })

    // TODO: 이메일 발송 로직 추가 (선택사항)
    // 예시: await sendWelcomeEmail(email, firstName)

    return NextResponse.json({
      success: true,
      message: 'Preorder saved successfully',
      data: result[0]
    })
  } catch (error) {
    console.error('Error saving preorder:', error)
    return NextResponse.json(
      { error: 'Failed to save preorder', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
