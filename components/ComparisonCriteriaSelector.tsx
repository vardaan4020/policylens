'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  DollarSign, Users, MapPin, Heart, Shield, Award, 
  TrendingUp, Star, CheckCircle, ChevronRight 
} from 'lucide-react'

export interface ComparisonCriteria {
  pricing: boolean
  ageFactors: boolean
  gender: boolean
  location: boolean
  familySize: boolean
  services: boolean
  addOns: boolean
  claims: boolean
  trustedBrands: boolean
  claimScore: boolean
  settlementScore: boolean
  settlementRatio: boolean
}

interface Props {
  onConfirm: (criteria: ComparisonCriteria) => void
  onSkip: () => void
}

const CRITERIA_OPTIONS = [
  { key: 'pricing' as keyof ComparisonCriteria, label: 'Pricing', icon: DollarSign, color: 'emerald', description: 'Compare premium costs and value' },
  { key: 'ageFactors' as keyof ComparisonCriteria, label: 'Age-based Pricing', icon: Users, color: 'blue', description: 'How age affects premiums' },
  { key: 'gender' as keyof ComparisonCriteria, label: 'Gender Factors', icon: Users, color: 'purple', description: 'Gender-specific considerations' },
  { key: 'location' as keyof ComparisonCriteria, label: 'Location', icon: MapPin, color: 'red', description: 'Regional availability & pricing' },
  { key: 'familySize' as keyof ComparisonCriteria, label: 'Family Size', icon: Heart, color: 'pink', description: 'Family coverage options' },
  { key: 'services' as keyof ComparisonCriteria, label: 'Services Covered', icon: Shield, color: 'indigo', description: 'Range of covered services' },
  { key: 'addOns' as keyof ComparisonCriteria, label: 'Add-ons', icon: Star, color: 'yellow', description: 'Optional coverage add-ons' },
  { key: 'claims' as keyof ComparisonCriteria, label: 'Claims Process', icon: TrendingUp, color: 'cyan', description: 'Ease of filing claims' },
  { key: 'trustedBrands' as keyof ComparisonCriteria, label: 'Trusted Brands', icon: Award, color: 'orange', description: 'Brand reputation (HDFC, etc.)' },
  { key: 'claimScore' as keyof ComparisonCriteria, label: 'Claim Score', icon: CheckCircle, color: 'teal', description: 'Historical claim approval rate' },
  { key: 'settlementScore' as keyof ComparisonCriteria, label: 'Settlement Score', icon: TrendingUp, color: 'violet', description: 'Settlement success rate' },
  { key: 'settlementRatio' as keyof ComparisonCriteria, label: 'Settlement Ratio', icon: Award, color: 'lime', description: 'Claim settlement ratio' },
]

const COLOR_MAP: Record<string, { bg: string; text: string; border: string; hover: string }> = {
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300', hover: 'hover:bg-emerald-100' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300', hover: 'hover:bg-blue-100' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-300', hover: 'hover:bg-purple-100' },
  red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-300', hover: 'hover:bg-red-100' },
  pink: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-300', hover: 'hover:bg-pink-100' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-300', hover: 'hover:bg-indigo-100' },
  yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-300', hover: 'hover:bg-yellow-100' },
  cyan: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-300', hover: 'hover:bg-cyan-100' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-300', hover: 'hover:bg-orange-100' },
  teal: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-300', hover: 'hover:bg-teal-100' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-300', hover: 'hover:bg-violet-100' },
  lime: { bg: 'bg-lime-50', text: 'text-lime-700', border: 'border-lime-300', hover: 'hover:bg-lime-100' },
}

export default function ComparisonCriteriaSelector({ onConfirm, onSkip }: Props) {
  const [criteria, setCriteria] = useState<ComparisonCriteria>({
    pricing: true,
    ageFactors: false,
    gender: false,
    location: false,
    familySize: false,
    services: true,
    addOns: false,
    claims: false,
    trustedBrands: false,
    claimScore: false,
    settlementScore: false,
    settlementRatio: false,
  })

  const toggleCriteria = (key: keyof ComparisonCriteria) => {
    setCriteria(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const selectedCount = Object.values(criteria).filter(Boolean).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6 py-6"
    >
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="text-4xl">🎯</div>
        <h2 className="text-2xl font-black text-slate-900">
          What matters most to you?
        </h2>
        <p className="text-slate-600">
          Select the factors you want to compare. We'll focus our analysis on what you care about.
        </p>
      </div>

      {/* Criteria grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {CRITERIA_OPTIONS.map((option) => {
          const isSelected = criteria[option.key]
          const colors = COLOR_MAP[option.color]
          const Icon = option.icon

          return (
            <motion.button
              key={option.key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleCriteria(option.key)}
              className={`relative flex items-start gap-3 p-4 rounded-2xl border-2 transition-all text-left
                ${isSelected 
                  ? `${colors.bg} ${colors.border} shadow-md` 
                  : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
            >
              {/* Icon */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors
                ${isSelected ? `bg-white ${colors.text}` : 'bg-slate-100 text-slate-400'}`}>
                <Icon className="w-5 h-5" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`font-bold text-sm ${isSelected ? colors.text : 'text-slate-700'}`}>
                    {option.label}
                  </span>
                  {isSelected && (
                    <CheckCircle className={`w-4 h-4 ${colors.text} flex-shrink-0`} />
                  )}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {option.description}
                </p>
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Selection summary */}
      <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
        <span className="font-semibold">{selectedCount}</span>
        <span>criteria selected</span>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSkip}
          className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
        >
          Skip & Compare All
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onConfirm(criteria)}
          disabled={selectedCount === 0}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all
            ${selectedCount > 0
              ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg hover:shadow-xl'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
        >
          Compare with {selectedCount} Criteria
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  )
}
