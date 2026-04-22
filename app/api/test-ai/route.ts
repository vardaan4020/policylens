import { NextResponse } from 'next/server'
import { ask } from '@/lib/ai'

export async function GET() {
  try {
    // Check if API key exists
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ 
        error: 'GROQ_API_KEY not found in environment variables',
        status: 'failed'
      }, { status: 500 })
    }

    // Test AI connection
    const response = await ask('Return JSON: {"test": "success", "message": "AI is working"}', { 
      model: 'fast', 
      maxTokens: 100 
    })

    return NextResponse.json({ 
      status: 'success',
      apiKeyExists: true,
      aiResponse: response,
      message: 'AI connection is working!'
    })
  } catch (error: any) {
    return NextResponse.json({ 
      status: 'failed',
      error: error.message,
      apiKeyExists: !!process.env.GROQ_API_KEY
    }, { status: 500 })
  }
}
