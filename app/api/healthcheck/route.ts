import { NextRequest, NextResponse } from 'next/server'
import { ask, extractJSON } from '@/lib/ai'
import { PolicyData } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const { policy }: { policy: PolicyData } = await req.json()

    const raw = await ask(
      `You are an expert insurance analyst. Perform a comprehensive health check on this policy and return ONLY valid JSON.

Policy: ${policy.name} (${policy.type})
Summary: ${policy.summary}
Key Facts: ${policy.keyFacts.map(f => `${f.label}: ${f.value}`).join(', ')}
Covered: ${policy.covered.map(c => `${c.title}${c.limit ? ` [${c.limit}]` : ''}`).join(', ')}
NOT Covered: ${policy.notCovered.map(e => `${e.title} [${e.severity}]`).join(', ')}
Watch Out: ${policy.watchOut.join('; ')}

Return this JSON:
{
  "overallGrade": "B",
  "overallScore": 72,
  "categories": [
    {
      "name": "Coverage Breadth",
      "score": 80,
      "emoji": "🛡️",
      "verdict": "Good",
      "details": "2 sentences explaining this category score",
      "strengths": ["specific strength 1", "specific strength 2"],
      "issues": ["specific issue 1"]
    }
  ],
  "criticalGaps": ["specific critical gap 1", "specific critical gap 2"],
  "recommendations": [
    {"priority": "high", "action": "specific action to take", "reason": "why this matters"}
  ],
  "suitableFor": ["who this policy is good for"],
  "notSuitableFor": ["who should avoid this policy"]
}

Rules:
- categories: exactly 5 items covering: Coverage Breadth, Financial Protection, Network & Access, Exclusion Risk, Value for Money
- Each category score 0-100, grade A/B/C/D/F based on overall score
- criticalGaps: 2-4 most important missing coverages
- recommendations: 4-6 items with priority high/medium/low, be specific and actionable
- suitableFor: 3-4 specific types of people
- notSuitableFor: 3-4 specific types of people
- Be specific — reference actual numbers and terms from the policy`,
      { model: 'fast', maxTokens: 2000 }
    )

    const parsed = extractJSON(raw)
    if (!parsed) throw new Error('Could not generate health check. Please try again.')
    return NextResponse.json(parsed)
  } catch (err: any) {
    console.error('[healthcheck] Error:', err.message)
    return NextResponse.json({ error: err.message || 'Health check failed' }, { status: 500 })
  }
}
