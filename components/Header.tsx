'use client'

export default function Header() {
  const scrollToSection = (id: string) => {
    // GA4 Event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      ;(window as any).gtag('event', 'navigation_click', {
        event_category: 'engagement',
        event_label: `Nav: ${id}`,
        navigation_target: id
      })
    }
    
    const element = document.getElementById(id)
    element?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              ParrotKit
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => scrollToSection('how-it-works')} className="text-gray-600 hover:text-gray-900 transition">
              How it works
            </button>
            <button onClick={() => scrollToSection('use-cases')} className="text-gray-600 hover:text-gray-900 transition">
              Use cases
            </button>
            <button onClick={() => scrollToSection('pricing')} className="text-gray-600 hover:text-gray-900 transition">
              Pricing
            </button>
            <button onClick={() => scrollToSection('faq')} className="text-gray-600 hover:text-gray-900 transition">
              FAQ
            </button>
          </div>

          <button 
            onClick={() => {
              if (typeof window !== 'undefined' && (window as any).gtag) {
                ;(window as any).gtag('event', 'payment_cta_click', {
                  event_category: 'payment_conversion',
                  event_label: 'Header Get Early Access'
                })
              }
              window.location.href = '/preorder'
            }}
            className="bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700 transition font-medium"
          >
            🔥 90% SALE → $9.99
          </button>
        </div>
      </nav>
    </header>
  )
}
