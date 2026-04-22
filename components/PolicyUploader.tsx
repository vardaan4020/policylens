'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileText, AlertCircle, Sparkles, BarChart2, PlayCircle, ShieldOff, Zap } from 'lucide-react'
import { PolicyData } from '@/lib/types'

interface Props { onPolicyParsed: (data: PolicyData) => void }

const STEPS = [
  { label: 'Reading document...', emoji: '📖', color: 'bg-violet-500' },
  { label: 'Extracting text...', emoji: '✂️', color: 'bg-blue-500' },
  { label: 'AI analyzing policy...', emoji: '🧠', color: 'bg-fuchsia-500' },
  { label: 'Building your summary...', emoji: '✨', color: 'bg-emerald-500' },
]

const features = [
  { emoji: '✨', label: 'Plain English Summary', bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700' },
  { emoji: '🗺️', label: 'Visual Coverage Map',  bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700' },
  { emoji: '🚫', label: 'Exclusion Finder',      bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-700' },
  { emoji: '🤖', label: 'AI Scenario Simulator', bg: 'bg-emerald-50',border: 'border-emerald-200',text: 'text-emerald-700' },
]

// Inline sample so we don't need policyParser.ts
const SAMPLE: PolicyData = {
  id: 'sample-001',
  name: 'Premier Health Insurance Plan',
  type: 'health',
  summary: 'A comprehensive health insurance plan covering hospital stays, emergency care, preventive services, mental health, and prescription drugs. You pay a $500 annual deductible, then 20% of costs (coinsurance) until you hit the $6,000 out-of-pocket maximum. After that, the insurer covers 100% for the rest of the year.',
  simpleSummary: 'Covers most medical care after a $500 deductible — but watch out for dental, vision, and international exclusions.',
  coverageScore: 74,
  readingLevel: 'Grade 13 (Complex)',
  keyFacts: [
    { label: 'Annual Deductible', value: '$500 individual' },
    { label: 'Coinsurance', value: '80/20 after deductible' },
    { label: 'Out-of-Pocket Max', value: '$6,000/year' },
    { label: 'ER Copay', value: '$250 (waived if admitted)' },
    { label: 'Preventive Care', value: '100% free' },
    { label: 'Mental Health', value: '30 visits/year' },
  ],
  covered: [
    { id: 'c1', title: 'Hospital Stays', description: 'Inpatient care, surgery, nursing — up to $1M lifetime', limit: '$1M lifetime', emoji: '🏥' },
    { id: 'c2', title: 'Emergency Room', description: '$250 copay, waived if admitted to hospital', limit: 'No limit', emoji: '🚨' },
    { id: 'c3', title: 'Preventive Care', description: 'Annual checkups, vaccines, screenings — fully free', limit: '100% covered', emoji: '✅' },
    { id: 'c4', title: 'Mental Health', description: 'Therapy and psychiatric visits, 30 sessions per year', limit: '30 visits/year', emoji: '🧠' },
    { id: 'c5', title: 'Prescription Drugs', description: 'Generic drugs cheapest; specialty needs pre-approval', limit: 'Tiered copays', emoji: '💊' },
    { id: 'c6', title: 'Surgery', description: 'Medically necessary procedures by licensed surgeons', limit: 'No annual limit', emoji: '🔬' },
  ],
  notCovered: [
    { id: 'e1', title: 'Dental Care', description: 'No routine dental, braces, or dental surgery', severity: 'medium', emoji: '🦷' },
    { id: 'e2', title: 'Vision Care', description: 'No eye exams, glasses, contacts, or LASIK', severity: 'low', emoji: '👓' },
    { id: 'e3', title: 'International Care', description: 'No coverage outside the US except life-threatening emergencies', severity: 'high', emoji: '✈️' },
    { id: 'e4', title: 'Cosmetic Procedures', description: 'Anything done for appearance, not medical necessity', severity: 'low', emoji: '💄' },
    { id: 'e5', title: 'Extreme Sports Injuries', description: 'Skydiving, bungee jumping, professional sports injuries', severity: 'medium', emoji: '🪂' },
    { id: 'e6', title: 'Long-Term Care', description: 'Nursing homes or assisted living for non-acute conditions', severity: 'high', emoji: '🏠' },
  ],
  watchOut: [
    'You need a referral from your primary doctor before seeing any specialist',
    'Pre-existing conditions have a 90-day waiting period before coverage kicks in',
    'Non-emergency ER visits are billed at out-of-network rates',
    'Specialty drugs require prior authorization or they won\'t be covered',
  ],
  quickTips: [
    'Always use in-network providers — out-of-network costs significantly more',
    'Get your annual preventive checkup — it\'s 100% free and resets each year',
    'Request a referral from your PCP before booking any specialist appointment',
    'Track your deductible — once hit, your costs drop to just 20%',
  ],
  timeline: [
    { id: 't1', title: 'Coverage Starts', description: 'Policy becomes active on your enrollment effective date', period: 'Day 1', type: 'start', emoji: '🟢' },
    { id: 't2', title: 'Pre-existing Waiting Period', description: 'Conditions diagnosed before enrollment may not be covered', period: '90 days', type: 'waiting', emoji: '⏳' },
    { id: 't3', title: 'Annual Deductible Resets', description: 'Your $500 deductible resets every January 1st', period: 'Jan 1 annually', type: 'renewal', emoji: '🔄' },
    { id: 't4', title: 'Claims Filing Deadline', description: 'Submit claims within 90 days of receiving care', period: '90 days', type: 'deadline', emoji: '📋' },
  ],
  glossary: [
    { term: 'Deductible', plain: 'The amount you pay before insurance starts covering costs', emoji: '💰' },
    { term: 'Coinsurance', plain: 'After your deductible, you pay 20% and insurance pays 80%', emoji: '🤝' },
    { term: 'Copay', plain: 'A fixed fee you pay for a specific service, like $250 for the ER', emoji: '💊' },
    { term: 'Out-of-Pocket Max', plain: 'The most you\'ll pay in a year — after this, insurance covers 100%', emoji: '🛡️' },
    { term: 'In-Network', plain: 'Doctors contracted with your insurer — cheaper for you', emoji: '✅' },
    { term: 'Prior Authorization', plain: 'Approval you must get before certain treatments or medications', emoji: '📋' },
  ],
}

export default function PolicyUploader({ onPolicyParsed }: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [step, setStep] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const analyzeText = async (text: string) => {
    setError(null)
    setIsProcessing(true)
    setStep(2)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'AI analysis failed') }
      setStep(3)
      await new Promise(r => setTimeout(r, 300))
      onPolicyParsed(await res.json())
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setIsProcessing(false)
    }
  }

  const processFile = async (file: File) => {
    setError(null)
    setIsProcessing(true)
    setStep(0)
    try {
      const formData = new FormData()
      formData.append('file', file)
      await new Promise(r => setTimeout(r, 300))
      setStep(1)
      const extractRes = await fetch('/api/extract', { method: 'POST', body: formData })
      let text = ''
      if (extractRes.ok) { const d = await extractRes.json(); text = d.text || '' }
      if (!text) text = await file.text().catch(() => '')
      if (!text || text.length < 50) throw new Error('Could not read text from this PDF. Try a text-based PDF.')
      await analyzeText(text)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
      setIsProcessing(false)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(e.type === 'dragenter' || e.type === 'dragover')
  }, [])

  return (
    <div className="max-w-2xl mx-auto space-y-7 py-6">

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-3">
        <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }} className="text-5xl">📋</motion.div>
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-100 to-blue-100 border border-violet-200 text-violet-700 text-sm font-semibold px-4 py-1.5 rounded-full">
          <Zap className="w-3.5 h-3.5 text-yellow-500" />
          Powered by Groq LLaMA · Instant Analysis
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Decode any policy in <span className="gradient-text">30 seconds</span>
        </h1>
        <p className="text-slate-500">Upload any insurance or legal policy PDF — AI turns the legalese into plain English.</p>
      </motion.div>

      {/* Processing */}
      {isProcessing && (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white border-2 border-violet-200 rounded-3xl p-10 text-center"
        >
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="text-5xl mx-auto w-fit mb-5"
          >{STEPS[step].emoji}</motion.div>
          <p className="font-bold text-slate-700 text-lg">{STEPS[step].label}</p>
          <div className="mt-4 w-56 mx-auto bg-slate-200 rounded-full h-2 overflow-hidden">
            <motion.div className={`h-2 rounded-full ${STEPS[step].color}`}
              animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <p className="text-sm text-slate-400 mt-2">Step {step + 1} of {STEPS.length}</p>
        </motion.div>
      )}

      {/* Drop zone */}
      {!isProcessing && (
        <div
          onDragEnter={handleDrag} onDragLeave={handleDrag}
          onDragOver={handleDrag} onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 cursor-pointer
            ${isDragging ? 'border-violet-400 bg-violet-50 scale-[1.02]' : 'border-slate-300 bg-white/70 hover:border-violet-300 hover:bg-violet-50/50'}`}
        >
          <input type="file" accept=".pdf,.txt"
            onChange={e => e.target.files?.[0] && processFile(e.target.files[0])}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-16 h-16 bg-gradient-to-br from-violet-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto shadow-md mb-4"
          >
            <Upload className="w-8 h-8 text-violet-500" />
          </motion.div>
          <p className="font-bold text-slate-700 text-lg">Drop your policy PDF here</p>
          <p className="text-sm text-slate-400 mt-1">or click to browse · PDF or TXT supported</p>
          <div className="flex justify-center gap-2 flex-wrap mt-4">
            {['🏥 Health', '🚗 Auto', '🏠 Home', '✈️ Travel', '⚖️ Legal'].map(tag => (
              <span key={tag} className="text-xs bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full">{tag}</span>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && !isProcessing && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex items-start gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-2xl p-4"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />{error}
        </motion.div>
      )}

      {/* Sample + divider */}
      {!isProcessing && (
        <>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
            <span className="text-sm text-slate-400 font-medium">or try a demo</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
          </div>
          <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
            onClick={() => onPolicyParsed(SAMPLE)}
            className="w-full flex items-center gap-4 p-5 bg-white border-2 border-slate-200 hover:border-violet-300 rounded-2xl hover:shadow-lg transition-all group"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="text-left flex-1">
              <p className="font-bold text-slate-800">Sample Health Insurance Policy</p>
              <p className="text-sm text-slate-400 mt-0.5">See how PolicyLens works with a real example</p>
            </div>
            <span className="text-sm text-violet-600 font-bold group-hover:translate-x-1 transition-transform">Load →</span>
          </motion.button>
        </>
      )}

      {/* Feature grid */}
      {!isProcessing && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {features.map((f, i) => (
            <motion.div key={f.label}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.07 }}
              whileHover={{ y: -4, scale: 1.03 }}
              className={`p-4 rounded-2xl border ${f.bg} ${f.border} text-center cursor-default`}
            >
              <div className="text-2xl mb-2">{f.emoji}</div>
              <p className={`text-xs font-semibold ${f.text}`}>{f.label}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
