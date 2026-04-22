'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, BookOpen, ChevronDown, ChevronUp } from 'lucide-react'
import { PolicyData, GlossaryItem } from '@/lib/types'

interface Props { policy: PolicyData }

const FALLBACK: GlossaryItem[] = [
  { term: 'Deductible',        plain: 'The amount you pay out-of-pocket before your insurance starts paying.',                                emoji: '💰' },
  { term: 'Premium',           plain: 'The monthly or annual amount you pay to keep your insurance active.',                                  emoji: '📅' },
  { term: 'Copay',             plain: 'A fixed amount you pay for a specific service, like $25 for a doctor visit.',                          emoji: '💊' },
  { term: 'Coinsurance',       plain: 'After your deductible, you split costs with the insurer — e.g. you pay 20%, they pay 80%.',            emoji: '🤝' },
  { term: 'Out-of-Pocket Max', plain: 'The most you\'ll ever pay in a year. After this, insurance covers 100%.',                             emoji: '🛡️' },
  { term: 'In-Network',        plain: 'Doctors and hospitals that have agreed to lower rates with your insurer. Cheaper for you.',            emoji: '✅' },
  { term: 'Out-of-Network',    plain: 'Providers not contracted with your insurer. Usually costs more or isn\'t covered.',                   emoji: '❌' },
  { term: 'Prior Authorization', plain: 'Approval you must get from your insurer BEFORE receiving certain treatments or medications.',        emoji: '📋' },
  { term: 'Exclusion',         plain: 'Something your policy specifically does NOT cover.',                                                   emoji: '🚫' },
  { term: 'Waiting Period',    plain: 'A time period after enrollment before certain benefits become available.',                             emoji: '⏳' },
  { term: 'Beneficiary',       plain: 'The person who receives the insurance payout if you pass away.',                                      emoji: '👤' },
  { term: 'Claim',             plain: 'A formal request to your insurer to pay for a covered expense.',                                      emoji: '📝' },
]

export default function GlossaryView({ policy }: Props) {
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  const items = policy.glossary?.length ? policy.glossary : FALLBACK

  const filtered = items.filter(g =>
    g.term.toLowerCase().includes(search.toLowerCase()) ||
    g.plain.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <span className="section-label">Plain English Definitions</span>
        <h2 className="text-2xl font-black text-slate-900 mt-1">📖 Policy Glossary</h2>
        <p className="text-slate-500 mt-1 text-sm">Every confusing term in your policy, explained simply.</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search terms..."
          className="w-full pl-11 pr-4 py-3 bg-white border-2 border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold">
            Clear
          </button>
        )}
      </div>

      {/* Count */}
      <p className="text-xs text-slate-400 font-medium">
        {filtered.length} term{filtered.length !== 1 ? 's' : ''} {search ? 'found' : 'in your policy'}
      </p>

      {/* Terms grid */}
      <div className="space-y-2">
        <AnimatePresence>
          {filtered.map((item, i) => {
            const isOpen = expanded === item.term
            return (
              <motion.div key={item.term}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-indigo-300 transition-colors"
              >
                <button
                  onClick={() => setExpanded(isOpen ? null : item.term)}
                  className="w-full flex items-center gap-3 px-5 py-4 text-left"
                >
                  <span className="text-2xl flex-shrink-0">{item.emoji}</span>
                  <span className="font-bold text-slate-900 flex-1">{item.term}</span>
                  {isOpen
                    ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  }
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-4 pt-0">
                        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                          <p className="text-sm text-indigo-900 leading-relaxed">{item.plain}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No terms match "{search}"</p>
          </div>
        )}
      </div>
    </div>
  )
}
