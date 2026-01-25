'use client'

import { useState } from 'react'
import { UserRole } from '@/lib/role'
import { analytics, trackFunnelStep } from '@/lib/analytics'

export default function FinalCTA() {

  type WaitlistForm = {
    name: string
    email: string
    role: UserRole | ''
  }

  const [formData, setFormData] = useState<WaitlistForm>({
    name: '',
    email: '',
    role: ''
  })

  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<{name?: string, email?: string, role?: string}>({})


  const roleOptions = [
    { label: 'Aspiring UGC Creator', value: UserRole.ASPIRING },
    { label: 'Prospective UGC Creator', value: UserRole.PROSPECTIVE },
    { label: 'Brand', value: UserRole.BRAND },
    { label: 'Marketer', value: UserRole.MARKETER },
    { label: 'Agency', value: UserRole.AGENCY }
  ]

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    const newErrors: {name?: string, email?: string, role?: string} = {}
    if (!formData.name.trim()) {
      newErrors.name = "Name is required."
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      newErrors.email = "Email is required."
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address."
    }
    if (!formData.role) {
      newErrors.role = "Please select your role."
    }

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) {
      return
    }

    // Track form submission with our analytics
    analytics.trackFormSubmit('Waitlist', true)
    trackFunnelStep('waitlist_signup', 3, true)
    
    // Also track with GA4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'recipe_lead', {
        event_category: 'recipe_conversion',
        event_label: 'Waitlist Form Submit',
        user_role: formData.role
      })
    }

    const res = await fetch('/api/waitlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })

    if (res.ok) {
      // GA4 Success Event
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'recipe_signup_success', {
          event_category: 'recipe_conversion',
          event_label: 'Waitlist Signup Success'
        })
      }
      
      setSubmitted(true)
      setErrors({})
      setTimeout(() => {
        setSubmitted(false)
        setFormData({ name: '', email: '', role: '' })
      }, 3000)
    } else {
      alert('Something went wrong. Please try again.')
    }
  }


  return (
    <section id="cta" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-600 to-pink-600">
      <div className="max-w-4xl mx-auto text-center text-white">
        <div className="space-y-6 mb-12">
          <h2 className="text-4xl md:text-5xl font-bold">
            Your next Short starts with one link.
          </h2>
          <p className="text-xl text-white/90">
            Join the waitlist to get your free recipe instantly. We&apos;re onboarding in batches, secure your spot now.
          </p>
        </div>

        {submitted ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 border-2 border-white/20 shadow-2xl">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold mb-3">You&apos;re on the list!</h3>
            <p className="text-xl text-white/90">Check your email for next steps.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 sm:p-10 space-y-5 border-2 border-white/20 shadow-2xl">
            <input
              type="text"
              placeholder="Your name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
              className="w-full px-5 py-4 rounded-xl bg-white/20 border-2 border-white/30 text-white placeholder-white/60 focus:outline-none focus:border-white focus:bg-white/30 transition text-lg"
            />
            {errors.name && <p className="text-red-300 text-sm mt-1">{errors.name}</p>}
            
            <input
              type="email"
              placeholder="you@domain.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
              className="w-full px-5 py-4 rounded-xl bg-white/20 border-2 border-white/30 text-white placeholder-white/60 focus:outline-none focus:border-white focus:bg-white/30 transition text-lg"
            />
            {errors.email && <p className="text-red-300 text-sm mt-1">{errors.email}</p>}
            
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}
              required
              className="w-full px-5 py-4 rounded-xl bg-white/20 border-2 border-white/30 text-white focus:outline-none focus:border-white focus:bg-white/30 transition text-lg"
            >
              <option value="" disabled>I&apos;m a...</option>
              {roleOptions.map(r => (
                <option key={r.value} value={r.value} className="bg-purple-600 text-white">
                  {r.label}
                </option>
              ))}
            </select>
            {errors.role && <p className="text-red-300 text-sm mt-1">{errors.role}</p>}

            <button 
              type="submit"
              className="w-full bg-white text-purple-600 px-8 py-5 rounded-xl hover:bg-gray-50 active:scale-98 transition-all font-bold text-lg shadow-xl hover:shadow-2xl"
            >
              Get your Recipe
            </button>

            <p className="text-sm text-white/70 pt-2">
              🔒 No spam. Unsubscribe anytime.
            </p>
          </form>
        )}
      </div>
    </section>
  )
}
