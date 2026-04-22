'use client'

import { motion } from 'framer-motion'
import { PolicyData } from '@/lib/types'
import { Clock, AlertTriangle, RefreshCw, Calendar, Gift } from 'lucide-react'

interface Props { policy: PolicyData }

const typeConfig = {
  start:    { color: 'bg-emerald-500', light: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: Gift },
  waiting:  { color: 'bg-amber-500',   light: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700',   icon: Clock },
  renewal:  { color: 'bg-blue-500',    light: 'bg-blue-50',    border: 'border-blue-200',    text: 'text-blue-700',    icon: RefreshCw },
  deadline: { color: 'bg-red-500',     light: 'bg-red-50',     border: 'border-red-200',     text: 'text-red-700',     icon: AlertTriangle },
  benefit:  { color: 'bg-violet-500',  light: 'bg-violet-50',  border: 'border-violet-200',  text: 'text-violet-700',  icon: Calendar },
}

const FALLBACK = [
  { id:'t1', title:'Coverage Starts',       description:'Your policy becomes active on the effective date.',                    period:'Day 1',    type:'start'    as const, emoji:'🟢' },
  { id:'t2', title:'Pre-existing Condition Waiting Period', description:'Conditions diagnosed before enrollment may have a waiting period.', period:'90 days', type:'waiting' as const, emoji:'⏳' },
  { id:'t3', title:'Annual Renewal',        description:'Your policy renews each year. Review terms for any changes.',          period:'Annual',   type:'renewal'  as const, emoji:'🔄' },
  { id:'t4', title:'Claims Deadline',       description:'File claims within the allowed window after receiving care.',          period:'90–180 days', type:'deadline' as const, emoji:'📋' },
]

export default function TimelineView({ policy }: Props) {
  const items = policy.timeline?.length ? policy.timeline : FALLBACK

  return (
    <div className="space-y-6">
      <div>
        <span className="section-label">Policy Lifecycle</span>
        <h2 className="text-2xl font-black text-slate-900 mt-1">📅 Timeline & Key Dates</h2>
        <p className="text-slate-500 mt-1 text-sm">Important periods, waiting times, and deadlines for your policy.</p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(typeConfig).map(([type, cfg]) => (
          <span key={type} className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${cfg.light} ${cfg.text} border ${cfg.border}`}>
            <span className={`w-2 h-2 rounded-full ${cfg.color}`} />
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </span>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-violet-200 via-blue-200 to-emerald-200" />

        <div className="space-y-4">
          {items.map((item, i) => {
            const cfg = typeConfig[item.type] || typeConfig.benefit
            const Icon = cfg.icon
            return (
              <motion.div key={item.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex gap-4 pl-2"
              >
                {/* Dot */}
                <div className={`relative z-10 w-9 h-9 rounded-full ${cfg.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>

                {/* Card */}
                <div className={`flex-1 ${cfg.light} border ${cfg.border} rounded-2xl p-4 hover:shadow-md transition-all`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{item.emoji}</span>
                      <h3 className="font-bold text-slate-900">{item.title}</h3>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${cfg.light} ${cfg.text} border ${cfg.border}`}>
                      {item.period}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Note */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-500 flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        Dates and periods are extracted from your policy document. Always verify exact dates with your insurer.
      </div>
    </div>
  )
}
