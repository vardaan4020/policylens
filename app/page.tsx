'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export const dynamic = 'force-dynamic'
import { AnimatePresence, motion } from 'framer-motion'
import { FileText, Sparkles, GitCompare, Home as HomeIcon, LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'
import WelcomeScreen from '@/components/WelcomeScreen'
import Dashboard from '@/components/Dashboard'
import PolicyUploader from '@/components/PolicyUploader'
import SummaryView from '@/components/SummaryView'
import DeepAnalysisView from '@/components/DeepAnalysisView'
import CompareUploader from '@/components/CompareUploader'
import CompareView from '@/components/CompareView'
import { PolicyData, PolicyComparison } from '@/lib/types'

type AppMode = 'welcome' | 'dashboard' | 'summarize' | 'compare'
type Tab = 'upload' | 'overview' | 'deep'

const tabs = [
  { id: 'upload'   as Tab, label: 'Upload',          emoji: '📤', active: 'bg-slate-100 text-slate-700 border-slate-300' },
  { id: 'overview' as Tab, label: 'Overview Summary', emoji: '✨', active: 'bg-violet-50 text-violet-700 border-violet-200' },
  { id: 'deep'     as Tab, label: 'Deep Analysis',    emoji: '🔍', active: 'bg-blue-50 text-blue-700 border-blue-200' },
]

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [mode, setMode]         = useState<AppMode>('welcome')
  const [activeTab, setActiveTab] = useState<Tab>('upload')
  const [policy, setPolicy]     = useState<PolicyData | null>(null)
  const [comparison, setComparison]           = useState<PolicyComparison | null>(null)
  const [comparedPolicies, setComparedPolicies] = useState<PolicyData[]>([])

  // Once auth resolves, decide initial screen
  useEffect(() => {
    if (status === 'authenticated') {
      if (mode === 'welcome') setMode('dashboard')
    }
  }, [status])

  const goHome = () => {
    setPolicy(null)
    setComparison(null)
    setComparedPolicies([])
    setActiveTab('upload')
    if (session) {
      setMode('dashboard')
    } else {
      setMode('welcome')
    }
  }

  const switchMode = (m: 'summarize' | 'compare') => {
    if (!session) { router.push('/login'); return }
    setPolicy(null)
    setComparison(null)
    setComparedPolicies([])
    if (m === 'summarize') {
      setMode('summarize')
      setActiveTab('upload')
    } else {
      setMode('compare')
    }
  }

  const handlePolicyParsed = async (data: PolicyData) => {
    setPolicy(data)
    setActiveTab('overview')
    setMode('summarize')
    // Auto-save to backend
    if (session) {
      await fetch('/api/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ policy: data }),
      })
    }
  }

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mesh">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center animate-pulse">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <p className="text-slate-500 text-sm font-medium">Loading PolicyLens...</p>
        </div>
      </div>
    )
  }

  // Welcome screen (not logged in)
  if (mode === 'welcome' && !session) {
    return <WelcomeScreen onGetStarted={(m) => {
      if (m === 'summarize' || m === 'compare') router.push('/login')
    }} />
  }

  const bgStyle = { background: 'linear-gradient(160deg, #f5f3ff 0%, #eff6ff 40%, #f0fdf4 100%)' }

  return (
    <div className="min-h-screen relative" style={bgStyle}>
      {/* Simple gradient orbs - no animation */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-20 left-10 w-96 h-96 bg-violet-400 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-[500px] h-[500px] bg-blue-400 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-emerald-400 rounded-full blur-3xl" />
        <div className="absolute bottom-40 right-1/4 w-72 h-72 bg-cyan-400 rounded-full blur-3xl" />
      </div>

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 glass border-b border-white/60 shadow-sm relative">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={goHome} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-slate-900 text-lg tracking-tight">
              Policy<span className="gradient-text">Lens</span>
            </span>
          </button>

          <div className="flex items-center gap-2">
            {/* Mode switcher */}
            <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
              <button onClick={() => setMode('dashboard')}
                className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                  ${mode === 'dashboard' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <HomeIcon className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Dashboard</span>
              </button>
              <button onClick={() => switchMode('summarize')}
                className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                  ${mode === 'summarize' ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Sparkles className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Analyze</span>
              </button>
              <button onClick={() => switchMode('compare')}
                className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                  ${mode === 'compare' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <GitCompare className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Compare</span>
              </button>
            </div>

            {/* User info */}
            {session && (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-xl">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-white text-xs font-black">
                    {session.user?.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-slate-700 max-w-[100px] truncate">{session.user?.name}</span>
                </div>
                <button onClick={() => signOut({ callbackUrl: '/login' })}
                  className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            {policy && mode === 'summarize' && (
              <span className="text-xs text-violet-700 bg-violet-100 border border-violet-200 px-3 py-1 rounded-full font-medium truncate max-w-[120px] hidden md:block">
                📄 {policy.name}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* ── Tab bar (summarize mode) ── */}
      {mode === 'summarize' && (
        <div className="sticky top-14 z-40 glass border-b border-white/60">
          <div className="max-w-5xl mx-auto px-4">
            <div className="flex gap-1 overflow-x-auto py-2 no-scrollbar scrollbar-hide">
              {tabs.map(tab => {
                const active = activeTab === tab.id
                const disabled = tab.id !== 'upload' && !policy
                return (
                  <button key={tab.id}
                    onClick={() => !disabled && setActiveTab(tab.id)}
                    disabled={disabled}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all border flex-shrink-0
                      ${active ? `${tab.active} shadow-sm tab-active`
                        : disabled ? 'text-slate-300 border-transparent cursor-not-allowed'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-white/60 border-transparent'}`}
                  >
                    <span>{tab.emoji}</span>{tab.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <main className="max-w-5xl mx-auto px-4 py-4 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${mode}-${activeTab}-${comparison ? 'result' : 'upload'}`}
            initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
            exit={{ opacity:0, y:-10 }} transition={{ duration:0.2 }}
          >
            {mode === 'dashboard' && (
              <Dashboard
                onLoadPolicy={data => { setPolicy(data); setActiveTab('overview'); setMode('summarize') }}
                onNewPolicy={() => { setMode('summarize'); setActiveTab('upload'); setPolicy(null) }}
                onCompare={() => switchMode('compare')}
              />
            )}

            {mode === 'summarize' && (
              <>
                {activeTab === 'upload' && <PolicyUploader onPolicyParsed={handlePolicyParsed} />}
                {activeTab === 'overview' && policy && <SummaryView policy={policy} onNavigate={setActiveTab} />}
                {activeTab === 'deep' && policy && <DeepAnalysisView policy={policy} />}
              </>
            )}

            {mode === 'compare' && (
              <>
                {!comparison && (
                  <CompareUploader onComparisonReady={(result, policies) => {
                    setComparison(result); setComparedPolicies(policies)
                  }} />
                )}
                {comparison && (
                  <CompareView result={comparison} policies={comparedPolicies}
                    onReset={() => { setComparison(null); setComparedPolicies([]) }}
                  />
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
