'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, AlertTriangle, CheckCircle, XCircle, TrendingUp, DollarSign, Users, Loader2 } from 'lucide-react'
import { PolicyData } from '@/lib/types'

interface Props { policy: PolicyData }

interface HealthResult {
  overallGrade: 'A' | 'B' | 'C' | 'D' | 'F'
  overallScore: number
  categories: {
    name: string
    score: number
    emoji: string
    verdict: string
    details: string
    issues: string[]
    strengths: string[]
  }[]
  criticalGaps: string[]
  recommendations: { priority: 'high' | 'medium' | 'low'; action: string; reason: string }[]
  suitableFor: string[]
  notSuitableFor: string[]
}

const gradeColor = { A: '#10b981', B: '#3b82f6', C: '#f59e0b', D: '#f97316', F: '#ef4444' }
const gradeLabel = { A: 'Excellent', B: 'Good', C: 'Average', D: 'Below Average', F: 'Poor' }

function ScoreBar({ score, delay }: { score: number; delay: number }) {
  const color = score >= 75 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-400' : 'bg-red-500'
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
        <motion.div className={`h-2 rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ delay, duration: 0.7, ease: 'easeOut' }}
        />
      </div>
      <span className="text-sm font-black text-slate-700 w-8 text-right">{score}</span>
    </div>
  )
}

export default function HealthCheckView({ policy }: Props) {
  const [result, setResult] = useState<HealthResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runCheck = async () => {
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/healthcheck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ policy }),
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      setResult(await res.json())
    } catch (e: any) {
      setError(e.message || 'Health check failed')
    } finally {
      setLoading(false)
    }
  }

  const priorityStyle = {
    high:   'bg-red-50 border-red-200 text-red-800',
    medium: 'bg-amber-50 border-amber-200 text-amber-800',
    low:    'bg-blue-50 border-blue-200 text-blue-800',
  }
  const priorityDot = { high: 'bg-red-500', medium: 'bg-amber-400', low: 'bg-blue-500' }

  return (
    <div className="space-y-6">
      <div>
        <span className="section-label">AI Risk Assessment</span>
        <h2 className="text-2xl font-black text-slate-900 mt-1">🩺 Policy Health Check</h2>
        <p className="text-slate-500 mt-1 text-sm">
          A comprehensive analysis of your policy's strengths, gaps, and what you should do about them.
        </p>
      </div>

      {!result && !loading && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-3xl p-8 text-center"
        >
          <div className="text-5xl mb-4">🩺</div>
          <h3 className="text-xl font-black text-slate-900 mb-2">Run a full health check</h3>
          <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
            AI will grade your policy across 5 categories, identify critical gaps, and give you prioritised recommendations.
          </p>
          <motion.button
            whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
            onClick={runCheck}
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg mx-auto text-sm"
          >
            <Shield className="w-4 h-4" />
            Run Health Check
          </motion.button>
        </motion.div>
      )}

      {loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-white border-2 border-cyan-200 rounded-3xl p-10 text-center"
        >
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="text-4xl mx-auto w-fit mb-4"
          >🩺</motion.div>
          <p className="font-bold text-slate-700">Analysing your policy...</p>
          <p className="text-sm text-slate-400 mt-1">Checking coverage, gaps, and risks</p>
        </motion.div>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-2xl p-4">{error}</div>
      )}

      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

          {/* Overall grade */}
          <div className="relative overflow-hidden rounded-3xl p-7 text-white"
            style={{ background: `linear-gradient(135deg, ${gradeColor[result.overallGrade]}cc 0%, ${gradeColor[result.overallGrade]} 100%)` }}
          >
            <div className="absolute inset-0 grid-pattern opacity-10" />
            <div className="relative z-10 flex items-center gap-6">
              <div className="w-24 h-24 rounded-3xl bg-white/20 flex flex-col items-center justify-center flex-shrink-0">
                <span className="text-5xl font-black">{result.overallGrade}</span>
              </div>
              <div>
                <p className="text-white/70 text-sm font-semibold mb-1">Overall Policy Grade</p>
                <h3 className="text-3xl font-black">{gradeLabel[result.overallGrade]}</h3>
                <p className="text-white/80 text-sm mt-1">Score: {result.overallScore}/100</p>
              </div>
            </div>
          </div>

          {/* Category scores */}
          <div>
            <h3 className="section-label mb-4">Category Breakdown</h3>
            <div className="space-y-3">
              {result.categories.map((cat, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{cat.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-bold text-slate-800">{cat.name}</p>
                        <span className="text-xs font-bold text-slate-500">{cat.verdict}</span>
                      </div>
                      <ScoreBar score={cat.score} delay={0.2 + i * 0.08} />
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{cat.details}</p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {cat.strengths.map((s, si) => (
                      <div key={si} className="flex items-start gap-1.5 text-xs text-emerald-700">
                        <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />{s}
                      </div>
                    ))}
                    {cat.issues.map((iss, ii) => (
                      <div key={ii} className="flex items-start gap-1.5 text-xs text-red-600">
                        <XCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />{iss}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Critical gaps */}
          {result.criticalGaps.length > 0 && (
            <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="font-black text-red-800">🚨 Critical Gaps</h3>
              </div>
              <ul className="space-y-2">
                {result.criticalGaps.map((gap, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-red-900">
                    <span className="w-5 h-5 bg-red-200 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-red-700 mt-0.5">{i + 1}</span>
                    {gap}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          <div>
            <h3 className="section-label mb-4">Prioritised Recommendations</h3>
            <div className="space-y-3">
              {result.recommendations.map((rec, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className={`flex items-start gap-3 p-4 rounded-2xl border ${priorityStyle[rec.priority]}`}
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${priorityDot[rec.priority]}`} />
                  <div>
                    <p className="font-bold text-sm">{rec.action}</p>
                    <p className="text-xs mt-0.5 opacity-80">{rec.reason}</p>
                  </div>
                  <span className="ml-auto text-xs font-bold uppercase opacity-60 flex-shrink-0">{rec.priority}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Suitable for */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> Best suited for
              </p>
              <ul className="space-y-1.5">
                {result.suitableFor.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-emerald-900">
                    <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-emerald-500" />{s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
              <p className="text-xs font-bold text-red-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5" /> Not ideal for
              </p>
              <ul className="space-y-1.5">
                {result.notSuitableFor.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-red-900">
                    <XCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-red-400" />{s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Re-run */}
          <button onClick={() => { setResult(null) }}
            className="text-sm text-slate-400 hover:text-slate-600 transition-colors mx-auto block"
          >
            ↺ Run again
          </button>
        </motion.div>
      )}
    </div>
  )
}
