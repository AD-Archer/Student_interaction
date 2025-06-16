import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret'

function getUserFromJWT(request: NextRequest) {
  const cookie = request.headers.get('cookie') || ''
  const match = cookie.match(/auth-token=([^;]+)/)
  if (!match) return null
  try {
    return jwt.verify(match[1], JWT_SECRET)
  } catch {
    return null
  }
}

// GET /api/students/[id]/personal-notes - Get personal notes for a student by the current staff
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const user = getUserFromJWT(request)
  if (!user || typeof user !== 'object' || !('userId' in user) || !('email' in user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const note = await db.staffNote.findFirst({
      where: {
        userId: Number(user.userId),
        studentId: params.id,
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
export async function POST(request: NextRequest, context: { params: { id: string } }) {
  const user = getUserFromJWT(request)
  if (!user || typeof user !== 'object' || !('userId' in user) || !('email' in user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { content } = await request.json()
    if (!content) {
      return NextResponse.json({ error: 'Missing content' }, { status: 400 })
    }
    // Await context.params to avoid Next.js dynamic API error
    const params = await context.params
    const note = await db.staffNote.create({
      data: {
        userId: Number(user.userId),
        studentId: String(params.id),
        author: user.email ?? 'unknown',
        content,
        priority: 'personal',
        timestamp: new Date().toISOString(),
      }
    })
    return NextResponse.json(note)
  } catch (error) {
    console.error('Failed to save personal note:', error)
    return NextResponse.json({ error: 'Failed to save personal note', details: error instanceof Error ? error.message : error }, { status: 500 })
  }
}
