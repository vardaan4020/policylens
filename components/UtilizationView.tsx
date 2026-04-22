'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gift, TrendingUp, Stethoscope, Smartphone, Calendar, CheckCircle, ExternalLink, Bell, Star } from 'lucide-react'
import { PolicyData } from '@/lib/types'

interface Props { policy: PolicyData }

interface UtilizationItem {
  id: string
  category: 'complimentary' | 'ncb' | 'checkup' | 'app' | 'wellness' | 'discount'
  title: string
  description: string
  value?: string
  howToUse: string
  frequency?: string
  emoji: string
  priority: 'high' | 'medium' | 'low'
}

const CATEGORY_CONFIG = {
  complimentary: {
    label: 'Complimentary Benefits',
    emoji: '🎁',
    icon: Gift,
    color: 'violet',
    bg: 'from-violet-50 to-purple-50',
    border: 'border-violet-200',
    text: 'text-violet-700',
    badge: 'bg-violet-100 text-violet-700',
  },
  ncb: {
    label: 'No Claim Bonus',
    emoji: '📈',
    icon: TrendingUp,
    color: 'emerald',
    bg: 'from-emerald-50 to-green-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-700',
  },
  checkup: {
    label: 'Free Health Checkups',
    emoji: '🩺',
    icon: Stethoscope,
    color: 'cyan',
    bg: 'from-cyan-50 to-blue-50',
    border: 'border-cyan-200',
    text: 'text-cyan-700',
    badge: 'bg-cyan-100 text-cyan-700',
  },
  app: {
    label: 'App & Digital Benefits',
    emoji: '📱',
    icon: Smartphone,
    color: 'blue',
    bg: 'from-blue-50 to-indigo-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-700',
  },
  wellness: {
    label: 'Wellness Programs',
    emoji: '💪',
    icon: Calendar,
    color: 'orange',
    bg: 'from-orange-50 to-amber-50',
    border: 'border-orange-200',
    text: 'text-orange-700',
    badge: 'bg-orange-100 text-orange-700',
  },
  discount: {
    label: 'Discounts & Rewards',
    emoji: '💰',
    icon: Star,
    color: 'pink',
    bg: 'from-pink-50 to-rose-50',
    border: 'border-pink-200',
    text: 'text-pink-700',
    badge: 'bg-pink-100 text-pink-700',
  },
}

export default function UtilizationView({ policy }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [expandedItem, setExpandedItem] = useState<string | null>(null)

  // Extract utilization items from policy data
  const utilizationItems: UtilizationItem[] = policy.utilization || []

  // Group by category
  const itemsByCategory = utilizationItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, UtilizationItem[]>)

  // Calculate total value
  const totalItems = utilizationItems.length
  const highPriorityCount = utilizationItems.filter(i => i.priority === 'high').length

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <span className="section-label">Maximize Your Benefits</span>
        <h2 className="text-xl font-black text-slate-900 mt-1">💎 Policy Utilization Guide</h2>
        <p className="text-slate-500 mt-0.5 text-xs">
          Don't leave money on the table — here's everything you're entitled to use
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-2">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-violet-50 to-purple-50 border-2 border-violet-200 rounded-xl p-3 text-center"
        >
          <div className="text-2xl font-black text-violet-700 stat-number">{totalItems}</div>
          <div className="text-xs text-violet-600 font-medium mt-0.5">Total Benefits</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl p-3 text-center"
        >
          <div className="text-2xl font-black text-emerald-700 stat-number">{highPriorityCount}</div>
          <div className="text-xs text-emerald-600 font-medium mt-0.5">High Priority</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-3 text-center"
        >
          <div className="text-2xl font-black text-blue-700 stat-number">{Object.keys(itemsByCategory).length}</div>
          <div className="text-xs text-blue-600 font-medium mt-0.5">Categories</div>
        </motion.div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
            selectedCategory === null
              ? 'bg-slate-800 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All ({totalItems})
        </button>
        {Object.entries(itemsByCategory).map(([cat, items]) => {
          const cfg = CATEGORY_CONFIG[cat as keyof typeof CATEGORY_CONFIG]
          if (!cfg) return null
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                selectedCategory === cat
                  ? `bg-gradient-to-r ${cfg.bg} ${cfg.border} border-2 ${cfg.text} shadow-md`
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{cfg.emoji}</span>
              {cfg.label} ({items.length})
            </button>
          )
        })}
      </div>

      {/* Items Grid */}
      <div className="space-y-4">
        {Object.entries(itemsByCategory)
          .filter(([cat]) => !selectedCategory || cat === selectedCategory)
          .map(([category, items]) => {
            const cfg = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG]
            if (!cfg) return null

            return (
              <div key={category}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`flex items-center gap-1.5 ${cfg.text} text-sm font-bold`}>
                    <cfg.icon className="w-4 h-4" />
                    {cfg.label}
                  </div>
                  <span className="text-xs text-slate-400">{items.length} benefit{items.length !== 1 ? 's' : ''}</span>
                </div>

                <div className="grid sm:grid-cols-2 gap-2">
                  {items.map((item, i) => {
                    const isExpanded = expandedItem === item.id
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`bg-gradient-to-br ${cfg.bg} border-2 ${cfg.border} rounded-xl p-3 transition-all hover:shadow-md cursor-pointer`}
                        onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-2xl flex-shrink-0">{item.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-bold text-slate-800 text-sm leading-tight">{item.title}</h3>
                              {item.priority === 'high' && (
                                <span className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                              )}
                            </div>
                            {item.value && (
                              <p className={`text-xs font-bold ${cfg.text} mt-1`}>{item.value}</p>
                            )}
                            {item.frequency && (
                              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {item.frequency}
                              </p>
                            )}
                            <p className="text-xs text-slate-600 mt-1 line-clamp-2">{item.description}</p>

                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-2 pt-2 border-t border-slate-200"
                                >
                                  <div className="flex items-start gap-1.5 bg-white/60 rounded-lg p-2">
                                    <Bell className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                      <p className="text-xs font-bold text-slate-700 mb-0.5">How to Use:</p>
                                      <p className="text-xs text-slate-600">{item.howToUse}</p>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            <button
                              className="mt-2 text-xs font-bold text-slate-500 hover:text-slate-700 flex items-center gap-1"
                              onClick={(e) => {
                                e.stopPropagation()
                                setExpandedItem(isExpanded ? null : item.id)
                              }}
                            >
                              {isExpanded ? 'Show less' : 'How to use'}
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            )
          })}
      </div>

      {/* Empty State */}
      {totalItems === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200"
        >
          <div className="text-4xl mb-3">💎</div>
          <p className="font-bold text-slate-700">No utilization data available</p>
          <p className="text-slate-500 text-xs mt-1">
            We couldn't extract benefit information from this policy
          </p>
        </motion.div>
      )}

      {/* Action Tips */}
      {totalItems > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-4"
        >
          <div className="flex items-start gap-2">
            <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-amber-800 text-sm mb-1">💡 Pro Tips</h3>
              <ul className="space-y-1 text-xs text-amber-900">
                <li>• Set calendar reminders for annual checkups and wellness programs</li>
                <li>• Download the insurer's app to track your benefits usage</li>
                <li>• Keep claim-free to maximize your No Claim Bonus</li>
                <li>• Use complimentary services before they expire each year</li>
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
