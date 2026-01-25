'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function ThanksPage() {
  const [email, setEmail] = useState<string | null>(null)
  const [customerName, setCustomerName] = useState<string>('')
  const searchParams = useSearchParams()

  useEffect(() => {
    // Get email from localStorage
    const savedEmail = localStorage.getItem('preorder_email')
    setEmail(savedEmail)

    // Get PayPal data from URL parameters
    const txId = searchParams.get('tx') // Transaction ID
    const orderId = searchParams.get('order_id') // Order ID
    const payerId = searchParams.get('payer_id') // Payer ID
    const firstName = searchParams.get('first_name') // First name
    const lastName = searchParams.get('last_name') // Last name
    const payerEmail = searchParams.get('payer_email') // PayPal email
    const amount = searchParams.get('amt') || searchParams.get('amount') // Amount
    const currency = searchParams.get('cc') || searchParams.get('currency') // Currency
    const status = searchParams.get('st') || searchParams.get('status') // Payment status

    // Set customer name for display
    if (firstName || lastName) {
      setCustomerName(`${firstName || ''} ${lastName || ''}`.trim())
    }

    // Use PayPal email if no email in localStorage
    const finalEmail = savedEmail || payerEmail

    if (finalEmail) {
      setEmail(finalEmail)
    }

    // Save to backend with complete PayPal data
    if (finalEmail) {
      fetch('/api/save-preorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: finalEmail,
          firstName: firstName || null,
          lastName: lastName || null,
          timestamp: new Date().toISOString(),
          amount: amount ? parseFloat(amount) : 9.99,
          currency: currency || 'USD',
          paypalTransactionId: txId || null,
          paypalOrderId: orderId || null,
          paymentStatus: status === 'Completed' ? 'completed' : 'pending',
          payerId: payerId || null
        })
      })
        .then(res => res.json())
        .then(data => {
          console.log('✅ Preorder saved:', data)
        })
        .catch(err => console.error('❌ Failed to save preorder:', err))
    }

    // Track page view
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'page_view', {
        page_title: 'Parrot Kit - Thank You',
        page_location: window.location.href,
        page_path: '/thanks'
      })
      
      // Track conversion
      ;(window as any).gtag('event', 'purchase', {
        event_category: 'payment_conversion',
        event_label: 'Early Access Purchase Complete',
        value: amount ? parseFloat(amount) : 9.99,
        currency: currency || 'USD',
        transaction_id: txId || 'unknown'
      })
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Success Icon */}
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full shadow-2xl mb-8">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Payment Received{customerName && `, ${customerName.split(' ')[0]}`}! 🎉
        </h1>
        
        <p className="text-xl text-gray-600 mb-8">
          Welcome to the ParrotKit early access program
        </p>

        {email && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              📧 Confirmation sent to: <strong>{email}</strong>
            </p>
            {customerName && (
              <p className="text-sm text-blue-700 mt-1">
                👤 Name: <strong>{customerName}</strong>
              </p>
            )}
          </div>
        )}

        {/* Info Box */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 text-left">
          <h2 className="text-2xl font-bold mb-4 text-center">What's Next?</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-sm">
                1
              </span>
              <p className="text-gray-700 pt-1">
                Check your email for access instructions and your account details
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-sm">
                2
              </span>
              <p className="text-gray-700 pt-1">
                You'll receive early access to ParrotKit within 24 hours
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-sm">
                3
              </span>
              <p className="text-gray-700 pt-1">
                Start creating viral content with unlimited recipe breakdowns
              </p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <Link
          href="/"
          className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transition font-bold text-lg shadow-lg"
        >
          Return to Homepage
        </Link>

        {/* Support */}
        <p className="mt-8 text-sm text-gray-500">
          Questions? Contact us at{' '}
          <a href="mailto:contact@parrotkit.online" className="text-purple-600 hover:underline">
            contact@parrotkit.online
          </a>
        </p>
      </div>
    </div>
  )
}
