export interface PolicyData {
  id: string
  name: string
  type: string
  summary: string
  simpleSummary: string
  keyFacts: { label: string; value: string }[]
  covered: CoverageItem[]
  notCovered: ExclusionItem[]
  watchOut: string[]
  // ── New enriched fields ──
  coverageScore?: number          // 0-100 overall policy quality score
  readingLevel?: string           // e.g. "Grade 14 (Very Complex)"
  timeline?: TimelineItem[]       // key dates & waiting periods
  glossary?: GlossaryItem[]       // jargon terms explained
  quickTips?: string[]            // 3-5 actionable tips for this policy
  utilization?: UtilizationItem[] // complimentary benefits, NCB, checkups, etc.
  rawText?: string
}

export interface CoverageItem {
  id: string
  title: string
  description: string
  limit?: string
  emoji: string
}

export interface ExclusionItem {
  id: string
  title: string
  description: string
  severity: 'high' | 'medium' | 'low'
  emoji: string
}

export interface TimelineItem {
  id: string
  title: string
  description: string
  period: string   // e.g. "Day 1", "90 days", "Annual"
  type: 'start' | 'waiting' | 'renewal' | 'deadline' | 'benefit'
  emoji: string
}

export interface GlossaryItem {
  term: string
  plain: string    // plain English definition
  emoji: string
}

export interface UtilizationItem {
  id: string
  category: 'complimentary' | 'ncb' | 'checkup' | 'app' | 'wellness' | 'discount'
  title: string
  description: string
  value?: string           // e.g. "₹5,000 worth", "10% discount"
  howToUse: string         // step-by-step instructions
  frequency?: string       // e.g. "Annual", "Every 2 years", "Unlimited"
  emoji: string
  priority: 'high' | 'medium' | 'low'  // how important to use this
}

export interface ScenarioResult {
  isCovered: boolean
  confidence: 'high' | 'medium' | 'low'
  verdict: string
  explanation: string
  estimatedCost?: string
  relevantSections: string[]
  warnings: string[]
  tips: string[]
}

// ── Comparison types ──────────────────────────────────────
export interface ComparisonCategory {
  category: string
  emoji: string
  values: string[]        // one per policy
  winner: number | null   // 0-based index, null if tie
  winnerReason: string
  detail: string          // fuller explanation of this category
}

export interface PolicyComparison {
  policies: string[]
  verdict: string
  verdictReason: string
  overallScores: number[] // 0-100 score per policy
  categories: ComparisonCategory[]
  pros: string[][]        // pros[i] = detailed pros for policy i
  cons: string[][]        // cons[i] = detailed cons for policy i
  bestFor: string[]       // who each policy suits best
  worstFor: string[]      // who should avoid each policy
  coverageGaps: string[][]  // unique gaps per policy
  standoutFeatures: string[][] // unique strengths per policy
  costAnalysis: string[]  // cost breakdown per policy
  recommendation: string  // final paragraph recommendation
}

