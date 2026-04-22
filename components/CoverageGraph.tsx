'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, X } from 'lucide-react'
import { PolicyData, CoverageItem, ExclusionItem } from '@/lib/types'

interface Props { policy: PolicyData }

const severityStyle = {
  high:   { badge: 'bg-red-100 text-red-700 border border-red-200',    dot: 'bg-red-500',    glow: 'shadow-red-100' },
  medium: { badge: 'bg-amber-100 text-amber-700 border border-amber-200', dot: 'bg-amber-400', glow: 'shadow-amber-100' },
  low:    { badge: 'bg-slate-100 text-slate-600 border border-slate-200', dot: 'bg-slate-400', glow: 'shadow-slate-100' },
}

export default function CoverageGraph({ policy }: Props) {
  const [selected, setSelected] = useState<(CoverageItem | ExclusionItem) | null>(null)
  const [mode, setMode] = useState<'covered' | 'excluded'>('covered')

  const items = mode === 'covered' ? policy.covered : policy.notCovered
  const isExc = (item: any): item is ExclusionItem => 'severity' in item

  return (
    <div className="space-y-4">
      <div>
        <span className="section-label">Coverage Analysis</span>
        <h2 className="text-xl font-black text-slate-900 mt-1">🗺️ Coverage Map</h2>
        <p className="text-slate-500 mt-0.5 text-xs">Tap any card to see full details and limits</p>
      </div>

      {/* Toggle */}
      <div className="flex bg-white border border-slate-200 p-1 rounded-xl w-fit gap-1 shadow-sm">
        <button
          onClick={() => { setMode('covered'); setSelected(null) }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all
            ${mode === 'covered'
              ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-md'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
        >
          <CheckCircle className="w-3.5 h-3.5" />
          ✅ Covered ({policy.covered.length})
        </button>
        <button
          onClick={() => { setMode('excluded'); setSelected(null) }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all
            ${mode === 'excluded'
              ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-md'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
        >
          <XCircle className="w-3.5 h-3.5" />
          🚫 Not Covered ({policy.notCovered.length})
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <AnimatePresence mode="popLayout">
          {items.map((item, i) => {
            const excluded = isExc(item)
            const active = selected?.id === item.id
            const sev = excluded ? severityStyle[(item as ExclusionItem).severity] : null
            return (
              <motion.button
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ delay: i * 0.04, type: 'spring', stiffness: 300, damping: 25 }}
                whileHover={{ y: -4, scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setSelected(active ? null : item)}
                className={`p-4 rounded-xl border-2 text-left transition-all shadow-sm hover:shadow-lg card-hover
                  ${active
                    ? excluded
                      ? 'border-red-400 bg-gradient-to-br from-red-50 to-rose-50 shadow-red-100'
                      : 'border-emerald-400 bg-gradient-to-br from-emerald-50 to-green-50 shadow-emerald-100'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
              >
                <div className="text-2xl mb-2">{item.emoji}</div>
                <p className="font-bold text-slate-800 text-xs leading-tight">{item.title}</p>
                {excluded && sev && (
                  <span className={`mt-1.5 inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full font-semibold ${sev.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sev.dot}`} />
                    {(item as ExclusionItem).severity} risk
                  </span>
                )}
                {!excluded && (item as CoverageItem).limit && (
                  <p className="text-xs text-emerald-600 font-semibold mt-1">{(item as CoverageItem).limit}</p>
                )}
              </motion.button>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            className={`rounded-2xl p-4 border-2 relative ${
              isExc(selected)
                ? 'bg-gradient-to-br from-red-50 to-rose-50 border-red-300'
                : 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-300'
            }`}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-3 right-3 p-1 rounded-lg hover:bg-black/10 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-slate-500" />
            </button>
            <div className="flex items-start gap-3">
              <span className="text-3xl">{selected.emoji}</span>
              <div className="flex-1 pr-6">
                <div className="flex items-center gap-2 mb-1.5">
                  {isExc(selected)
                    ? <XCircle className="w-4 h-4 text-red-500" />
                    : <CheckCircle className="w-4 h-4 text-emerald-500" />
                  }
                  <h3 className="font-black text-slate-900 text-base">{selected.title}</h3>
                </div>
                <p className="text-slate-700 text-sm">{selected.description}</p>
                {!isExc(selected) && (selected as CoverageItem).limit && (
                  <div className="mt-2 inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-lg">
                    💰 Limit: {(selected as CoverageItem).limit}
                  </div>
                )}
                {isExc(selected) && (
                  <div className={`mt-2 inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg ${severityStyle[(selected as ExclusionItem).severity].badge}`}>
                    ⚠️ {(selected as ExclusionItem).severity.charAt(0).toUpperCase() + (selected as ExclusionItem).severity.slice(1)} Risk Exclusion
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
