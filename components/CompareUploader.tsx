'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, Loader2, AlertCircle, GitCompare, Plus, Zap, FileText, User, ArrowRight } from 'lucide-react'
import { PolicyData, PolicyComparison } from '@/lib/types'
import ComparisonCriteriaSelector, { ComparisonCriteria } from './ComparisonCriteriaSelector'

// Minimal sample variants for comparison demo
const SAMPLE_VARIANTS: Partial<PolicyData>[] = [
  { name: 'Premier Health Plan', type: 'health', summary: 'Comprehensive health plan with $500 deductible and 80/20 coinsurance.', simpleSummary: 'Good coverage, higher premium.', keyFacts: [{label:'Deductible',value:'$500'},{label:'Coinsurance',value:'80/20'},{label:'OOP Max',value:'$6,000'}], covered: [{id:'c1',title:'Hospital Stays',description:'Full inpatient coverage',limit:'$1M',emoji:'🏥'},{id:'c2',title:'Emergency Room',description:'$250 copay',limit:'No limit',emoji:'🚨'},{id:'c3',title:'Mental Health',description:'30 visits/year',limit:'30/year',emoji:'🧠'}], notCovered: [{id:'e1',title:'Dental',description:'Not included',severity:'medium',emoji:'🦷'},{id:'e2',title:'Vision',description:'Not included',severity:'low',emoji:'👓'}], watchOut: ['Referral required for specialists','90-day pre-existing waiting period'], coverageScore: 74 },
  { name: 'Basic Health Plan', type: 'health', summary: 'Budget health plan with $1,200 deductible and 70/30 coinsurance.', simpleSummary: 'Lower premium, higher out-of-pocket costs.', keyFacts: [{label:'Deductible',value:'$1,200'},{label:'Coinsurance',value:'70/30'},{label:'OOP Max',value:'$8,500'}], covered: [{id:'c1',title:'Hospital Stays',description:'Inpatient coverage',limit:'$500K',emoji:'🏥'},{id:'c2',title:'Emergency Room',description:'$400 copay',limit:'No limit',emoji:'🚨'},{id:'c3',title:'Mental Health',description:'20 visits/year',limit:'20/year',emoji:'🧠'}], notCovered: [{id:'e1',title:'Dental',description:'Not included',severity:'medium',emoji:'🦷'},{id:'e2',title:'International',description:'No overseas coverage',severity:'high',emoji:'✈️'}], watchOut: ['High deductible means large upfront costs','Limited specialist network'], coverageScore: 52 },
]

interface SlotPolicy { file: File | null; name: string; data: PolicyData | null; loading: boolean; error: string | null }

interface Props { onComparisonReady: (result: PolicyComparison, policies: PolicyData[]) => void }

const STEPS = ['Reading PDF...', 'Extracting text...', 'AI analyzing...', 'Done!']

const SLOT_COLORS = [
  { border: 'border-violet-300', bg: 'bg-violet-50', badge: 'bg-violet-500', text: 'text-violet-700', light: 'bg-violet-100' },
  { border: 'border-blue-300',   bg: 'bg-blue-50',   badge: 'bg-blue-500',   text: 'text-blue-700',   light: 'bg-blue-100' },
  { border: 'border-emerald-300',bg: 'bg-emerald-50',badge: 'bg-emerald-500',text: 'text-emerald-700',light: 'bg-emerald-100' },
  { border: 'border-orange-300', bg: 'bg-orange-50', badge: 'bg-orange-500', text: 'text-orange-700', light: 'bg-orange-100' },
]

const emptySlot = (): SlotPolicy => ({ file: null, name: '', data: null, loading: false, error: null })

async function analyzeFile(file: File): Promise<PolicyData> {
  const formData = new FormData()
  formData.append('file', file)
  const extractRes = await fetch('/api/extract', { method: 'POST', body: formData })
  let text = ''
  if (extractRes.ok) { const d = await extractRes.json(); text = d.text || '' }
  if (!text) text = await file.text().catch(() => '')
  if (!text || text.length < 50) throw new Error('Could not read text from this PDF.')
  const analyzeRes = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, filename: file.name }),
  })
  if (!analyzeRes.ok) { const e = await analyzeRes.json(); throw new Error(e.error || 'Analysis failed') }
  return analyzeRes.json()
}

