import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { ask, extractJSON } from '@/lib/ai'
import { PolicyData } from '@/lib/types'
import { getUserProfile } from '@/lib/db'

interface ComparisonCriteria {
  pricing?: boolean
  ageFactors?: boolean
  gender?: boolean
  location?: boolean
  familySize?: boolean
  services?: boolean
  addOns?: boolean
  claims?: boolean
  trustedBrands?: boolean
  claimScore?: boolean
  settlementScore?: boolean
  settlementRatio?: boolean
}

export async function POST(req: NextRequest) {
  try {
    const { policies, criteria }: { policies: PolicyData[]; criteria?: ComparisonCriteria | null } = await req.json()
    if (!policies || policies.length < 2) {
      return NextResponse.json({ error: 'Need at least 2 policies' }, { status: 400 })
    }

    // Get user session and profile
    const session = await getServerSession(authOptions)
    let userProfile = null
    let profileContext = ''
    
    if (session?.user) {
      const userId = (session.user as any).id
      userProfile = await getUserProfile(userId)
      
      if (userProfile) {
        profileContext = `\n\nUSER PROFILE CONTEXT - Personalize recommendations based on this information:
- Age: ${userProfile.age || 'Not specified'}
- Gender: ${userProfile.gender || 'Not specified'}
- Location: ${userProfile.location || 'Not specified'}
- Family Size: ${userProfile.familySize || 1} members
- Desired Sum Insured: ${userProfile.sumInsured || 'Not specified'}
${userProfile.familyMembers?.length > 0 ? `- Family Members: ${userProfile.familyMembers.map((m: any) => `${m.name} (${m.relationship}, ${m.age}y, ${m.gender})`).join(', ')}` : ''}
${userProfile.existingIllness?.length > 0 ? `- Pre-existing Conditions: ${userProfile.existingIllness.join(', ')}` : ''}
- Smoking: ${userProfile.smoking ? 'Yes' : 'No'}
- Drinking: ${userProfile.drinking ? 'Yes' : 'No'}
${userProfile.otherHabits ? `- Other Lifestyle Factors: ${userProfile.otherHabits}` : ''}

IMPORTANT: Use this profile to:
1. Recommend policies suitable for user's age group and family size
2. Highlight coverage relevant to their location
3. Flag policies that may exclude their pre-existing conditions
4. Consider lifestyle factors (smoking/drinking) in recommendations
5. Suggest appropriate sum insured based on their needs
6. Prioritize family-friendly policies if they have dependents`
      }
    }

    const n = policies.length
    const descriptions = policies.map((p, i) =>
      `POLICY ${i + 1} "${p.name}": ${p.simpleSummary || p.summary} | Facts: ${p.keyFacts.slice(0, 4).map(f => `${f.label}:${f.value}`).join(', ')} | Covered: ${p.covered.slice(0, 6).map(c => c.title).join(', ')} | Excluded: ${p.notCovered.slice(0, 5).map(e => e.title).join(', ')}`
    ).join('\n')

    // Build criteria-specific instructions
    let criteriaInstructions = ''
    if (criteria) {
      const selectedCriteria = Object.entries(criteria)
        .filter(([_, value]) => value === true)
        .map(([key]) => key)
      
      if (selectedCriteria.length > 0) {
        criteriaInstructions = `\n\nUSER SELECTED COMPARISON CRITERIA - Focus your analysis on these factors:
${selectedCriteria.map(c => {
  const labels: Record<string, string> = {
    pricing: '💰 Pricing - Compare premium costs, value for money, and affordability',
    ageFactors: '👥 Age-based Pricing - How age affects premiums and coverage',
    gender: '⚧ Gender Factors - Gender-specific pricing and coverage considerations',
    location: '📍 Location - Regional availability, network coverage, and location-based pricing',
    familySize: '👨‍👩‍👧‍👦 Family Size - Family coverage options, dependent coverage, and family discounts',
    services: '🏥 Services Covered - Range and depth of covered medical services',
    addOns: '⭐ Add-ons - Optional coverage add-ons and riders available',
    claims: '📋 Claims Process - Ease of filing claims, claim processing time, and customer experience',
    trustedBrands: '🏆 Trusted Brands - Brand reputation, especially HDFC and other established insurers',
    claimScore: '✅ Claim Score - Historical claim approval rates and success metrics',
    settlementScore: '📊 Settlement Score - Settlement success rate and customer satisfaction',
    settlementRatio: '📈 Settlement Ratio - Claim settlement ratio (claims paid vs claims filed)',
  }
  return `- ${labels[c] || c}`
}).join('\n')}

Create comparison categories that directly address these selected criteria. Prioritize these factors in your verdict and recommendations.`
      }
    }

    const raw = await ask(
      `Compare these ${n} insurance policies. Return JSON (all arrays must have exactly ${n} entries).

${descriptions}${profileContext}${criteriaInstructions}

JSON structure:
{"policies":["name1","name2"],"verdict":"best policy name","verdictReason":"2-3 sentences with specific reasons${userProfile ? ' considering user profile' : ''}","overallScores":[85,72],"categories":[{"category":"Deductible","emoji":"💰","values":["$500","$1200"],"winner":0,"winnerReason":"lower saves money","detail":"why this matters"}],"pros":[["pro1","pro2","pro3"],["pro1","pro2"]],"cons":[["con1","con2"],["con1","con2","con3"]],"bestFor":["who suits policy1","who suits policy2"],"worstFor":["avoid if...","avoid if..."],"coverageGaps":[["gap1","gap2"],["gap1"]],"standoutFeatures":[["feature1","feature2"],["feature1"]],"costAnalysis":["cost summary1","cost summary2"],"recommendation":"2-3 sentence final advice${userProfile ? ' personalized for this user' : ''}"}

Rules: 6-8 categories (focus on user-selected criteria if provided), 3-4 pros/cons each, all arrays exactly ${n} entries.${userProfile ? ' CRITICAL: Make recommendations highly personalized based on user profile data.' : ''}`,
      { model: 'smart', maxTokens: 3500 }
    )

    const parsed = extractJSON(raw)
    if (!parsed) throw new Error('Could not parse AI response. Please try again.')
    return NextResponse.json(parsed)
  } catch (err: any) {
    console.error('[compare] Error:', err.message)
    return NextResponse.json({ error: err.message || 'Comparison failed' }, { status: 500 })
  }
}
