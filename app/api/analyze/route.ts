import { NextRequest, NextResponse } from 'next/server'
import { ask, extractJSON } from '@/lib/ai'
import { cleanText, extractRelevantContent, chunkText } from '@/lib/textProcessor'

const MAX_SINGLE = 6000   // 8b model context — keep well within limits
const MAX_CHUNK  = 5500

const PROMPT = (text: string) => `Extract information from this insurance/legal policy and return a JSON object.

JSON structure required:
{
  "name": "policy title",
  "type": "health|auto|home|life|travel|other",
  "summary": "2-3 plain English sentences",
  "simpleSummary": "one sentence bottom line",
  "coverageScore": 75,
  "readingLevel": "Grade 12 (Complex)",
  "keyFacts": [{"label": "Deductible", "value": "$500"}],
  "covered": [{"id": "c1", "title": "Hospital Stays", "description": "under 20 words", "limit": "$1M", "emoji": "🏥"}],
  "notCovered": [{"id": "e1", "title": "Dental", "description": "under 20 words", "severity": "medium", "emoji": "🦷"}],
  "watchOut": ["important gotcha"],
  "quickTips": ["actionable tip"],
  "timeline": [{"id": "t1", "title": "Coverage Starts", "description": "brief", "period": "Day 1", "type": "start", "emoji": "🟢"}],
  "glossary": [{"term": "Deductible", "plain": "plain English", "emoji": "💰"}],
  "utilization": [{"id": "u1", "category": "complimentary|ncb|checkup|app|wellness|discount", "title": "Free Health Checkup", "description": "brief", "value": "₹5,000 worth", "howToUse": "step by step", "frequency": "Annual", "emoji": "🩺", "priority": "high|medium|low"}]
}

Rules: keyFacts 5-8 items, covered 6-10 items, notCovered 5-8 items, watchOut 3-5, quickTips 3-4, timeline 4-6, glossary 6-10, utilization 5-12 items.

For utilization, extract ALL complimentary benefits, no claim bonuses, free checkups, app features, wellness programs, discounts, and rewards. Mark high priority for valuable/time-sensitive benefits.

Policy text:
${text}`

async function multiPass(fullText: string): Promise<any> {
  const chunks = chunkText(fullText, MAX_CHUNK, 300)
  console.log(`[analyze] Multi-pass: ${chunks.length} chunks`)

  const results = await Promise.all(
    chunks.slice(0, 4).map(async (chunk, i) => {
      const raw = await ask(
        `Extract key facts from this policy section (part ${i + 1}). Return JSON:
{"covered":[{"title":"","description":"","limit":""}],"notCovered":[{"title":"","description":"","severity":"medium"}],"keyFacts":[{"label":"","value":""}],"notes":[""]}

Section: ${chunk}`,
        { model: 'fast', maxTokens: 1200 }
      )
      return extractJSON(raw) || {}
    })
  )

  const merged = {
    covered:    results.flatMap(r => r.covered    || []),
    notCovered: results.flatMap(r => r.notCovered || []),
    keyFacts:   results.flatMap(r => r.keyFacts   || []),
    notes:      results.flatMap(r => r.notes      || []),
  }

  const raw = await ask(
    `Synthesize these extracted insurance policy facts into a final JSON.

COVERED: ${JSON.stringify(merged.covered.slice(0, 25))}
NOT COVERED: ${JSON.stringify(merged.notCovered.slice(0, 20))}
KEY FACTS: ${JSON.stringify(merged.keyFacts.slice(0, 15))}
NOTES: ${JSON.stringify(merged.notes.slice(0, 10))}
HEADER: ${fullText.slice(0, 800)}

Return JSON with: name, type, summary, simpleSummary, coverageScore (0-100), readingLevel, keyFacts (5-8), covered (6-10 with id/title/description/limit/emoji), notCovered (5-8 with id/title/description/severity/emoji), watchOut (3-5 strings), quickTips (3-4 strings), timeline (4-6 with id/title/description/period/type/emoji), glossary (6-10 with term/plain/emoji), utilization (5-12 with id/category/title/description/value/howToUse/frequency/emoji/priority - extract complimentary benefits, NCB, checkups, app features, wellness, discounts). Deduplicate. Add emojis.`,
    { model: 'fast', maxTokens: 3000 }
  )
  return extractJSON(raw)
}

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()
    if (!text || text.trim().length < 50) {
      return NextResponse.json({ error: 'Policy text too short or empty' }, { status: 400 })
    }

    const cleaned = cleanText(text)
    console.log(`[analyze] ${cleaned.length} chars`)

    let parsed: any = null

    if (cleaned.length <= MAX_SINGLE) {
      const raw = await ask(PROMPT(cleaned), { model: 'fast', maxTokens: 3000 })
      console.log('[analyze] raw preview:', raw.slice(0, 100))
      parsed = extractJSON(raw)
    } else {
      // Smart extraction first, then single pass
      const condensed = extractRelevantContent(cleaned, MAX_SINGLE)
      console.log(`[analyze] condensed: ${condensed.length} chars`)

      if (condensed.length <= MAX_SINGLE) {
        const raw = await ask(PROMPT(condensed), { model: 'fast', maxTokens: 3000 })
        parsed = extractJSON(raw)
      } else {
        parsed = await multiPass(cleaned)
      }
    }

    if (!parsed) {
      return NextResponse.json({ error: 'Could not parse this document. Please try again.' }, { status: 500 })
    }

    parsed.id         = `policy-${Date.now()}`
    parsed.rawText    = cleaned.slice(0, 5000)
    parsed.keyFacts   = parsed.keyFacts   || []
    parsed.covered    = (parsed.covered   || []).map((c: any, i: number) => ({ ...c, id: c.id || `c${i+1}`, emoji: c.emoji || '✅' }))
    parsed.notCovered = (parsed.notCovered|| []).map((e: any, i: number) => ({ ...e, id: e.id || `e${i+1}`, emoji: e.emoji || '❌', severity: e.severity || 'medium' }))
    parsed.watchOut   = parsed.watchOut   || []
    parsed.quickTips  = parsed.quickTips  || []
    parsed.timeline   = (parsed.timeline  || []).map((t: any, i: number) => ({ ...t, id: t.id || `t${i+1}`, emoji: t.emoji || '📅' }))
    parsed.glossary   = parsed.glossary   || []
    parsed.utilization = (parsed.utilization || []).map((u: any, i: number) => ({ 
      ...u, 
      id: u.id || `u${i+1}`, 
      emoji: u.emoji || '💎',
      priority: u.priority || 'medium',
      category: u.category || 'complimentary'
    }))

    console.log(`[analyze] done — ${parsed.covered.length} covered, ${parsed.notCovered.length} excluded, ${parsed.utilization?.length || 0} utilization items`)
    return NextResponse.json(parsed)
  } catch (err: any) {
    console.error('[analyze] Error:', err.message)
    return NextResponse.json({ error: err.message || 'Analysis failed' }, { status: 500 })
  }
}
