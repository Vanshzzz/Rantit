import { NextResponse } from 'next/server'
import { castVote, getVoteCount, getUserVote } from '@/lib/upstash'
import { getSession } from '@/lib/supabase'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const rantId = searchParams.get('rantId')
  const userId = searchParams.get('userId')

  if (!rantId) return NextResponse.json({ error: 'rantId required' }, { status: 400 })

  const count = await getVoteCount(rantId)
  const userVote = userId ? await getUserVote(rantId, userId) : null

  return NextResponse.json({ count, userVote })
}

export async function POST(req) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { rantId, direction } = await req.json()
    if (!rantId || !['up', 'down'].includes(direction)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const result = await castVote(rantId, session.user.id, direction)
    return NextResponse.json(result)
  } catch (err) {
    console.error('Vote error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
