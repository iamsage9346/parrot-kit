'use client'

import { landingConfig } from '@/lib/landingConfig'
import { analytics } from '@/lib/analytics'

export default function Pricing() {
  const plans = [
    {
      name: 'Early Access',
      price: '$9.99',
      period: ' (3 months)',
      description: 'Get started with ParrotKit at a special early access price.',
      features: [
        'Unlimited recipe breakdowns',
        'Save & reuse templates',
        'Export shot list + caption flow + edit cues',
        'Priority in invite batches'
      ],
      highlighted: true,
      ctaText: '🔥 90% SALE 🔥 Get Early Access ($9.99)',
      ctaLink: '/preorder' as string | undefined
    },
    {
      name: 'Pro',
      price: `$${landingConfig.proMonthlyPrice}`,
      period: '/month',
      description: 'For solo UGC creators who want to ship consistently.',
      features: [
        'Unlimited recipe breakdowns',
        'Save & reuse templates',
        'Export shot list + caption flow + edit cues',
        'Priority in invite batches'
      ],
      highlighted: false,
      earlyBirdNote: `Lock in $${landingConfig.earlyBirdProPrice}/mo if you join by ${landingConfig.earlyBirdDeadline} (later $${landingConfig.laterProPrice}/mo)`
    },
    {
      name: 'Team',
      price: `$${landingConfig.teamMonthlyPrice}`,
      period: '/month',
      description: 'For small teams and agencies running repeatable production.',
      features: [
        'Everything in Pro',
        'Shared workspace & templates',
        'Team library (best-performing formats)',
        'Collaboration (notes + version history)',
        'Team priority support'
      ],
      highlighted: false,
      earlyBirdNote: `Lock in $${landingConfig.earlyBirdTeamPrice}/mo if you join by ${landingConfig.earlyBirdDeadline} (later $${landingConfig.laterTeamPrice}/mo)`
    },
    {
      name: 'Special offer',
      price: `$${landingConfig.foundingDropOneTimePrice}`,
      period: ' one-time',
      description: `Custom recipe in ${landingConfig.foundingDropDeliveryHours}h. Skip the wait.`,
      features: [
        `Custom recipe for your niche`,
        `${landingConfig.foundingDropDeliveryHours}h delivery guarantee`,
        'Shot-by-shot breakdown + b-roll notes',
        'Editing timeline suggestions',
        `Only ${landingConfig.foundingDropSpotsLeft}/${landingConfig.foundingDropTotalSpots} spots left`
      ],
      highlighted: false,
      isLimited: true,
      ctaText: 'Get Founding Drop'
    }
  ]

  const handlePlanClick = (plan: typeof plans[0]) => {
    // Track pricing click with our analytics
    const price = parseFloat(plan.price.replace(/\$/g, ''))
    analytics.trackPricingClick(plan.name, price)
    
    // Also track with GA4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      ;(window as any).gtag('event', 'payment_pricing_click', {
        event_category: 'payment_conversion',
        event_label: `Pricing: ${plan.name}`,
        plan_name: plan.name,
        plan_price: plan.price
      })
    }

    // Handle Early Access plan
    if (plan.ctaLink) {
      window.location.href = plan.ctaLink
      return
    }

    if (plan.isLimited) {
      // Founding Drop - open email
      const subject = encodeURIComponent(landingConfig.foundingDropContactSubject)
      const body = encodeURIComponent(`Hi, I'm interested in the Founding Concierge Drop.

Please let me know the next steps!`)
      window.location.href = `mailto:${landingConfig.supportEmail}?subject=${subject}&body=${body}`
    } else {
      // Regular plans - scroll to CTA
      document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold">Simple pricing, powerful results</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join early to lock in special pricing. Limited spots available.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`rounded-3xl p-8 relative transition-all duration-300 ${
                plan.highlighted 
                  ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-2xl scale-105 hover:scale-110' 
                  : 'bg-white border-2 border-gray-200 shadow-lg hover:shadow-2xl hover:border-purple-300'
              }`}
            >
              {plan.isLimited && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg">
                    🔥 LIMITED
                  </span>
                </div>
              )}

              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className={`text-sm ${plan.highlighted ? 'text-white/80' : 'text-gray-500'}`}>
                  {plan.period}
                </span>
              </div>
              <p className={`mb-6 ${plan.highlighted ? 'text-white/90' : 'text-gray-600'}`}>
                {plan.description}
              </p>

              {plan.earlyBirdNote && (
                <div className={`mb-6 p-3 rounded-lg text-sm ${
                  plan.highlighted 
                    ? 'bg-white/20 text-white' 
                    : 'bg-purple-50 text-purple-700'
                }`}>
                  🎯 <strong>Early-bird:</strong> {plan.earlyBirdNote}
                </div>
              )}

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <svg 
                      className={`w-5 h-5 flex-shrink-0 ${plan.highlighted ? 'text-white' : 'text-purple-600'}`} 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => handlePlanClick(plan)}
                className={`w-full py-4 rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 ${
                  plan.highlighted
                    ? 'bg-white text-purple-600 hover:bg-gray-50'
                    : plan.isLimited
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {plan.ctaText || 'Get started'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
