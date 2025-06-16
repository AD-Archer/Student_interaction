import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/students/[id]/notes - Get all notes for a student
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const notes = await db.staffNote.findMany({
      where: { userId: Number(id) },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(notes)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 })
  }
}

// POST /api/students/[id]/notes - Add a new note for a student
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { author, content, priority } = await request.json()
    if (!content || !author) {
      return NextResponse.json({ error: 'Missing content or author' }, { status: 400 })
    }
    const note = await db.staffNote.create({
      data: {
        userId: Number(id),
        author,
        content,
        priority: priority || 'medium',
        timestamp: new Date().toISOString(),
      }
    })
    return NextResponse.json(note)
  } catch {
    return NextResponse.json({ error: 'Failed to add note' }, { status: 500 })
  }
}
