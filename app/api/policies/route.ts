import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { savePolicy, getPoliciesByUser } from '@/lib/db'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id
  const policies = await getPoliciesByUser(userId)
  return NextResponse.json(policies)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id
  const { policy } = await req.json()
  const id = policy.id || randomUUID()
  await savePolicy(id, userId, policy.name, policy.type, policy.summary, policy)
  return NextResponse.json({ id, saved: true })
}
