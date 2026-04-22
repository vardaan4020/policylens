import { NextRequest, NextResponse } from 'next/server'
import { ask, extractJSON } from '@/lib/ai'
import { PolicyData } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const { scenario, policy }: { scenario: string; policy: PolicyData } = await req.json()

    const raw = await ask(
      `Insurance policy analysis. Given the policy and scenario below, return a JSON verdict.

Policy: ${policy.name} (${policy.type})
Covered: ${policy.covered.map(c => `${c.title}${c.limit ? ` [${c.limit}]` : ''}`).join(', ')}
NOT Covered: ${policy.notCovered.map(e => `${e.title} [${e.severity}]`).join(', ')}
Watch Out: ${policy.watchOut.slice(0, 3).join('; ')}

Scenario: "${scenario}"

Return JSON:
{"isCovered":true,"confidence":"high","verdict":"one sentence answer","explanation":"2-3 sentences with policy references","estimatedCost":"$250 copay or null","relevantSections":["section"],"warnings":["caveat"],"tips":["tip"]}`,
      { model: 'fast', maxTokens: 800 }
    )

    const parsed = extractJSON(raw)
    if (!parsed) throw new Error('Could not parse AI response. Please try again.')
    return NextResponse.json(parsed)
  } catch (err: any) {
    console.error('[simulate] Error:', err.message)
    return NextResponse.json({ error: err.message || 'Simulation failed' }, { status: 500 })
  }
}
