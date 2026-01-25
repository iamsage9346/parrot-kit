'use client'

import { useState, useEffect } from 'react'
import { landingConfig } from '@/lib/landingConfig'

interface UnlockModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function UnlockModal({ isOpen, onClose }: UnlockModalProps) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [waitlistRank, setWaitlistRank] = useState<number | null>(null)

  useEffect(() => {
    if (isOpen) {
      // Check if user already has a rank
      const stored = localStorage.getItem('waitlist_rank')
      if (stored) {
        setWaitlistRank(parseInt(stored))
      }
    }
  }, [isOpen])

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) return

    // GA4 Event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'recipe_modal_submit', {
        event_category: 'recipe_conversion',
        event_label: 'Unlock Modal Recipe Request'
      })
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          name: '', 
          role: 'ASPIRING' 
        })
      })

      if (response.ok) {
        // Generate and store waitlist rank
        const rank = landingConfig.waitlistCount + Math.floor(Math.random() * 100)
        localStorage.setItem('waitlist_rank', rank.toString())
        setWaitlistRank(rank)
        setSubmitted(true)

        // GA4 Success Event
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'recipe_modal_success', {
            event_category: 'recipe_conversion',
            event_label: 'Recipe Email Sent'
          })
        }
      }
    } catch (error) {
      alert('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFoundingDropClick = () => {
    // GA4 Event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'founding_drop_click', {
        event_category: 'conversion',
        event_label: 'Founding Concierge Drop'
      })
    }

    const subject = encodeURIComponent(landingConfig.foundingDropContactSubject)
    const body = encodeURIComponent(`Hi, I'm interested in the Founding Concierge Drop (${landingConfig.foundingDropRecipeCount} recipes in ${landingConfig.foundingDropDeliveryHours}h for $${landingConfig.foundingDropOneTimePrice}).

Please let me know the next steps!`)
    
    window.location.href = `mailto:${landingConfig.supportEmail}?subject=${subject}&body=${body}`
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">Get Your Free Recipe 📧</h2>
              <p className="text-gray-600">Enter your email and we'll send you the full recipe instantly</p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition"
              aria-label="Close"
            >
              ×
            </button>
          </div>
          
          {submitted ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3">Check Your Email! ✅</h3>
              <p className="text-gray-600 mb-4 text-lg">
                We've sent the full recipe to your inbox.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Don't forget to check your spam folder if you don't see it!
              </p>
              <button
                onClick={onClose}
                className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold shadow-lg hover:shadow-xl transition"
              >
                Got it!
              </button>
            </div>
          ) : (
            <>
              {/* Email Form */}
              <div className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 rounded-2xl p-8 shadow-lg">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-2xl mb-3">Completely Free!</h3>
                  <p className="text-gray-700 text-sm">
                    Just enter your email and we'll send you the full recipe instantly
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span><strong>Full recipe</strong> with all details</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span><strong>Instant delivery</strong> (within 1 minute)</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span><strong>100% free</strong> - No payment required</span>
                  </div>
                </div>

                <form onSubmit={handleWaitlistSubmit} className="space-y-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    required
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition text-base"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl hover:from-purple-700 hover:to-pink-700 active:scale-98 transition font-bold text-lg disabled:opacity-50 shadow-xl hover:shadow-2xl"
                  >
                    {isSubmitting ? 'Sending...' : 'Get Free Recipe 📧'}
                  </button>
                </form>

                <p className="text-xs text-gray-600 mt-4 text-center">
                  💡 No spam • Unsubscribe anytime
                </p>
              </div>

              {/* Trust Badge */}
              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
                <p className="text-sm text-green-800 text-center font-medium">
                  ✨ Join <strong>10K+</strong> UGC Creators who already got their recipes!
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
