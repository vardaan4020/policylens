'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Trash2, Clock, ChevronRight, Plus, BarChart2, Sparkles, GitCompare, LogOut, User } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import { PolicyData } from '@/lib/types'
import ProfilePrompt from './ProfilePrompt'

interface SavedPolicy { id: string; name: string; type: string; summary: string; created_at: number }

interface Props {
  onLoadPolicy: (policy: PolicyData) => void
  onNewPolicy: () => void
  onCompare: () => void
}

const TYPE_EMOJI: Record<string, string> = {
  health: '🏥', auto: '🚗', home: '🏠', life: '💙', travel: '✈️', other: '📋'
}

function timeAgo(ts: number) {
  const diff = Date.now() / 1000 - ts
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function Dashboard({ onLoadPolicy, onNewPolicy, onCompare }: Props) {
  const { data: session } = useSession()
  const [policies, setPolicies] = useState<SavedPolicy[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  useEffect(() => { fetchPolicies() }, [])

  const fetchPolicies = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/policies')
      if (res.ok) setPolicies(await res.json())
    } finally { setLoading(false) }
  }

  const handleLoad = async (id: string) => {
    setLoadingId(id)
    try {
      const res = await fetch(`/api/policies/${id}`)
      if (res.ok) onLoadPolicy(await res.json())
    } finally { setLoadingId(null) }
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    await fetch(`/api/policies/${id}`, { method: 'DELETE' })
    setPolicies(p => p.filter(x => x.id !== id))
    setDeleting(null)
  }

  const firstName = session?.user?.name?.split(' ')[0] || 'there'

  return (
    <div className="max-w-4xl mx-auto space-y-5 py-3">

      {/* Welcome header */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
        className="relative overflow-hidden rounded-2xl p-5 text-white"
        style={{ background: 'linear-gradient(135deg, #6d28d9 0%, #4338ca 45%, #0369a1 100%)' }}
      >
        <div className="absolute inset-0 grid-pattern opacity-10" />
        <div className="absolute top-0 right-0 w-56 h-56 bg-white/5 rounded-full -translate-y-28 translate-x-28" />
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <p className="text-white/60 text-xs font-semibold mb-1">Welcome back 👋</p>
            <h2 className="text-2xl font-black mb-1.5">{firstName}</h2>
            <p className="text-white/70 text-sm">
              {policies.length === 0
                ? 'Upload your first policy to get started.'
                : `You have ${policies.length} saved polic${policies.length === 1 ? 'y' : 'ies'}.`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.location.href = '/profile'}
              className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl transition-all font-semibold"
            >
              <User className="w-3.5 h-3.5" /> Profile
            </button>
            <button onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl transition-all font-semibold"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
          </div>
        </div>

        {/* Quick stats */}
        <div className="relative z-10 mt-4 flex gap-3">
          {[
            { label: 'Saved Policies', value: policies.length, icon: FileText },
            { label: 'Policy Types', value: new Set(policies.map(p => p.type)).size, icon: BarChart2 },
          ].map((s, i) => (
            <div key={i} className="bg-white/10 rounded-xl px-3 py-2 flex items-center gap-2">
              <s.icon className="w-3.5 h-3.5 text-white/60" />
              <div>
                <div className="text-lg font-black text-white">{s.value}</div>
                <div className="text-xs text-white/50">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Action buttons */}
      <div className="grid sm:grid-cols-2 gap-3">
        <motion.button
          whileHover={{ y:-2, scale:1.02 }} whileTap={{ scale:0.97 }}
          onClick={onNewPolicy}
          className="flex items-center gap-3 p-4 bg-white border-2 border-violet-200 hover:border-violet-400 rounded-xl shadow-sm hover:shadow-lg transition-all group"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <p className="font-black text-slate-900 text-sm">Analyze New Policy</p>
            <p className="text-xs text-slate-500 mt-0.5">Upload a PDF and get an AI summary</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 ml-auto group-hover:translate-x-1 transition-transform" />
        </motion.button>

        <motion.button
          whileHover={{ y:-2, scale:1.02 }} whileTap={{ scale:0.97 }}
          onClick={onCompare}
          className="flex items-center gap-3 p-4 bg-white border-2 border-blue-200 hover:border-blue-400 rounded-xl shadow-sm hover:shadow-lg transition-all group"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
            <GitCompare className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <p className="font-black text-slate-900 text-sm">Compare Policies</p>
            <p className="text-xs text-slate-500 mt-0.5">Side-by-side AI comparison</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 ml-auto group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </div>

      {/* Profile Prompt */}
      <ProfilePrompt />

      {/* Saved policies */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-black text-slate-900">📁 Your Saved Policies</h3>
          {policies.length > 0 && (
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-semibold">{policies.length} total</span>
          )}
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1,2,3].map(i => (
              <div key={i} className="h-16 bg-white rounded-xl border border-slate-200 shimmer" />
            ))}
          </div>
        ) : policies.length === 0 ? (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
            className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-slate-200"
          >
            <div className="text-4xl mb-3">📭</div>
            <p className="font-bold text-slate-700">No saved policies yet</p>
            <p className="text-slate-400 text-xs mt-1">Upload your first policy to see it here</p>
            <button onClick={onNewPolicy}
              className="mt-4 flex items-center gap-2 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-bold px-5 py-2 rounded-lg mx-auto text-xs shadow-lg hover:scale-105 transition-transform"
            >
              <Plus className="w-3.5 h-3.5" /> Upload Policy
            </button>
          </motion.div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {policies.map((p, i) => (
                <motion.div key={p.id}
                  initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                  exit={{ opacity:0, x:-20, height:0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-3 bg-white border border-slate-200 hover:border-violet-300 rounded-xl shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-xl flex-shrink-0">
                    {TYPE_EMOJI[p.type] || '📋'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate">{p.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{p.summary}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full capitalize font-medium">{p.type}</span>
                      <span className="text-xs text-slate-400 flex items-center gap-0.5">
                        <Clock className="w-3 h-3" />{timeAgo(p.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <motion.button
                      whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
                      onClick={() => handleLoad(p.id)}
                      disabled={loadingId === p.id}
                      className="flex items-center gap-1 text-xs bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 px-2.5 py-1.5 rounded-lg font-bold transition-all"
                    >
                      {loadingId === p.id ? (
                        <span className="w-3 h-3 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3" />
                      )}
                      Open
                    </motion.button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      disabled={deleting === p.id}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
