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

// GET /api/students/[id]/notes - Get all notes for a student
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id: studentId } = params;
  try {
    const notes = await db.staffNote.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(notes)
  } catch (error) {
    console.error('Failed to fetch notes:', error)
    return NextResponse.json({ error: 'Failed to fetch notes', details: error instanceof Error ? error.message : error }, { status: 500 })
  }
}

// POST /api/students/[id]/notes - Add a new note for a student
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { id: studentId } = params;
  const user = getUserFromJWT(request)
  if (!user || typeof user !== 'object' || !('userId' in user) || !('email' in user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { author, content, priority } = await request.json()
    if (!content || !author) {
      return NextResponse.json({ error: 'Missing content or author' }, { status: 400 })
    }
    // Debug log for input values
    console.log('Creating note with:', {
      userId: Number(user.userId),
      studentId: String(studentId),
      author,
      content,
      priority: priority || 'medium',
      timestamp: new Date().toISOString(),
    })
    const note = await db.staffNote.create({
      data: {
        userId: Number(user.userId),
        studentId: String(studentId),
        author,
        content,
        priority: priority || 'medium',
        timestamp: new Date().toISOString(),
      }
    })
    return NextResponse.json(note)
  } catch (error) {
    console.error('Failed to add note:', error)
    return NextResponse.json({ error: 'Failed to add note', details: error instanceof Error ? error.message : error }, { status: 500 })
  }
}
