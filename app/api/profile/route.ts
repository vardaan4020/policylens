import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { getUserProfile, saveUserProfile } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const profile = await getUserProfile(userId)
    
    return NextResponse.json({ profile })
  } catch (err: any) {
    console.error('[profile GET] Error:', err.message)
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { profile } = await req.json()

    if (!profile) {
      return NextResponse.json({ error: 'Profile data required' }, { status: 400 })
    }

    await saveUserProfile(userId, profile)
    
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[profile POST] Error:', err.message)
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 })
  }
}
