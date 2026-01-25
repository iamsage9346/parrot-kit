'use client'

import { useState, useEffect } from 'react'
import { landingConfig } from '@/lib/landingConfig'
import type { TeaserData } from '@/lib/types'
import UnlockModal from './UnlockModal'
import FOMOWidget from './FOMOWidget'
import { analytics } from '@/lib/analytics'

const exampleShorts = [
  'tT1JRa28iL0',
  'QagIcROVwxM',
  'EeWvoKgSkmc',
  'SNNbkRkmxM8',
  'E7qWFWQh_sk',
  'Gx5onoICJ9s',
  '5BgJ5FPyyZY',
  'SNNbkRkmxM8'
]

export default function Hero() {
  const [link, setLink] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [teaser, setTeaser] = useState<TeaserData | null>(null)
  const [error, setError] = useState('')
  const [showUnlockModal, setShowUnlockModal] = useState(false)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVideoIndex((prev) => (prev + 1) % exampleShorts.length)
    }, 8000) // 8초마다 영상 전환
    return () => clearInterval(interval)
  }, [])

  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleAnalyze = async () => {
    if (!link.trim()) {
      setError('Please paste a link')
      return
    }

    // Track CTA click
    analytics.trackCTAClick('Hero', 'Analyze Video')

    if (!isValidUrl(link)) {
      setError('Please enter a valid URL')
      return
    }

    // GA4 Event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'link_paste_submit', {
        event_category: 'engagement',
        event_label: 'Hero Analyze Button',
        link_url: link
      })
    }

    setError('')
    setIsAnalyzing(true)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: link })
      })

      if (!response.ok) throw new Error('Analysis failed')

      const data = await response.json()
      setTeaser(data.teaser)

      // GA4 Event
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'teaser_view', {
          event_category: 'engagement',
          event_label: 'Teaser Displayed'
        })
      }
    } catch (err) {
      setError('Failed to analyze. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleUnlockClick = () => {
    // GA4 Event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'unlock_full_click', {
        event_category: 'conversion',
        event_label: 'Unlock Full Recipe'
      })
    }
    setShowUnlockModal(true)
  }

  return (
    <>
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* FOMO Widget */}
          <FOMOWidget />
          
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left: Text Content */}
            <div className="space-y-8">
              <div className="inline-block">
                <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium">
                  Join {landingConfig.creatorsJoined} UGC Creators
                </span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                Paste a link.{' '}
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Grab the viral-blueprint.
                </span>{' '}
                Ship your version fast.
              </h1>
              
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                Drop a TikTok / Reels / Shorts link. Get a{' '}
                <strong className="text-gray-900">viral recipe</strong>
                {' '}with hooks, a script, shots, captions, and CTA.
              </p>

              {/* Input Box */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={link}
                    onChange={(e) => {
                      setLink(e.target.value)
                      setError('')
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                    placeholder="Paste your video link here..."
                    className={`flex-1 px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 transition ${
                      error 
                        ? 'border-red-400 focus:border-red-500' 
                        : 'border-gray-300 focus:border-purple-500'
                    }`}
                    disabled={isAnalyzing}
                  />
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !link.trim()}
                    className="bg-white text-purple-600 border-2 border-purple-600 px-6 sm:px-8 py-3 rounded-lg hover:bg-purple-50 active:scale-95 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {isAnalyzing ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analyzing...
                      </span>
                    ) : 'Analyze (Free)'}
                  </button>
                </div>
                
                {/* Primary CTA - Get Early Access */}
                <a
                  href="/preorder"
                  className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-lg hover:from-purple-700 hover:to-pink-700 active:scale-95 transition font-bold text-center shadow-lg shadow-purple-500/30"
                  onClick={() => {
                    if (typeof window !== 'undefined' && (window as any).gtag) {
                      (window as any).gtag('event', 'payment_cta_click', {
                        event_category: 'payment_conversion',
                        event_label: 'Hero Get Early Access'
                      })
                    }
                  }}
                >
                  🔥 90% SALE 🔥 Get Early Access ($9.99)
                </a>
                
                {error && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </div>
                )}
                <p className="text-sm text-gray-500">
                  ✨ Free instant analysis • No signup required
                </p>
              </div>

              {/* Teaser Card */}
              {teaser && (
                <div className="relative bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 rounded-2xl p-6 space-y-4 border-2 border-purple-200 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* Blurred Content */}
                  <div className="blur-md select-none pointer-events-none">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <h3 className="font-bold text-lg">Your Recipe Preview</h3>
                      </div>
                      <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
                        FREE
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="text-xs text-purple-600 font-bold mb-1 uppercase tracking-wide">🎯 Hook</div>
                        <div className="text-sm font-medium text-gray-800">{teaser.hookType}</div>
                      </div>
                      
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="text-xs text-purple-600 font-bold mb-1 uppercase tracking-wide">⚡ Pacing</div>
                        <div className="text-sm font-medium text-gray-800">{teaser.pacing}</div>
                      </div>
                      
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="text-xs text-purple-600 font-bold mb-1 uppercase tracking-wide">✂️ Cuts</div>
                        <div className="text-sm font-medium text-gray-800">{teaser.cutCount} shots</div>
                      </div>
                      
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="text-xs text-purple-600 font-bold mb-1 uppercase tracking-wide">⏱️ Duration</div>
                        <div className="text-sm font-medium text-gray-800">{teaser.duration}</div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="text-xs text-purple-600 font-bold mb-1 uppercase tracking-wide">💬 Subtitles</div>
                      <div className="text-sm font-medium text-gray-800">{teaser.subtitleStyle}</div>
                    </div>

                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="text-xs text-purple-600 font-bold mb-1 uppercase tracking-wide">📢 CTA</div>
                      <div className="text-sm font-medium text-gray-800">{teaser.ctaBeat}</div>
                    </div>
                  </div>

                  {/* Unlock Overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-transparent via-white/80 to-white/95 backdrop-blur-sm rounded-2xl p-6">
                    <div className="text-center space-y-4 max-w-sm">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          Analysis Complete! 🎉
                        </h3>
                        <p className="text-gray-600">
                          Your detailed recipe is ready.<br />
                          Get your Recipe right now!
                        </p>
                      </div>

                      <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                        <p className="text-sm font-semibold text-purple-900 mb-2">
                          Full recipe includes:
                        </p>
                        <ul className="text-xs text-purple-800 space-y-1 text-left">
                          <li className="flex items-center gap-2">
                            <span className="text-purple-600">✓</span> Shot-by-shot breakdown
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-purple-600">✓</span> Exact timing & pacing
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-purple-600">✓</span> B-roll suggestions
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-purple-600">✓</span> Editing timeline
                          </li>
                        </ul>
                      </div>

                      <button
                        onClick={handleUnlockClick}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl hover:from-purple-700 hover:to-pink-700 active:scale-98 transition font-bold text-lg shadow-xl hover:shadow-2xl flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                        Unlock Full Recipe Now
                      </button>

                      <p className="text-xs text-gray-500">
                        ✨ Join {landingConfig.creatorsJoined} UGC Creators • No payment required
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Video Carousel */}
            <div className="relative">
              <div className="relative w-full aspect-[9/16] max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-800 bg-black">
                {/* Video Embed */}
                <iframe
                  key={currentVideoIndex}
                  src={`https://www.youtube.com/embed/${exampleShorts[currentVideoIndex]}?autoplay=1&mute=1&loop=1&playlist=${exampleShorts[currentVideoIndex]}&controls=0&modestbranding=1&rel=0`}
                  className="absolute inset-0 w-full h-full"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  style={{ border: 'none' }}
                />
                
                {/* Overlay Badge */}
                <div className="absolute top-4 left-4 right-4 z-10">
                  <div className="bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 inline-flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    <span className="text-white text-sm font-medium">Make with Parrot Kit</span>
                  </div>
                </div>

                {/* Navigation Dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {exampleShorts.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentVideoIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentVideoIndex 
                          ? 'bg-white w-6' 
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                      aria-label={`View video ${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Info Text */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Real results</span> from UGC Creators using our recipes
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Unlock Modal */}
      <UnlockModal 
        isOpen={showUnlockModal} 
        onClose={() => setShowUnlockModal(false)} 
      />
    </>
  )
}
