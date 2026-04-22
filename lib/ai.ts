/**
 * Unified AI client — Groq with smart model selection.
 * 
 * llama-3.1-8b-instant  → fast, high rate limits, good for analyze + simulate
 * llama-3.3-70b-versatile → smarter, use only for compare (less frequent)
 */
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export function extractJSON(raw: string): any {
  let s = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
  try { return JSON.parse(s) } catch {}
  const a = s.indexOf('{'); const b = s.lastIndexOf('}')
  if (a !== -1 && b > a) { try { return JSON.parse(s.slice(a, b + 1)) } catch {} }
  const match = s.match(/\{[\s\S]+\}/)
  if (match) { try { return JSON.parse(match[0]) } catch {} }
  return null
}

export async function ask(
  prompt: string,
  opts: { model?: 'fast' | 'smart'; maxTokens?: number } = {}
): Promise<string> {
  const model = opts.model === 'smart'
    ? 'llama-3.3-70b-versatile'   // for comparison (less frequent)
    : 'llama-3.1-8b-instant'      // for analyze + simulate (high volume)

  const completion = await groq.chat.completions.create({
    model,
    temperature: 0.1,
    max_tokens: opts.maxTokens || 3000,
    messages: [
      {
        role: 'system',
        content: 'You are a JSON API. Respond with ONLY a valid JSON object. No markdown, no explanation, no text before or after. Start with { end with }.',
      },
      { role: 'user', content: prompt },
    ],
  })

  return completion.choices[0].message.content || ''
}
