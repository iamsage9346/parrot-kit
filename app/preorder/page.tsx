'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Script from 'next/script'
import { landingConfig } from '@/lib/landingConfig'

export default function PreorderPage() {
  const [isPayPalLoaded, setIsPayPalLoaded] = useState(false)
  const [isButtonRendered, setIsButtonRendered] = useState(false)
  const [renderError, setRenderError] = useState(false)
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [isEmailValid, setIsEmailValid] = useState(false)

  useEffect(() => {
    // Track page view
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'page_view', {
        page_title: 'Parrot Kit - Preorder',
        page_location: window.location.href,
        page_path: '/preorder'
      })
    }
  }, [])

  useEffect(() => {
    // Countdown timer - synced with landingConfig
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const deadline = landingConfig.nextBatchDeadline.getTime()
      const difference = deadline - now

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        }
      }
      return { days: 0, hours: 0, minutes: 0, seconds: 0 }
    }

    setTimeLeft(calculateTimeLeft())
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)
    
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!isPayPalLoaded || isButtonRendered) return

    // Polling to ensure PayPal SDK is fully loaded
    let attempts = 0
    const maxAttempts = 15
    
    const attemptRender = () => {
      attempts++
      
      if (typeof window !== 'undefined' && (window as any).paypal?.HostedButtons) {
        try {
          ;(window as any).paypal.HostedButtons({
            hostedButtonId: "Q2CKSCLB479NS",
          }).render("#paypal-container-Q2CKSCLB479NS")
          
          setIsButtonRendered(true)
          
          // Track PayPal button render
          if ((window as any).gtag) {
            (window as any).gtag('event', 'paypal_button_render', {
              event_category: 'payment_conversion',
              event_label: 'PayPal Button Rendered'
            })
          }
        } catch (error) {
          console.error('PayPal render error:', error)
          if (attempts >= maxAttempts) {
            setRenderError(true)
          }
        }
      } else if (attempts < maxAttempts) {
        setTimeout(attemptRender, 200)
      } else {
        setRenderError(true)
      }
    }

    attemptRender()
  }, [isPayPalLoaded, isButtonRendered])

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    
    if (value.trim() === '') {
      setEmailError('')
      setIsEmailValid(false)
    } else if (validateEmail(value)) {
      setEmailError('')
      setIsEmailValid(true)
      // Save to localStorage for tracking after payment
      localStorage.setItem('preorder_email', value)
      
      // GA4 Event
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'email_entered', {
          event_category: 'payment_conversion',
          event_label: 'Email Entered for Preorder'
        })
      }
    } else {
      setEmailError('Please enter a valid email address')
      setIsEmailValid(false)
    }
  }

  return (
    <>
      {/* PayPal SDK Script */}
      <Script
        src="https://www.paypal.com/sdk/js?client-id=BAAHTZkylCJoDz0R6z2j-BcLOo9xZr4h6rcPPF5015n-Mt9WzZl-Cs0HPU7iVTpxvDG0idZTNknARopMB0&components=hosted-buttons&disable-funding=venmo&currency=USD"
        onLoad={() => setIsPayPalLoaded(true)}
        strategy="afterInteractive"
      />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex-shrink-0">
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  ParrotKit
                </span>
              </Link>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span className="font-medium">Secure Checkout</span>
              </div>
            </div>
          </nav>
        </header>

        {/* Main Content */}
        <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            
            {/* Limited Time Offer Banner */}
            <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-2xl p-4 mb-8 text-center shadow-lg">
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <span className="font-bold text-lg">⏰ FLASH SALE ENDS IN:</span>
                <div className="flex gap-2">
                  {timeLeft.days > 0 && (
                    <div className="bg-white/20 backdrop-blur px-3 py-1 rounded-lg font-mono font-bold">
                      {String(timeLeft.days).padStart(2, '0')}d
                    </div>
                  )}
                  <div className="bg-white/20 backdrop-blur px-3 py-1 rounded-lg font-mono font-bold">
                    {String(timeLeft.hours).padStart(2, '0')}h
                  </div>
                  <div className="bg-white/20 backdrop-blur px-3 py-1 rounded-lg font-mono font-bold">
                    {String(timeLeft.minutes).padStart(2, '0')}m
                  </div>
                  <div className="bg-white/20 backdrop-blur px-3 py-1 rounded-lg font-mono font-bold">
                    {String(timeLeft.seconds).padStart(2, '0')}s
                  </div>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-5 gap-8">
              
              {/* Left Column - Order Summary */}
              <div className="lg:col-span-3 space-y-6">
                
                {/* Hero Section */}
                <div className="text-center lg:text-left">
                  <div className="inline-block bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
                    🔥 90% OFF - EARLY ACCESS SPECIAL
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    Get Early Access to{' '}
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      ParrotKit
                    </span>
                  </h1>
                  <p className="text-xl text-gray-600 mb-6">
                    Join 10K+ creators shipping viral content consistently
                  </p>
                </div>

                {/* Social Proof */}
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 border-2 border-white"></div>
                      ))}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">411+ creators joined this month</p>
                      <p className="text-sm text-gray-600">⭐ Rated 4.9/5 by early users</p>
                    </div>
                  </div>
                </div>

                {/* What's Included */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
                  <h2 className="text-2xl font-bold mb-6">What's included:</h2>
                  <ul className="space-y-4">
                    {[
                      'Unlimited recipe breakdowns for viral content',
                      'Save & reuse proven templates',
                      'Export shot list, caption flow, and edit cues',
                      'Priority in invite batches',
                      'Direct access to new features',
                      '3 months of full access'
                    ].map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                        <span className="text-gray-700 text-lg">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-2xl mb-2">🔒</div>
                    <p className="text-sm font-semibold text-gray-700">Secure Payment</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-2xl mb-2">⚡</div>
                    <p className="text-sm font-semibold text-gray-700">Instant Access</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-2xl mb-2">✅</div>
                    <p className="text-sm font-semibold text-gray-700">Money-Back</p>
                  </div>
                </div>
              </div>

              {/* Right Column - Payment */}
              <div className="lg:col-span-2">
                <div className="lg:sticky lg:top-24 space-y-6">
                  
                  {/* Pricing Card */}
                  <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 text-white">
                    <div className="text-center mb-6">
                      <div className="text-sm font-semibold mb-2 opacity-90">EARLY ACCESS SPECIAL</div>
                      <div className="flex items-center justify-center gap-3 mb-2">
                        <span className="text-3xl line-through opacity-75">$99</span>
                        <span className="text-6xl font-bold">$9.99</span>
                      </div>
                      <div className="text-lg opacity-90 mb-4">for 3 months</div>
                      <div className="bg-white/20 rounded-lg px-4 py-3 text-sm backdrop-blur">
                        🎯 That's 90% OFF regular pricing!
                      </div>
                    </div>

                    {/* Urgency */}
                    <div className="bg-red-500/30 border-2 border-red-300/50 rounded-lg px-4 py-3 text-sm text-center mb-4">
                      ⚠️ Only <strong>89/500 spots</strong> left at this price
                    </div>
                  </div>

                  {/* Payment Section */}
                  <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-100">
                    <h3 className="text-xl font-bold mb-2 text-center">Complete Your Purchase</h3>
                    <p className="text-sm text-gray-600 text-center mb-2">
                      ParrotKit Early Access — 3 Month Subscription
                    </p>
                    <p className="text-xs text-gray-500 text-center mb-6 italic">
                      Access will be granted after product launch
                    </p>

                    {/* Order Details */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-semibold">$99.00</span>
                      </div>
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Early Access Discount (90%)</span>
                        <span className="font-semibold">-$89.01</span>
                      </div>
                      <div className="border-t border-gray-200 pt-2 mt-2">
                        <div className="flex justify-between">
                          <span className="font-bold text-lg">Total</span>
                          <span className="font-bold text-2xl text-purple-600">$9.99</span>
                        </div>
                      </div>
                    </div>

                    {/* Email Input */}
                    <div className="mb-6">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={handleEmailChange}
                        placeholder="your@email.com"
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition ${
                          emailError 
                            ? 'border-red-400 focus:border-red-500 focus:ring-red-200' 
                            : isEmailValid
                            ? 'border-green-400 focus:border-green-500 focus:ring-green-200'
                            : 'border-gray-300 focus:border-purple-500 focus:ring-purple-200'
                        }`}
                      />
                      {emailError && (
                        <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          {emailError}
                        </p>
                      )}
                      {isEmailValid && (
                        <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          We'll send your access details to this email
                        </p>
                      )}
                    </div>

                    {/* PayPal Button */}
                    <div className="relative">
                      {/* Email Required Overlay */}
                      {!isEmailValid && (
                        <div className="absolute inset-0 z-10 bg-gray-100 border-2 border-gray-300 rounded-lg p-6 text-center text-gray-500 flex flex-col items-center justify-center">
                          <svg className="w-12 h-12 mb-2 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                          </svg>
                          <p className="text-sm font-medium">Enter your email to continue</p>
                        </div>
                      )}
                      
                      {/* Loading State */}
                      {isEmailValid && !isButtonRendered && !renderError && (
                        <div className="text-center text-gray-500 py-10">
                          <svg className="animate-spin h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Loading secure payment...
                        </div>
                      )}
                      
                      {/* Error State */}
                      {renderError && (
                        <div className="text-center text-red-600 py-6">
                          <p className="mb-4">Unable to load payment options.</p>
                          <button 
                            onClick={() => window.location.reload()}
                            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
                          >
                            Refresh Page
                          </button>
                        </div>
                      )}
                      
                      {/* PayPal Container - Always rendered */}
                      <div 
                        id="paypal-container-Q2CKSCLB479NS" 
                        className={`w-full min-h-[150px] ${!isEmailValid || !isButtonRendered ? 'opacity-0 pointer-events-none' : 'opacity-100'} transition-opacity duration-300`}
                      ></div>
                    </div>

                    {/* Payment Icons */}
                    <div className="flex items-center justify-center gap-3 mt-6 pt-6 border-t border-gray-200">
                      <svg className="h-6" viewBox="0 0 24 24"><path fill="#00457C" d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.77.77 0 0 1 .76-.653h8.023c2.692 0 4.54.585 5.494 1.741.948 1.148.946 2.901-.007 5.214-.014.034-.027.067-.04.1-.484 1.231-1.086 2.099-1.789 2.582-.704.484-1.58.726-2.604.726H11.73c-.398 0-.74.29-.803.686l-.855 5.423-.03.19a.382.382 0 0 1-.378.322zm.91-4.003l.855-5.423a.77.77 0 0 1 .76-.653h3.05c1.024 0 1.9-.242 2.604-.726.703-.483 1.305-1.351 1.789-2.582.013-.033.026-.066.04-.1.953-2.313.955-4.066.007-5.214C16.137 1.482 14.29.897 11.597.897H3.574a.77.77 0 0 0-.76.653L-.28 18.427a.641.641 0 0 0 .633.74h4.607c.398 0 .74-.29.803-.686z"/><path fill="#0079C1" d="M23.048 7.667c-.028.179-.06.362-.096.55-1.237 6.351-5.469 8.545-10.874 8.545H9.326c-.661 0-1.218.48-1.321 1.132L6.596 26.83l-.399 2.533a.55.55 0 0 0 .543.64h3.825c.578 0 1.069-.42 1.16-.99l.048-.248.919-5.832.059-.32c.09-.572.582-.992 1.16-.992h.73c4.729 0 8.431-1.92 9.513-7.476.452-2.321.218-4.259-.978-5.622a4.667 4.667 0 0 0-1.128-.906z"/><path fill="#00457C" d="M21.754 7.151a11.08 11.08 0 0 0-1.062-.303 13.054 13.054 0 0 0-2.037-.156h-6.163a1.237 1.237 0 0 0-1.22.99l-1.389 8.803-.04.256a1.315 1.315 0 0 1 1.321-1.132h2.752c5.405 0 9.637-2.194 10.874-8.545.037-.188.068-.371.096-.55a6.594 6.594 0 0 0-1.017-.411 9.045 9.045 0 0 0-2.115-.952z"/></svg>
                      <svg className="h-6" viewBox="0 0 48 32"><rect width="48" height="32" rx="4" fill="#1434CB"/><path d="M17.442 11.203h-3.632L11.13 23.52h2.393l.648-4.042h1.458c2.185 0 3.547-1.106 3.88-3.302.155-1.018-.005-1.816-.476-2.376-.516-.614-1.437-.918-2.59-.918z" fill="#fff"/></svg>
                      <svg className="h-6" viewBox="0 0 48 32"><rect width="48" height="32" rx="4" fill="#EB001B"/><circle cx="19" cy="16" r="11" fill="#F79E1B"/><circle cx="29" cy="16" r="11" fill="#FF5F00"/></svg>
                    </div>
                  </div>

                  {/* Support */}
                  <div className="text-center text-sm text-gray-600">
                    <p>Questions? Contact us at{' '}
                      <a href="mailto:contact@parrotkit.online" className="text-purple-600 hover:underline font-medium">
                        contact@parrotkit.online
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