export default function CompareUploader({ onComparisonReady }: Props) {
  const [slots, setSlots] = useState<SlotPolicy[]>([emptySlot(), emptySlot()])
  const [comparing, setComparing] = useState(false)
  const [compareError, setCompareError] = useState<string | null>(null)
  const [showCriteriaSelector, setShowCriteriaSelector] = useState(false)
  const [selectedCriteria, setSelectedCriteria] = useState<ComparisonCriteria | null>(null)
  const [hasProfile, setHasProfile] = useState(false)
  const [showProfileReminder, setShowProfileReminder] = useState(false)

  useEffect(() => {
    checkProfile()
  }, [])

  const checkProfile = async () => {
    try {
      const res = await fetch('/api/profile')
      if (res.ok) {
        const data = await res.json()
        const profile = data.profile
        const isComplete = profile && profile.age && profile.gender && profile.location
        setHasProfile(isComplete)
        setShowProfileReminder(!isComplete)
      }
    } catch (err) {
      console.error('Failed to check profile:', err)
    }
  }

  const updateSlot = (i: number, patch: Partial<SlotPolicy>) =>
    setSlots(prev => prev.map((s, idx) => idx === i ? { ...s, ...patch } : s))

  const processFile = async (file: File, i: number) => {
    updateSlot(i, { file, name: file.name.replace(/\.[^.]+$/, ''), loading: true, error: null, data: null })
    try {
      const data = await analyzeFile(file)
      updateSlot(i, { data, name: data.name, loading: false })
    } catch (e: any) {
      updateSlot(i, { loading: false, error: e.message })
    }
  }

  const loadSampleIntoSlot = async (i: number) => {
    updateSlot(i, { loading: true, error: null })
    await new Promise(r => setTimeout(r, 600))
    const idx = i % SAMPLE_VARIANTS.length
    const variant: PolicyData = {
      id: `sample-${i}`,
      rawText: '',
      watchOut: [],
      quickTips: [],
      timeline: [],
      glossary: [],
      ...SAMPLE_VARIANTS[idx],
    } as PolicyData
    updateSlot(i, { data: variant, name: variant.name, loading: false })
  }

  const addSlot = () => { if (slots.length < 4) setSlots(prev => [...prev, emptySlot()]) }
  const removeSlot = (i: number) => { if (slots.length > 2) setSlots(prev => prev.filter((_, idx) => idx !== i)) }

  const readyPolicies = slots.filter(s => s.data !== null)
  const canCompare = readyPolicies.length >= 2 && !comparing

  const handleCompareClick = () => {
    setShowCriteriaSelector(true)
  }

  const handleCriteriaConfirm = (criteria: ComparisonCriteria) => {
    setSelectedCriteria(criteria)
    setShowCriteriaSelector(false)
    runComparison(criteria)
  }

  const handleCriteriaSkip = () => {
    setShowCriteriaSelector(false)
    runComparison(null)
  }

  const runComparison = async (criteria: ComparisonCriteria | null) => {
    setComparing(true)
    setCompareError(null)
    try {
      const policies = slots.filter(s => s.data).map(s => s.data!)
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ policies, criteria }),
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Comparison failed') }
      const result = await res.json()
      onComparisonReady(result, policies)
    } catch (e: any) {
      setCompareError(e.message)
    } finally {
      setComparing(false)
    }
  }

  // Show criteria selector if triggered
  if (showCriteriaSelector) {
    return (
      <ComparisonCriteriaSelector
        onConfirm={handleCriteriaConfirm}
        onSkip={handleCriteriaSkip}
      />
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-6">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-3">
        <motion.div animate={{ rotate: [0, -5, 5, 0] }} transition={{ duration: 4, repeat: Infinity }} className="text-5xl">⚖️</motion.div>
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-violet-100 border border-blue-200 text-blue-700 text-sm font-semibold px-4 py-1.5 rounded-full">
          <Zap className="w-3.5 h-3.5 text-yellow-500" />
          Compare 2–4 policies side by side
        </div>
        <h1 className="text-3xl font-black text-slate-900">Which policy is <span className="gradient-text">actually better?</span></h1>
        <p className="text-slate-500">Upload multiple policies — AI compares them across every dimension and picks a winner.</p>
      </motion.div>

      {/* Profile Reminder */}
      {showProfileReminder && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-violet-50 to-blue-50 border-2 border-violet-200 rounded-2xl p-4"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-violet-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 mb-1">Get Personalized Recommendations</h3>
              <p className="text-sm text-slate-600 mb-3">
                Complete your profile to get AI recommendations tailored to your age, location, family size, and health needs.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => window.location.href = '/profile'}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  Complete Profile
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setShowProfileReminder(false)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-semibold rounded-lg transition-colors"
                >
                  Skip
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowProfileReminder(false)}
              className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Slots */}
      <div className="space-y-3">
        <AnimatePresence>
          {slots.map((slot, i) => {
            const col = SLOT_COLORS[i]
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16, height: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`relative bg-white border-2 rounded-2xl overflow-hidden transition-all ${slot.data ? col.border : 'border-slate-200'}`}
              >
                {/* Slot header */}
                <div className={`flex items-center gap-3 px-4 py-3 ${slot.data ? col.bg : 'bg-slate-50'} border-b border-slate-100`}>
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-black ${slot.data ? col.badge : 'bg-slate-300'}`}>
                    {i + 1}
                  </div>
                  <span className={`text-sm font-bold ${slot.data ? col.text : 'text-slate-400'}`}>
                    {slot.data ? slot.name : `Policy ${i + 1}`}
                  </span>
                  {slot.data && <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">✓ Ready</span>}
                  {slots.length > 2 && (
                    <button onClick={() => removeSlot(i)} className="ml-auto p-1 rounded-lg hover:bg-red-100 text-slate-400 hover:text-red-500 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Slot body */}
                <div className="p-4">
                  {slot.loading ? (
                    <div className="flex items-center gap-3 py-2">
                      <Loader2 className="w-5 h-5 animate-spin text-violet-500" />
                      <span className="text-sm text-slate-600">Analyzing with AI...</span>
                    </div>
                  ) : slot.data ? (
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <p className="text-sm text-slate-600 line-clamp-2">{slot.data.simpleSummary}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {slot.data.keyFacts.slice(0, 3).map((f, fi) => (
                            <span key={fi} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg">
                              {f.label}: <span className="font-semibold">{f.value}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => updateSlot(i, emptySlot())}
                        className="text-xs text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                      >
                        Replace
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      {/* Drop zone */}
                      <label className={`relative flex-1 flex items-center gap-3 border-2 border-dashed rounded-xl px-4 py-3 cursor-pointer transition-all hover:border-violet-300 hover:bg-violet-50/50 ${slot.error ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}>
                        <input
                          type="file" accept=".pdf,.txt"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={e => e.target.files?.[0] && processFile(e.target.files[0], i)}
                        />
                        <Upload className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span className="text-sm text-slate-500">{slot.error || 'Drop PDF or click to browse'}</span>
                      </label>
                      <span className="text-xs text-slate-400">or</span>
                      <button
                        onClick={() => loadSampleIntoSlot(i)}
                        className="flex items-center gap-1.5 text-xs bg-violet-50 hover:bg-violet-100 border border-violet-200 text-violet-700 px-3 py-2 rounded-xl font-semibold transition-colors whitespace-nowrap"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Use Sample
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Add slot */}
      {slots.length < 4 && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={addSlot}
          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-300 hover:border-violet-300 hover:bg-violet-50/50 rounded-2xl text-sm text-slate-500 hover:text-violet-600 font-semibold transition-all"
        >
          <Plus className="w-4 h-4" />
          Add another policy ({slots.length}/4)
        </motion.button>
      )}

      {compareError && (
        <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-2xl p-4">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          {compareError}
        </div>
      )}

      {/* Compare button */}
      <motion.button
        whileHover={canCompare ? { scale: 1.02, y: -2 } : {}}
        whileTap={canCompare ? { scale: 0.97 } : {}}
        onClick={handleCompareClick}
        disabled={!canCompare}
        className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-lg transition-all shadow-lg
          ${canCompare
            ? 'bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white glow-violet'
            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
      >
        {comparing
          ? <><Loader2 className="w-5 h-5 animate-spin" /> AI is comparing policies...</>
          : <><GitCompare className="w-5 h-5" /> Compare {readyPolicies.length} Policies</>
        }
      </motion.button>

      <p className="text-center text-xs text-slate-400">
        {readyPolicies.length < 2 ? `Add ${2 - readyPolicies.length} more policy to compare` : `${readyPolicies.length} policies ready · click Compare`}
      </p>
    </div>
  )
}
