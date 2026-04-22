import { NextRequest, NextResponse } from 'next/server'

const PYTHON_SERVICE = process.env.PDF_SERVICE_URL || 'http://localhost:8000'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    console.log(`[extract] File: ${file.name}, size: ${(buffer.length / 1024).toFixed(1)} KB`)

    // ── Try Python service (pdfplumber) first ──────────────
    try {
      const pyForm = new FormData()
      pyForm.append('file', new Blob([buffer], { type: file.type }), file.name)

      const pyRes = await fetch(`${PYTHON_SERVICE}/extract`, {
        method: 'POST',
        body: pyForm,
        signal: AbortSignal.timeout(30000), // 30s timeout
      })

      if (pyRes.ok) {
        const data = await pyRes.json()
        console.log(`[extract] pdfplumber: ${data.chars} chars, ${data.pages} pages, ${data.tables} tables`)
        return NextResponse.json(data)
      }
    } catch (pyErr: any) {
      console.warn('[extract] Python service unavailable, falling back to pdf-parse:', pyErr.message)
    }

    // ── Fallback: pdf-parse (Node.js) ──────────────────────
    console.log('[extract] Using pdf-parse fallback')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse') as (buf: Buffer, opts?: any) => Promise<{ text: string; numpages: number }>
    const data = await pdfParse(buffer, { max: 0 }).catch((e: any) => {
      // Suppress pdf-parse internal test file errors
      if (!e.message?.includes('test/data')) throw e
      return { text: '', numpages: 0 }
    })
    const text = data.text || ''
    console.log(`[extract] pdf-parse: ${text.length} chars, ${data.numpages} pages`)
    return NextResponse.json({ text, pages: data.numpages, chars: text.length, method: 'pdf-parse' })

  } catch (err: any) {
    console.error('[extract] Error:', err.message)
    return NextResponse.json({ text: '', error: err.message })
  }
}
