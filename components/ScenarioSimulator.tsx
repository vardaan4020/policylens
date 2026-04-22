'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, CheckCircle, XCircle, AlertTriangle, Loader2, Lightbulb, DollarSign, Sparkles } from 'lucide-react'
import { PolicyData, ScenarioResult } from '@/lib/types'

async function simulateScenario(scenario: string, policy: PolicyData): Promise<ScenarioResult> {
  const res = await fetch('/api/simulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenario, policy }),
  })
  if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Simulation failed') }
  return res.json()
}

interface Props { policy: PolicyData }

const EXAMPLES = [
  { text: "I broke my leg skiing in Switzerland", emoji: "⛷️" },
  { text: "I need to see a cardiologist without a referral", emoji: "❤️" },
  { text: "I need emergency dental work", emoji: "🦷" },
  { text: "I was in a car accident — who pays?", emoji: "🚗" },
  { text: "I want to try an experimental cancer treatment", emoji: "🧪" },
  { text: "I need therapy for anxiety", emoji: "🧠" },
]

const confidenceStyle = {
  high:   { color: 'text-emerald-600', bg: 'bg-emerald-100', label: '✅ High confidence' },
  medium: { color: 'text-amber-600',   bg: 'bg-amber-100',   label: '⚠️ Medium confidence' },
  low:    { color: 'text-slate-500',   bg: 'bg-slate-100',   label: '❓ Low confidence' },
}

export default function ScenarioSimulator({ policy }: Props) {
  const [scenario, setScenario] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ScenarioResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const run = async () => {
    if (!scenario.trim()) return
    setLoading(true); setResult(null); setError(null)
    try {
      setResult(await simulateScenario(scenario, policy))
    } catch (e: any) {
      setError(e.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="section-label">AI Coverage Checker</span>
        <h2 className="text-2xl font-black text-slate-900 mt-1">🤖 Ask a Scenario</h2>
        <p className="text-slate-500 mt-1 text-sm">Describe any situation — get a direct yes/no with full explanation and cost estimate.</p>
      </div>

      {/* Input card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-2 border-slate-100 rounded-3xl p-5 shadow-md focus-within:border-violet-300 focus-within:shadow-violet-100 focus-within:shadow-xl transition-all"
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <textarea
            value={scenario}
            onChange={e => setScenario(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && e.metaKey && run()}
            placeholder="e.g. I broke my leg while skiing in Switzerland — am I covered?"
            rows={3}
            className="flex-1 resize-none text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none leading-relaxed"
            disabled={loading}
          />
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <span className="text-xs text-slate-400">{scenario.length} chars · ⌘+Enter to send</span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={run}
            disabled={!scenario.trim() || loading}
            className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 disabled:opacity-40 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {loading ? 'Analyzing...' : 'Check Coverage'}
          </motion.button>
        </div>
      </motion.div>

      {/* Examples */}
      <div>
        <p className="text-xs text-slate-500 mb-2.5 flex items-center gap-1.5 font-semibold">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Try an example:
        </p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map(ex => (
            <motion.button
              key={ex.text}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setScenario(ex.text); setResult(null) }}
              className="flex items-center gap-1.5 text-xs bg-white border border-slate-200 hover:border-violet-300 hover:bg-violet-50 text-slate-700 hover:text-violet-700 px-3 py-2 rounded-xl transition-all font-medium shadow-sm"
            >
              <span>{ex.emoji}</span>
              {ex.text}
            </motion.button>
          ))}
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-red-600 bg-red-50 border-2 border-red-200 rounded-2xl p-4"
        >
          ❌ {error}
        </motion.div>
      )}

      {/* Loading state */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white border-2 border-violet-200 rounded-3xl p-8 text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="text-4xl mx-auto w-fit mb-4"
          >🧠</motion.div>
          <p className="font-bold text-slate-700">AI is reading your policy...</p>
          <p className="text-sm text-slate-400 mt-1">Checking coverage, exclusions, and conditions</p>
        </motion.div>
      )}

      {/* Result */}
      <AnimatePresence>
        {result && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Verdict */}
            <div className={`rounded-3xl p-6 border-2 ${
              result.isCovered
                ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-300'
                : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-300'
            }`}>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                  result.isCovered ? 'bg-emerald-100' : 'bg-red-100'
                }`}>
                  {result.isCovered
                    ? <CheckCircle className="w-7 h-7 text-emerald-600" />
                    : <XCircle className="w-7 h-7 text-red-600" />
                  }
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <h3 className={`font-black text-xl ${result.isCovered ? 'text-emerald-800' : 'text-red-800'}`}>
                      {result.verdict}
                    </h3>
                    {result.confidence && (
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${confidenceStyle[result.confidence].bg} ${confidenceStyle[result.confidence].color}`}>
                        {confidenceStyle[result.confidence].label}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-700 leading-relaxed">{result.explanation}</p>
                </div>
              </div>
            </div>

            {/* Cost */}
            {result.isCovered && result.estimatedCost && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-4 bg-white border-2 border-blue-200 rounded-2xl p-5"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Estimated out-of-pocket</p>
                  <p className="font-black text-slate-900 text-lg">{result.estimatedCost}</p>
                </div>
              </motion.div>
            )}

            {/* Relevant sections */}
            {result.relevantSections?.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="bg-white border border-slate-200 rounded-2xl p-5"
              >
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">📋 Relevant Policy Sections</p>
                <div className="flex flex-wrap gap-2">
                  {result.relevantSections.map((s, i) => (
                    <span key={i} className="text-xs bg-violet-50 text-violet-700 border border-violet-200 px-3 py-1.5 rounded-xl font-medium">{s}</span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Warnings */}
            {result.warnings?.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <p className="font-bold text-amber-800">⚠️ Watch out</p>
                </div>
                <ul className="space-y-2">
                  {result.warnings.map((w, i) => (
                    <li key={i} className="text-sm text-amber-900 flex items-start gap-2">
                      <span className="w-5 h-5 bg-amber-200 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-amber-700 mt-0.5">{i + 1}</span>
                      {w}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Tips */}
            {result.tips?.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="bg-white border border-slate-200 rounded-2xl p-5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-violet-500" />
                  <p className="font-bold text-slate-700">💡 Tips</p>
                </div>
                <ul className="space-y-2">
                  {result.tips.map((t, i) => (
                    <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                      <span className="text-violet-500 font-bold mt-0.5">→</span>{t}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
