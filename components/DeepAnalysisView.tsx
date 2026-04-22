'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PolicyData } from '@/lib/types'
import CoverageGraph from './CoverageGraph'
import ExclusionsView from './ExclusionsView'
import HealthCheckView from './HealthCheckView'
import ScenarioSimulator from './ScenarioSimulator'
import TimelineView from './TimelineView'
import GlossaryView from './GlossaryView'
import UtilizationView from './UtilizationView'
import PremiumCalculator from './PremiumCalculator'

interface Props {
  policy: PolicyData
}

type DeepTab = 'coverage' | 'exclusions' | 'healthcheck' | 'askai' | 'timeline' | 'glossary' | 'utilization' | 'calculator'

const DEEP_TABS = [
  { id: 'coverage' as DeepTab, label: 'Coverage Map', emoji: '🗺️', color: 'blue' },
  { id: 'exclusions' as DeepTab, label: 'Not Covered', emoji: '🚫', color: 'red' },
  { id: 'utilization' as DeepTab, label: 'Benefits Guide', emoji: '💎', color: 'violet' },
  { id: 'calculator' as DeepTab, label: 'Premium Calculator', emoji: '🧮', color: 'pink' },
  { id: 'healthcheck' as DeepTab, label: 'Health Check', emoji: '🩺', color: 'cyan' },
  { id: 'askai' as DeepTab, label: 'Interact with AI', emoji: '🤖', color: 'emerald' },
  { id: 'timeline' as DeepTab, label: 'Coverage Timeline', emoji: '📅', color: 'orange' },
  { id: 'glossary' as DeepTab, label: 'Glossary', emoji: '📖', color: 'indigo' },
]

const COLOR_MAP: Record<string, { bg: string; text: string; border: string; light: string }> = {
  blue: { bg: 'bg-blue-500', text: 'text-blue-700', border: 'border-blue-300', light: 'bg-blue-50' },
  red: { bg: 'bg-red-500', text: 'text-red-700', border: 'border-red-300', light: 'bg-red-50' },
  violet: { bg: 'bg-violet-500', text: 'text-violet-700', border: 'border-violet-300', light: 'bg-violet-50' },
  pink: { bg: 'bg-pink-500', text: 'text-pink-700', border: 'border-pink-300', light: 'bg-pink-50' },
  cyan: { bg: 'bg-cyan-500', text: 'text-cyan-700', border: 'border-cyan-300', light: 'bg-cyan-50' },
  emerald: { bg: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-300', light: 'bg-emerald-50' },
  orange: { bg: 'bg-orange-500', text: 'text-orange-700', border: 'border-orange-300', light: 'bg-orange-50' },
  indigo: { bg: 'bg-indigo-500', text: 'text-indigo-700', border: 'border-indigo-300', light: 'bg-indigo-50' },
}

export default function DeepAnalysisView({ policy }: Props) {
  const [activeTab, setActiveTab] = useState<DeepTab>('coverage')

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-black text-slate-900 mb-1">🔍 Deep Analysis</h2>
        <p className="text-slate-600 text-xs">Explore detailed coverage, exclusions, and policy features</p>
      </div>

      {/* Sub-tabs */}
      <div className="overflow-x-auto -mx-4 px-4 no-scrollbar scrollbar-hide">
        <div className="flex gap-1.5 bg-white border border-slate-200 p-1.5 rounded-xl shadow-sm w-fit min-w-full sm:min-w-0 mx-auto">
          {DEEP_TABS.map(tab => {
            const colors = COLOR_MAP[tab.color]
            const isActive = activeTab === tab.id
            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex-shrink-0
                  ${isActive
                    ? `${colors.bg} text-white shadow-md`
                    : `text-slate-600 hover:${colors.light} hover:${colors.text}`
                  }`}
              >
                <span className="text-sm">{tab.emoji}</span>
                <span>{tab.label}</span>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'coverage' && <CoverageGraph policy={policy} />}
          {activeTab === 'exclusions' && <ExclusionsView policy={policy} />}
          {activeTab === 'utilization' && <UtilizationView policy={policy} />}
          {activeTab === 'calculator' && <PremiumCalculator policyType={policy.type} />}
          {activeTab === 'healthcheck' && <HealthCheckView policy={policy} />}
          {activeTab === 'askai' && <ScenarioSimulator policy={policy} />}
          {activeTab === 'timeline' && <TimelineView policy={policy} />}
          {activeTab === 'glossary' && <GlossaryView policy={policy} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
