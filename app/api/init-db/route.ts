import { NextResponse } from 'next/server'
import { initSchema } from '@/lib/db-postgres'

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'DATABASE_URL not configured' }, { status: 500 })
    }

    await initSchema()
    return NextResponse.json({ success: true, message: 'Database schema initialized' })
  } catch (error: any) {
    console.error('Database init error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
