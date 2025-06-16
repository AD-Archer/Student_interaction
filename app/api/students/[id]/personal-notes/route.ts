import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import type { Session } from 'next-auth'

// GET /api/students/[id]/personal-notes - Get personal notes for a student by the current staff
export async function GET() {
  const session = await getServerSession(authOptions) as Session
  if (!session || !session.user || !session.user.id || !session.user.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const note = await db.staffNote.findFirst({
      where: {
        userId: Number(session.user.id),
        content: { not: '' },
        priority: 'personal',
        timestamp: { not: '' },
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(note)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch personal note' }, { status: 500 })
  }
}

// POST /api/students/[id]/personal-notes - Save personal note for a student by the current staff
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions) as Session
  if (!session || !session.user || !session.user.id || !session.user.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { content } = await request.json()
    if (!content) {
      return NextResponse.json({ error: 'Missing content' }, { status: 400 })
    }
    const note = await db.staffNote.create({
      data: {
        userId: Number(session.user.id),
        author: session.user.email ?? 'unknown',
        content,
        priority: 'personal',
        timestamp: new Date().toISOString(),
      }
    })
    return NextResponse.json(note)
  } catch {
    return NextResponse.json({ error: 'Failed to save personal note' }, { status: 500 })
  }
}
