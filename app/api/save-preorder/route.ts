import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, timestamp, amount, currency } = body

    // 이메일 유효성 검사
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Neon DB에 저장
    const result = await sql`
      INSERT INTO preorders (email, amount, currency, created_at)
      VALUES (${email}, ${amount}, ${currency}, ${timestamp || new Date().toISOString()})
      RETURNING id, email, created_at
    `
    
    console.log('💰 New Preorder saved to DB:', {
      id: result[0].id,
      email: result[0].email,
      amount,
      currency,
      created_at: result[0].created_at
    })

    // TODO: 이메일 발송 로직 추가 (선택사항)
    // 예시: await sendWelcomeEmail(email)

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
