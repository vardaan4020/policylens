'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Sparkles, AlertTriangle, Copy, Check,
  BookOpen, Lightbulb, CheckCircle, XCircle
} from 'lucide-react'
import { PolicyData } from '@/lib/types'

interface Props { policy: PolicyData; onNavigate: (tab: any) => void }

const factColors = [
  'from-violet-500 to-purple-600', 'from-blue-500 to-cyan-500',
  'from-emerald-500 to-teal-500',  'from-orange-500 to-amber-500',
  'from-pink-500 to-rose-500',     'from-indigo-500 to-blue-600',
  'from-red-500 to-rose-500',      'from-teal-500 to-cyan-600',
]

function ScoreGauge({ score }: { score: number }) {
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'
  const label = score >= 75 ? 'Great' : score >= 50 ? 'Average' : 'Limited'
  const circumference = 2 * Math.PI * 36
  const dash = (score / 100) * circumference
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="36" fill="none" stroke="#e2e8f0" strokeWidth="8" />
          <motion.circle cx="40" cy="40" r="36" fill="none" stroke={color} strokeWidth="8"
            strokeLinecap="round" strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - dash }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-black text-white">{score}</span>
          <span className="text-xs text-white/60">/100</span>
        </div>
      </div>
      <span className="text-xs font-bold text-white/80">{label}</span>
    </div>
  )
}

export default function SummaryView({ policy, onNavigate }: Props) {
  const [copied, setCopied] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>('covered')

  const copySummary = () => {
    const text = [
      policy.name,
      '',
      '📋 SUMMARY',
      policy.summary,
      '',
      '💡 BOTTOM LINE',
      policy.simpleSummary,
      '',
      '📊 KEY FACTS',
      ...policy.keyFacts.map(f => `• ${f.label}: ${f.value}`),
      '',
      '✅ WHAT\'S COVERED',
      ...policy.covered.map(c => `• ${c.title}${c.limit ? ` (${c.limit})` : ''}: ${c.description}`),
      '',
      '🚫 WHAT\'S NOT COVERED',
      ...policy.notCovered.map(e => `• ${e.title} [${e.severity} risk]: ${e.description}`),
      '',
      '⚠️ WATCH OUT FOR',
      ...policy.watchOut.map(w => `• ${w}`),
    ].join('\n')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">

      {/* ── Hero card ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-5 text-white"
        style={{ background: 'linear-gradient(135deg, #6d28d9 0%, #4338ca 45%, #0369a1 100%)' }}
      >
        <div className="absolute inset-0 grid-pattern opacity-10" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />

        <div className="relative z-10">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold opacity-80">AI Summary</span>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full capitalize">{policy.type} Policy</span>
                {policy.readingLevel && (
                  <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />{policy.readingLevel}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-black mb-2 leading-tight">{policy.name}</h2>
              <p className="text-white/90 text-sm leading-relaxed">{policy.summary}</p>
            </div>
            {policy.coverageScore !== undefined && (
              <div className="flex-shrink-0 bg-white/10 rounded-xl p-2">
                <ScoreGauge score={policy.coverageScore} />
              </div>
            )}
          </div>

          {policy.simpleSummary && (
            <div className="mt-3 bg-white/15 backdrop-blur rounded-xl p-3 border border-white/20">
              <p className="text-xs font-bold mb-1">💡 Bottom line</p>
              <p className="text-xs text-white/90">{policy.simpleSummary}</p>
            </div>
          )}

          <div className="mt-3 flex items-center justify-end">
            <button onClick={copySummary}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy full summary'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Key facts ── */}
      {policy.keyFacts?.length > 0 && (
        <div>
          <h3 className="section-label mb-2">📊 Key Numbers at a Glance</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {policy.keyFacts.map((fact, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -2, scale: 1.02 }}
                className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-default"
              >
                <div className={`w-1.5 h-4 rounded-full bg-gradient-to-b ${factColors[i % factColors.length]} mb-1.5`} />
                <p className="text-xs text-slate-500 font-medium leading-tight">{fact.label}</p>
                <p className="font-black text-slate-900 text-base mt-0.5 stat-number">{fact.value}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ── In-depth coverage breakdown ── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="flex border-b border-slate-100">
          {[
            { id: 'covered',    label: `✅ Covered (${policy.covered.length})`,       color: 'text-emerald-700', active: 'border-emerald-500 text-emerald-700' },
            { id: 'notCovered', label: `🚫 Not Covered (${policy.notCovered.length})`, color: 'text-red-600',     active: 'border-red-500 text-red-600' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setExpandedSection(tab.id)}
              className={`flex-1 py-2 text-xs font-bold border-b-2 transition-all
                ${expandedSection === tab.id ? tab.active : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
          {expandedSection === 'covered' && policy.covered.map((item, i) => (
            <motion.div key={item.id}
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-start gap-2 p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg"
            >
              <span className="text-lg flex-shrink-0">{item.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="font-bold text-slate-800 text-xs">{item.title}</p>
                  {item.limit && (
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-semibold">{item.limit}</span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-0.5">{item.description}</p>
              </div>
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
            </motion.div>
          ))}

          {expandedSection === 'notCovered' && policy.notCovered.map((item, i) => {
            const sev = { high: 'bg-red-100 text-red-700 border-red-200', medium: 'bg-amber-100 text-amber-700 border-amber-200', low: 'bg-slate-100 text-slate-600 border-slate-200' }
            return (
              <motion.div key={item.id}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-start gap-2 p-2.5 bg-red-50 border border-red-100 rounded-lg"
              >
                <span className="text-lg flex-shrink-0">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="font-bold text-slate-800 text-xs">{item.title}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold border ${sev[item.severity]}`}>{item.severity} risk</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{item.description}</p>
                </div>
                <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* ── Quick tips ── */}
      {(policy.quickTips?.length ?? 0) > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
              <Lightbulb className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <h3 className="font-bold text-blue-800 text-sm">💡 How to get the most from this policy</h3>
          </div>
          <ul className="space-y-2">
            {(policy.quickTips ?? []).map((tip, i) => (
              <motion.li key={i}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.06 }}
                className="flex items-start gap-2 text-xs text-blue-900"
              >
                <span className="w-4 h-4 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-blue-700 mt-0.5">{i + 1}</span>
                {tip}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* ── Watch out ── */}
      {policy.watchOut?.length > 0 && (
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <h3 className="font-bold text-amber-800 text-sm">⚠️ Important conditions to know</h3>
          </div>
          <ul className="space-y-2">
            {policy.watchOut.map((w, i) => (
              <motion.li key={i}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.06 }}
                className="flex items-start gap-2 text-xs text-amber-900"
              >
                <span className="w-4 h-4 bg-amber-200 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-amber-700 mt-0.5">{i + 1}</span>
                {w}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  )
}
