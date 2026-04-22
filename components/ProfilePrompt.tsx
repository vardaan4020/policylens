'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, X, ArrowRight, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props {
  onDismiss?: () => void
}

export default function ProfilePrompt({ onDismiss }: Props) {
  const router = useRouter()
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    checkProfile()
  }, [])

  const checkProfile = async () => {
    // Check if user has dismissed this session
    const sessionDismissed = sessionStorage.getItem('profilePromptDismissed')
    if (sessionDismissed) {
      setDismissed(true)
      return
    }

    try {
      const res = await fetch('/api/profile')
      if (res.ok) {
        const data = await res.json()
        const profile = data.profile
        
        // Check if profile is incomplete or empty
        const isIncomplete = !profile || 
          !profile.age || 
          !profile.gender || 
          !profile.location ||
          profile.familySize <= 0

        setShow(isIncomplete)
      }
    } catch (err) {
      console.error('Failed to check profile:', err)
    }
  }

  const handleDismiss = () => {
    setShow(false)
    setDismissed(true)
    sessionStorage.setItem('profilePromptDismissed', 'true')
    onDismiss?.()
  }

  const handleGoToProfile = () => {
    router.push('/profile')
  }

  if (!show || dismissed) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="relative bg-gradient-to-r from-violet-500 to-blue-500 rounded-2xl p-6 text-white shadow-xl border-2 border-white/20 overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12" />
        </div>

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/20 transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="relative z-10 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-xl font-black mb-2">
              Get Personalized Recommendations! ✨
            </h3>
            <p className="text-white/90 text-sm leading-relaxed mb-4">
              Complete your profile to get AI-powered policy recommendations tailored to your age, location, family size, and health needs. It takes just 2 minutes!
            </p>
            
            <div className="flex flex-wrap gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGoToProfile}
                className="flex items-center gap-2 px-4 py-2.5 bg-white text-violet-600 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all text-sm"
              >
                <User className="w-4 h-4" />
                Complete Profile
                <ArrowRight className="w-4 h-4" />
              </motion.button>
              
              <button
                onClick={handleDismiss}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl transition-all text-sm"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
