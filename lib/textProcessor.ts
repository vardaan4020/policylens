/**
 * Smart text processor for large policy documents.
 * Extracts the most relevant sections instead of blindly truncating.
 */

// Keywords that signal important policy content
const COVERAGE_KEYWORDS = [
  'covered', 'coverage', 'benefit', 'pays', 'reimburse', 'include',
  'eligible', 'entitled', 'provided', 'hospital', 'medical', 'treatment',
]
const EXCLUSION_KEYWORDS = [
  'not covered', 'excluded', 'exclusion', 'does not cover', 'not eligible',
  'except', 'limitation', 'limit', 'maximum', 'cap', 'waiting period',
]
const FINANCIAL_KEYWORDS = [
  'deductible', 'premium', 'copay', 'coinsurance', 'out-of-pocket',
  'maximum', 'limit', '$', 'percent', '%', 'annual', 'lifetime',
]
const SECTION_HEADERS = [
  'schedule of benefits', 'what is covered', 'what is not covered',
  'exclusions', 'limitations', 'definitions', 'general provisions',
  'covered services', 'benefits', 'eligibility', 'claims',
  'deductible', 'copayment', 'coinsurance', 'out-of-pocket',
]

/**
 * Clean raw PDF text — remove garbage characters, normalize whitespace
 */
export function cleanText(raw: string): string {
  return raw
    .replace(/\x00/g, '')                    // null bytes
    .replace(/[^\x09\x0A\x0D\x20-\x7E\u00A0-\uFFFF]/g, ' ') // non-printable
    .replace(/[ \t]{3,}/g, '  ')             // collapse long spaces
    .replace(/\n{4,}/g, '\n\n\n')            // collapse excessive newlines
    .replace(/(.)\1{6,}/g, '$1$1$1')         // collapse repeated chars (e.g. -------)
    .trim()
}

/**
 * Score a paragraph by how policy-relevant it is
 */
function scoreParagraph(para: string): number {
  const lower = para.toLowerCase()
  let score = 0

  for (const kw of COVERAGE_KEYWORDS)  if (lower.includes(kw)) score += 2
  for (const kw of EXCLUSION_KEYWORDS) if (lower.includes(kw)) score += 3
  for (const kw of FINANCIAL_KEYWORDS) if (lower.includes(kw)) score += 3
  for (const kw of SECTION_HEADERS)    if (lower.includes(kw)) score += 5

  // Bonus for dollar amounts
  const dollarMatches = para.match(/\$[\d,]+/g)
  if (dollarMatches) score += dollarMatches.length * 2

  // Bonus for percentage values
  const pctMatches = para.match(/\d+\s*%/g)
  if (pctMatches) score += pctMatches.length * 2

  // Penalise very short or very long paragraphs
  if (para.length < 30) score -= 2
  if (para.length > 2000) score -= 1

  return score
}

/**
 * Extract the most relevant content from a large policy document.
 * Returns a condensed string under targetChars.
 */
export function extractRelevantContent(text: string, targetChars = 12000): string {
  const cleaned = cleanText(text)

  // If already small enough, return as-is
  if (cleaned.length <= targetChars) return cleaned

  // Split into paragraphs
  const paragraphs = cleaned
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(p => p.length > 20)

  // Always include the first ~1500 chars (usually has policy name, type, summary)
  const header = cleaned.slice(0, 1500)

  // Score and sort remaining paragraphs
  const scored = paragraphs
    .slice(0, 300) // cap at 300 paragraphs to avoid OOM
    .map((p, i) => ({ text: p, score: scoreParagraph(p), index: i }))
    .filter(p => p.score > 0)
    .sort((a, b) => b.score - a.score)

  // Take top paragraphs up to targetChars, preserving original order
  const budget = targetChars - header.length - 500
  const selected: typeof scored = []
  let used = 0

  for (const p of scored) {
    if (used + p.text.length > budget) continue
    selected.push(p)
    used += p.text.length
  }

  // Re-sort by original position so text reads naturally
  selected.sort((a, b) => a.index - b.index)

  const body = selected.map(p => p.text).join('\n\n')

  return `${header}\n\n--- KEY SECTIONS ---\n\n${body}`
}

/**
 * Split text into chunks for multi-pass processing
 */
export function chunkText(text: string, chunkSize = 10000, overlap = 500): string[] {
  const chunks: string[] = []
  let start = 0
  while (start < text.length) {
    chunks.push(text.slice(start, start + chunkSize))
    start += chunkSize - overlap
  }
  return chunks
}
