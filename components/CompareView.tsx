'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy, CheckCircle, XCircle, ArrowLeft, Crown,
  AlertTriangle, Star, DollarSign, Target, TrendingUp,
  ChevronDown, ChevronUp, Info, User, Shield
} from 'lucide-react'
import { PolicyComparison, PolicyData } from '@/lib/types'

interface Props {
  result: PolicyComparison
  policies: PolicyData[]
  onReset: () => void
}

const COLORS = [
  { bg: 'bg-violet-500', light: 'bg-violet-50', border: 'border-violet-300', text: 'text-violet-700', badge: 'bg-violet-100 text-violet-700 border-violet-200', bar: 'bg-violet-500', ring: 'ring-violet-300' },
  { bg: 'bg-blue-500',   light: 'bg-blue-50',   border: 'border-blue-300',   text: 'text-blue-700',   badge: 'bg-blue-100 text-blue-700 border-blue-200',     bar: 'bg-blue-500',   ring: 'ring-blue-300' },
  { bg: 'bg-emerald-500',light: 'bg-emerald-50',border: 'border-emerald-300',text: 'text-emerald-700',badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',bar:'bg-emerald-500',ring:'ring-emerald-300'},
  { bg: 'bg-orange-500', light: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700 border-orange-200', bar: 'bg-orange-500', ring: 'ring-orange-300' },
]

const TABS = [
  { id: 'overview',  label: 'Overview',             emoji: '🏆' },
  { id: 'table',     label: 'Category Comparison',  emoji: '📊' },
  { id: 'deep',      label: 'Deep Analysis',        emoji: '🔍' },
  { id: 'costs',     label: 'Cost Analysis',        emoji: '💰' },
  { id: 'gaps',      label: 'Gaps & Strengths',     emoji: '⚠️' },
]

function ScoreBar({ score, color, delay }: { score: number; color: string; delay: number }) {
  return (
    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ delay, duration: 0.8, ease: 'easeOut' }}
        className={`h-2.5 rounded-full ${color}`}
      />
    </div>
  )
}

