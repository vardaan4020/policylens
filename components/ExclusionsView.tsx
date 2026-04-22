'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, XCircle } from 'lucide-react'
import { PolicyData } from '@/lib/types'

interface Props { policy: PolicyData }

const severityConfig = {
  high: {
    label: 'High Risk', emoji: '🔴',
    bg: 'from-red-50 to-rose-50', border: 'border-red-200',
    badge: 'bg-red-100 text-red-700 border border-red-200',
    header: 'bg-gradient-to-r from-red-500 to-rose-500',
    icon: 'text-red-500', count_bg: 'bg-red-500',
  },
  medium: {
    label: 'Medium Risk', emoji: '🟡',
    bg: 'from-amber-50 to-orange-50', border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-700 border border-amber-200',
    header: 'bg-gradient-to-r from-amber-500 to-orange-500',
    icon: 'text-amber-500', count_bg: 'bg-amber-500',
  },
  low: {
    label: 'Low Risk', emoji: '🟢',
    bg: 'from-slate-50 to-gray-50', border: 'border-slate-200',
    badge: 'bg-slate-100 text-slate-600 border border-slate-200',
    header: 'bg-gradient-to-r from-slate-400 to-slate-500',
    icon: 'text-slate-400', count_bg: 'bg-slate-400',
  },
}

export default function ExclusionsView({ policy }: Props) {
  const high   = policy.notCovered.filter(e => e.severity === 'high')
  const medium = policy.notCovered.filter(e => e.severity === 'medium')
  const low    = policy.notCovered.filter(e => e.severity === 'low')

  const total = policy.notCovered.length

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <span className="section-label">Risk Assessment</span>
        <h2 className="text-xl font-black text-slate-900 mt-1">🚫 What's NOT Covered</h2>
        <p className="text-slate-500 mt-0.5 text-xs">Know these before you file a claim — surprises here are expensive.</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'High Risk', count: high.length, cfg: severityConfig.high },
          { label: 'Medium Risk', count: medium.length, cfg: severityConfig.medium },
          { label: 'Low Risk', count: low.length, cfg: severityConfig.low },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -2, scale: 1.03 }}
            className={`bg-gradient-to-br ${s.cfg.bg} border-2 ${s.cfg.border} rounded-xl p-3 text-center cursor-default`}
          >
            <div className="text-xl mb-0.5">{s.cfg.emoji}</div>
            <div className="text-2xl font-black text-slate-900 stat-number">{s.count}</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">{s.label}</div>
            <div className="mt-1.5 h-1 rounded-full bg-slate-200 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${total ? (s.count / total) * 100 : 0}%` }}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.6, ease: 'easeOut' }}
                className={`h-1 rounded-full ${s.cfg.count_bg}`}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Sections */}
      {(['high', 'medium', 'low'] as const).map(sev => {
        const items = policy.notCovered.filter(e => e.severity === sev)
        if (!items.length) return null
        const cfg = severityConfig[sev]
        return (
          <div key={sev}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`flex items-center gap-1.5 text-white text-xs font-bold px-3 py-1 rounded-full ${cfg.header}`}>
                <AlertTriangle className="w-3 h-3" />
                {cfg.label}
              </div>
              <span className="text-xs text-slate-400">{items.length} exclusion{items.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="space-y-2">
              {items.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ x: 3 }}
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 bg-gradient-to-r ${cfg.bg} ${cfg.border} transition-all hover:shadow-md cursor-default card-hover`}
                >
                  <span className="text-xl flex-shrink-0">{item.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-bold text-slate-800 text-sm">{item.title}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${cfg.badge}`}>
                        {sev} risk
                      </span>
                    </div>
                    <p className="text-slate-600 text-xs mt-0.5">{item.description}</p>
                  </div>
                  <XCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${cfg.icon}`} />
                </motion.div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
