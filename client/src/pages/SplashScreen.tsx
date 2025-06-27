"use client"

import { useEffect, useState } from "react"

interface SplashScreenProps {
  onGetStarted: () => void;
}

export default function SplashScreen({ onGetStarted }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Auto-hide splash screen after 3 seconds
    const timer = setTimeout(() => {
      setIsVisible(false)
      onGetStarted()
    }, 3000)

    return () => clearTimeout(timer)
  }, [onGetStarted])

  if (!isVisible) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream to-soft-teal/30 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-coral to-mustard rounded-full flex items-center justify-center mx-auto mb-4 animate-wiggle">
          <div className="text-2xl">🧠</div>
        </div>
        <p className="font-nunito font-semibold text-navy">Loading Deite...</p>
      </div>
    </div>
  )
}