export default function CompareView({ result, policies, onReset }: Props) {
  const [activeTab, setActiveTab] = useState('overview')
  const [expandedCat, setExpandedCat] = useState<number | null>(null)
  const [hasProfile, setHasProfile] = useState(false)
  const winnerIdx = result.policies.findIndex(n => n === result.verdict)

  useEffect(() => {
    checkProfile()
  }, [])

  const checkProfile = async () => {
    try {
      const res = await fetch('/api/profile')
      if (res.ok) {
        const data = await res.json()
        const profile = data.profile
        setHasProfile(profile && profile.age && profile.gender)
      }
    } catch (err) {
      console.error('Failed to check profile:', err)
    }
  }

  return (
    <div className="space-y-6 pb-12">

      {/* Header */}
      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ x: -2 }} whileTap={{ scale: 0.96 }}
          onClick={onReset}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 bg-white border border-slate-200 hover:border-slate-300 px-3 py-2 rounded-xl transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> New Comparison
        </motion.button>
        <div className="flex-1">
          <span className="section-label">Policy Comparison Report</span>
          <h2 className="text-xl font-black text-slate-900 mt-0.5">⚖️ {result.policies.length} Policies Analyzed</h2>
        </div>
        {hasProfile && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 border border-violet-200 text-violet-700 text-xs font-semibold rounded-full">
            <User className="w-3 h-3" />
            Personalized
          </div>
        )}
      </div>

      {/* Winner hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-5 text-white"
        style={{ background: 'linear-gradient(135deg, #6d28d9 0%, #4338ca 45%, #0369a1 100%)' }}
      >
        <div className="absolute inset-0 grid-pattern opacity-10" />
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-24 translate-x-24" />
        <div className="relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <Trophy className="w-6 h-6 text-yellow-900" />
            </div>
            <div className="flex-1">
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-0.5">Overall Winner</p>
              <h3 className="text-2xl font-black mb-2">{result.verdict}</h3>
              <p className="text-white/85 leading-relaxed text-sm">{result.verdictReason}</p>
            </div>
          </div>

          {/* Score bars */}
          {result.overallScores?.length > 0 && (
            <div className="mt-4 grid gap-2">
              {result.policies.map((name, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-white/70 text-xs font-semibold w-28 truncate">{name}</span>
                  <div className="flex-1">
                    <ScoreBar score={result.overallScores[i] || 0} color="bg-white/80" delay={0.3 + i * 0.15} />
                  </div>
                  <span className="text-white font-black text-sm w-8 text-right">{result.overallScores[i] || 0}</span>
                  {i === winnerIdx && <Crown className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Policy pills */}
      <div className="flex flex-wrap gap-2 -mx-4 px-4 overflow-x-auto no-scrollbar scrollbar-hide">
        {result.policies.map((name, i) => {
          const col = COLORS[i]
          return (
            <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-semibold whitespace-nowrap flex-shrink-0 ${col.badge}`}>
              <span className={`w-2 h-2 rounded-full ${col.bg}`} />
              <span className="truncate max-w-[150px] sm:max-w-none">{name}</span>
              {i === winnerIdx && <Crown className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />}
            </div>
          )
        })}
      </div>

      {/* Tab bar */}
      <div className="overflow-x-auto no-scrollbar scrollbar-hide -mx-4 px-4">
        <div className="flex gap-1 bg-white border border-slate-200 p-1.5 rounded-2xl shadow-sm w-fit min-w-full sm:min-w-0">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex-shrink-0
                ${activeTab === t.id
                  ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
            >
              <span>{t.emoji}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
        >

          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {result.policies.map((name, i) => {
                const col = COLORS[i]
                const isWinner = i === winnerIdx
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`bg-white rounded-3xl border-2 overflow-hidden shadow-sm ${isWinner ? col.border : 'border-slate-200'}`}
                  >
                    {/* Card header */}
                    <div className={`flex items-center gap-3 px-6 py-4 ${isWinner ? col.light : 'bg-slate-50'}`}>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm ${col.bg} shadow-md`}>{i + 1}</div>
                      <div className="flex-1">
                        <span className={`font-black text-lg ${isWinner ? col.text : 'text-slate-800'}`}>{name}</span>
                        {result.overallScores?.[i] && (
                          <span className="ml-2 text-xs text-slate-500 font-semibold">Score: {result.overallScores[i]}/100</span>
                        )}
                      </div>
                      {isWinner && (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-yellow-700 bg-yellow-100 border border-yellow-200 px-3 py-1 rounded-full">
                          <Crown className="w-3.5 h-3.5" /> Recommended
                        </span>
                      )}
                    </div>

                    <div className="px-6 py-5 space-y-5">
                      {/* Score bar */}
                      {result.overallScores?.[i] && (
                        <div>
                          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                            <span className="font-semibold">Overall Score</span>
                            <span className="font-black">{result.overallScores[i]}/100</span>
                          </div>
                          <ScoreBar score={result.overallScores[i]} color={col.bar} delay={0.2 + i * 0.1} />
                        </div>
                      )}

                      {/* Best for / Worst for */}
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                          <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                            <Target className="w-3.5 h-3.5" /> Best For
                          </p>
                          <p className="text-sm text-emerald-900 leading-relaxed">{result.bestFor?.[i]}</p>
                        </div>
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                          <p className="text-xs font-bold text-red-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Avoid If
                          </p>
                          <p className="text-sm text-red-900 leading-relaxed">{result.worstFor?.[i]}</p>
                        </div>
                      </div>

                      {/* Pros */}
                      <div>
                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5" /> Strengths
                        </p>
                        <ul className="space-y-2">
                          {(result.pros?.[i] || []).map((pro, pi) => (
                            <li key={pi} className="flex items-start gap-2.5 text-sm text-slate-700">
                              <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <CheckCircle className="w-3 h-3 text-emerald-600" />
                              </div>
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Cons */}
                      <div>
                        <p className="text-xs font-bold text-red-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                          <XCircle className="w-3.5 h-3.5" /> Weaknesses
                        </p>
                        <ul className="space-y-2">
                          {(result.cons?.[i] || []).map((con, ci) => (
                            <li key={ci} className="flex items-start gap-2.5 text-sm text-slate-700">
                              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <XCircle className="w-3 h-3 text-red-500" />
                              </div>
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* ── CATEGORY COMPARISON ── */}
          {activeTab === 'table' && (
            <div className="space-y-3">
              {/* Header */}
              <div className="text-center mb-4">
                <h2 className="text-2xl font-black text-slate-900 mb-1">📊 Category Comparison</h2>
                <p className="text-sm text-slate-600">Compare policies side-by-side across all key categories</p>
              </div>

              {/* Policy Names Header - Highlighted */}
              <div className="bg-white rounded-xl border-2 border-violet-300 overflow-hidden shadow-lg mb-4">
                <div className="bg-gradient-to-r from-violet-600 via-blue-600 to-emerald-600 px-4 py-2">
                  <h3 className="text-white font-bold text-sm flex items-center gap-2">
                    <span>Comparing Policies:</span>
                  </h3>
                </div>
                <div className="grid gap-px bg-slate-200" style={{ gridTemplateColumns: `repeat(${result.policies.length}, 1fr)` }}>
                  {result.policies.map((name, i) => {
                    const col = COLORS[i]
                    const isWinner = i === winnerIdx
                    return (
                      <div
                        key={i}
                        className={`${col.light} px-4 py-3 text-center relative`}
                      >
                        {isWinner && (
                          <div className="absolute top-1 right-1">
                            <Crown className="w-4 h-4 text-yellow-500" />
                          </div>
                        )}
                        <div className="flex flex-col items-center gap-2">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-base ${col.bg} shadow-md`}>
                            {i + 1}
                          </div>
                          <div>
                            <p className={`font-black text-base ${col.text} leading-tight mb-0.5`}>{name}</p>
                            {result.overallScores?.[i] && (
                              <p className="text-xs text-slate-600 font-semibold">
                                Score: <span className={`${col.text} font-black`}>{result.overallScores[i]}/100</span>
                              </p>
                            )}
                          </div>
                          {isWinner && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-yellow-700 bg-yellow-100 border border-yellow-300 px-2 py-0.5 rounded-full">
                              <Crown className="w-2.5 h-2.5" />
                              Winner
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Highlighted Comparison Table */}
              <div className="bg-gradient-to-br from-violet-50 via-blue-50 to-emerald-50 rounded-2xl p-4 border-2 border-violet-200 shadow-lg">
                {result.categories?.map((cat, ci) => (
                  <motion.div
                    key={ci}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: ci * 0.05 }}
                    className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden shadow-sm mb-3 last:mb-0 hover:shadow-md transition-shadow"
                  >
                    {/* Row header */}
                    <button
                      onClick={() => setExpandedCat(expandedCat === ci ? null : ci)}
                      className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left bg-gradient-to-r from-slate-50 to-slate-100"
                    >
                      <span className="text-2xl flex-shrink-0">{cat.emoji}</span>
                      <span className="font-black text-slate-900 flex-1 text-base">{cat.category}</span>
                      {expandedCat === ci
                        ? <ChevronUp className="w-4 h-4 text-slate-600" />
                        : <ChevronDown className="w-4 h-4 text-slate-600" />
                      }
                    </button>

                    {/* Values row - Highlighted */}
                    <div className="overflow-x-auto">
                      <div className="grid min-w-max border-t-2 border-slate-200" style={{ gridTemplateColumns: `repeat(${result.policies.length}, minmax(150px, 1fr))` }}>
                        {cat.values?.map((val, vi) => {
                          const col = COLORS[vi]
                          const isWinner = cat.winner === vi
                          return (
                            <div
                              key={vi}
                              className={`px-3 py-2.5 text-center border-r-2 last:border-r-0 border-slate-200 transition-all
                                ${isWinner ? `${col.light} border-l-4 ${col.border}` : 'bg-white hover:bg-slate-50'}`}
                            >
                              <p className={`text-xs font-black mb-1.5 uppercase tracking-wide ${col.text}`}>
                                Policy {vi + 1}
                              </p>
                              <div className={`inline-flex items-center gap-1.5 text-sm font-black px-3 py-1.5 rounded-lg transition-all
                                ${isWinner 
                                  ? `${col.bg} text-white shadow-md scale-105` 
                                  : 'text-slate-700 bg-slate-100 hover:bg-slate-200'}`}>
                                {isWinner && <CheckCircle className="w-4 h-4 flex-shrink-0" />}
                                <span>{val}</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Expanded detail */}
                    <AnimatePresence>
                      {expandedCat === ci && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 py-3 bg-gradient-to-r from-slate-50 to-slate-100 border-t-2 border-slate-200 space-y-2">
                            {cat.winnerReason && (
                              <div className="flex items-start gap-2 text-xs bg-white rounded-lg p-3 border border-yellow-200 shadow-sm">
                                <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="font-bold text-slate-900 mb-0.5">Why this wins:</p>
                                  <p className="text-slate-700">{cat.winnerReason}</p>
                                </div>
                              </div>
                            )}
                            {cat.detail && (
                              <div className="flex items-start gap-2 text-xs bg-white rounded-lg p-3 border border-blue-200 shadow-sm">
                                <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="font-bold text-slate-900 mb-0.5">More details:</p>
                                  <p className="text-slate-700">{cat.detail}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-3 text-xs text-slate-600 bg-white rounded-lg p-3 border border-slate-200">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Winner in category</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  <span>Click to see details</span>
                </div>
              </div>
            </div>
          )}

          {/* ── DEEP ANALYSIS ── */}
          {activeTab === 'deep' && (
            <div className="space-y-6">
              {/* Final recommendation */}
              {result.recommendation && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-violet-50 to-blue-50 border-2 border-violet-200 rounded-3xl p-6"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-violet-100 rounded-xl flex items-center justify-center">
                      <Star className="w-4 h-4 text-violet-600" />
                    </div>
                    <h3 className="font-black text-violet-900">Expert Recommendation</h3>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{result.recommendation}</p>
                </motion.div>
              )}

              {/* Per-policy deep dive */}
              {result.policies.map((name, i) => {
                const col = COLORS[i]
                const isWinner = i === winnerIdx
                const policy = policies[i]
                
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`bg-white rounded-3xl border-2 overflow-hidden shadow-lg ${isWinner ? col.border : 'border-slate-200'}`}
                  >
                    {/* Policy Header */}
                    <div className={`flex items-center gap-3 px-6 py-4 ${isWinner ? col.light : 'bg-slate-50'}`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg ${col.bg} shadow-md`}>{i + 1}</div>
                      <div className="flex-1">
                        <span className={`font-black text-xl ${isWinner ? col.text : 'text-slate-800'}`}>{name}</span>
                        {result.overallScores?.[i] && (
                          <span className="ml-3 text-sm text-slate-500 font-semibold">Score: {result.overallScores[i]}/100</span>
                        )}
                      </div>
                      {isWinner && <Crown className="w-5 h-5 text-yellow-500" />}
                    </div>

                    <div className="p-6 space-y-6">
                      {/* Strengths & Weaknesses */}
                      <div className="grid sm:grid-cols-2 gap-5">
                        {/* Strengths */}
                        <div>
                          <p className="text-sm font-bold text-emerald-600 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                            <CheckCircle className="w-4 h-4" /> Strengths
                          </p>
                          <ul className="space-y-2.5">
                            {(result.pros?.[i] || []).map((pro, pi) => (
                              <li key={pi} className="flex items-start gap-2 text-sm text-slate-700">
                                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                                </div>
                                {pro}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Weaknesses */}
                        <div>
                          <p className="text-sm font-bold text-red-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                            <XCircle className="w-4 h-4" /> Weaknesses
                          </p>
                          <ul className="space-y-2.5">
                            {(result.cons?.[i] || []).map((con, ci) => (
                              <li key={ci} className="flex items-start gap-2 text-sm text-slate-700">
                                <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <XCircle className="w-3 h-3 text-red-500" />
                                </div>
                                {con}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Standout Features & Coverage Gaps */}
                      <div className="grid sm:grid-cols-2 gap-5">
                        {/* Standout features */}
                        <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4">
                          <p className="text-sm font-bold text-violet-600 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                            <Star className="w-4 h-4" /> Standout Features
                          </p>
                          <ul className="space-y-2.5">
                            {(result.standoutFeatures?.[i] || []).map((f, fi) => (
                              <li key={fi} className="flex items-start gap-2 text-sm text-slate-700">
                                <span className="text-violet-500 font-black mt-0.5 flex-shrink-0">★</span>
                                {f}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Coverage gaps */}
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                          <p className="text-sm font-bold text-amber-600 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4" /> Coverage Gaps
                          </p>
                          <ul className="space-y-2.5">
                            {(result.coverageGaps?.[i] || []).map((g, gi) => (
                              <li key={gi} className="flex items-start gap-2 text-sm text-slate-700">
                                <span className="text-amber-500 font-black mt-0.5 flex-shrink-0">!</span>
                                {g}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Cost Analysis */}
                      {result.costAnalysis?.[i] && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                          <p className="text-sm font-bold text-emerald-600 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                            <DollarSign className="w-4 h-4" /> Cost Analysis
                          </p>
                          <p className="text-sm text-slate-700 leading-relaxed mb-3">{result.costAnalysis[i]}</p>
                          
                          {/* Key cost facts from policy */}
                          {policy?.keyFacts && policy.keyFacts.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                              {policy.keyFacts.map((fact, fi) => (
                                <div key={fi} className="bg-white border border-emerald-200 rounded-xl p-2">
                                  <p className="text-xs text-slate-500 font-medium">{fact.label}</p>
                                  <p className="font-black text-sm text-emerald-700 mt-0.5">{fact.value}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* What's Covered */}
                      {policy?.covered && policy.covered.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                          <p className="text-sm font-bold text-blue-600 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                            <Shield className="w-4 h-4" /> What's Covered
                          </p>
                          <div className="grid sm:grid-cols-2 gap-3">
                            {policy.covered.slice(0, 6).map((item) => (
                              <div key={item.id} className="flex items-start gap-2 bg-white rounded-xl p-3 border border-blue-100">
                                <span className="text-xl flex-shrink-0">{item.emoji}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-sm text-slate-900">{item.title}</p>
                                  <p className="text-xs text-slate-600 mt-0.5">{item.description}</p>
                                  {item.limit && (
                                    <p className="text-xs text-blue-600 font-semibold mt-1">Limit: {item.limit}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* What's NOT Covered */}
                      {policy?.notCovered && policy.notCovered.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                          <p className="text-sm font-bold text-red-600 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                            <XCircle className="w-4 h-4" /> What's NOT Covered
                          </p>
                          <div className="grid sm:grid-cols-2 gap-3">
                            {policy.notCovered.slice(0, 6).map((item) => (
                              <div key={item.id} className="flex items-start gap-2 bg-white rounded-xl p-3 border border-red-100">
                                <span className="text-xl flex-shrink-0">{item.emoji}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-sm text-slate-900">{item.title}</p>
                                  <p className="text-xs text-slate-600 mt-0.5">{item.description}</p>
                                  <span className={`inline-block text-xs font-semibold mt-1 px-2 py-0.5 rounded-full
                                    ${item.severity === 'high' ? 'bg-red-100 text-red-700' : 
                                      item.severity === 'medium' ? 'bg-orange-100 text-orange-700' : 
                                      'bg-yellow-100 text-yellow-700'}`}>
                                    {item.severity} risk
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Health Check / Watch Out */}
                      {policy?.watchOut && policy.watchOut.length > 0 && (
                        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
                          <p className="text-sm font-bold text-orange-600 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4" /> Health Check - Watch Out
                          </p>
                          <ul className="space-y-2">
                            {policy.watchOut.map((warning, wi) => (
                              <li key={wi} className="flex items-start gap-2 text-sm text-slate-700">
                                <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                                {warning}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* ── COST ANALYSIS ── */}
          {activeTab === 'costs' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-500 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                ⚠️ Cost estimates are based on AI analysis of policy terms. Actual premiums vary by age, location, and health status.
              </p>
              {result.policies.map((name, i) => {
                const col = COLORS[i]
                const isWinner = i === winnerIdx
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`bg-white rounded-3xl border-2 overflow-hidden ${isWinner ? col.border : 'border-slate-200'}`}
                  >
                    <div className={`flex items-center gap-3 px-6 py-4 ${isWinner ? col.light : 'bg-slate-50'}`}>
                      <DollarSign className={`w-5 h-5 ${isWinner ? col.text : 'text-slate-500'}`} />
                      <span className={`font-black text-lg ${isWinner ? col.text : 'text-slate-800'}`}>{name}</span>
                      {isWinner && <span className="ml-auto text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">Best Value</span>}
                    </div>
                    <div className="px-6 py-5">
                      <p className="text-slate-700 leading-relaxed">{result.costAnalysis?.[i]}</p>

                      {/* Key cost facts from policy */}
                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {policies[i]?.keyFacts?.map((fact, fi) => (
                          <div key={fi} className={`rounded-xl p-3 ${col.light} border ${col.border}`}>
                            <p className="text-xs text-slate-500 font-medium">{fact.label}</p>
                            <p className={`font-black text-base mt-0.5 ${col.text}`}>{fact.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* ── GAPS & STRENGTHS ── */}
          {activeTab === 'gaps' && (
            <div className="space-y-6">
              {/* Side by side gaps */}
              <div>
                <h3 className="section-label mb-4">Coverage Gaps — What Each Policy Misses</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {result.policies.map((name, i) => {
                    const col = COLORS[i]
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden"
                      >
                        <div className={`flex items-center gap-2 px-4 py-3 ${col.light}`}>
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-black ${col.bg}`}>{i + 1}</div>
                          <span className={`font-bold text-sm ${col.text}`}>{name}</span>
                        </div>
                        <ul className="p-4 space-y-2.5">
                          {(result.coverageGaps?.[i] || []).map((g, gi) => (
                            <li key={gi} className="flex items-start gap-2 text-sm text-slate-700">
                              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                              {g}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* Side by side standouts */}
              <div>
                <h3 className="section-label mb-4">Standout Features — What Each Policy Does Best</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {result.policies.map((name, i) => {
                    const col = COLORS[i]
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className={`bg-white rounded-2xl border-2 overflow-hidden ${col.border}`}
                      >
                        <div className={`flex items-center gap-2 px-4 py-3 ${col.light}`}>
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-black ${col.bg}`}>{i + 1}</div>
                          <span className={`font-bold text-sm ${col.text}`}>{name}</span>
                        </div>
                        <ul className="p-4 space-y-2.5">
                          {(result.standoutFeatures?.[i] || []).map((f, fi) => (
                            <li key={fi} className="flex items-start gap-2 text-sm text-slate-700">
                              <Star className={`w-4 h-4 flex-shrink-0 mt-0.5 ${col.text}`} />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  )
}
