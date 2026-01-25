'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function ThanksPage() {
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    // Get email from localStorage
    const savedEmail = localStorage.getItem('preorder_email')
    setEmail(savedEmail)

    // Save to backend (placeholder - 실제 API로 교체 필요)
    if (savedEmail) {
      fetch('/api/save-preorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: savedEmail,
          timestamp: new Date().toISOString(),
          amount: 9.99,
          currency: 'USD'
        })
      }).catch(err => console.error('Failed to save preorder:', err))
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
        value: 9.99,
        currency: 'USD'
      })
    }
  }, [])

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
          Payment Received! 🎉
        </h1>
        
        <p className="text-xl text-gray-600 mb-8">
          Welcome to the ParrotKit early access program
        </p>

        {email && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              📧 Confirmation sent to: <strong>{email}</strong>
            </p>
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
