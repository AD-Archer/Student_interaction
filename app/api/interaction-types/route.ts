// Opt out of Edge Runtime to use Prisma Client
export const runtime = 'nodejs'

// API route for interaction types
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Build CORS headers per request to support credentials
function buildCorsHeaders(request: NextRequest) {
  const origin = request.headers.get('origin') || '*'
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true'
  }
}

// Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(null, { status: 204, headers: buildCorsHeaders(request) })
}

// GET /api/interaction-types - Fetch all available interaction types
export async function GET(request: NextRequest) {
  try {
    // Default interaction types (not persisted in DB)
    const defaultTypes = [
      { id: 'default-1', name: "Coaching | Job Readiness", isDefault: true },
      { id: 'default-2', name: "Performance Improvement Plan (PIP)", isDefault: true },
      { id: 'default-3', name: "Career Counseling", isDefault: true },
      { id: 'default-4', name: "Academic Support", isDefault: true },
      { id: 'default-5', name: "Behavioral Support", isDefault: true },
    ]
    // Fetch custom types from DB
    const customTypes = await db.interactionType.findMany({ where: { isDefault: false }, orderBy: { name: 'asc' } })
    // Merge and return
    const types = [...defaultTypes, ...customTypes]
    return NextResponse.json(types, { headers: buildCorsHeaders(request) })
  } catch (error) {
    console.error('Error fetching interaction types:', error)
    return NextResponse.json(
      { error: 'Failed to fetch interaction types' },
      { status: 500, headers: buildCorsHeaders(request) }
    )
  }
}

// POST /api/interaction-types - Add a new custom interaction type
export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json()
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400, headers: buildCorsHeaders(request) })
    }
    // Prevent duplicates
    const exists = await db.interactionType.findUnique({ where: { name } })
    if (exists) {
      return NextResponse.json({ error: 'Type already exists' }, { status: 409, headers: buildCorsHeaders(request) })
    }
    const type = await db.interactionType.create({ data: { name, isDefault: false } })
    return NextResponse.json(type, { headers: buildCorsHeaders(request) })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add interaction type' }, { status: 500, headers: buildCorsHeaders(request) })
  }
}

// DELETE /api/interaction-types/:id - Delete a custom interaction type (not default)
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400, headers: buildCorsHeaders(request) })
    }
    // Only allow deleting non-default types
    const type = await db.interactionType.findUnique({ where: { id } })
    if (!type) {
      return NextResponse.json({ error: 'Type not found' }, { status: 404, headers: buildCorsHeaders(request) })
    }
    if (type.isDefault) {
      return NextResponse.json({ error: 'Cannot delete default type' }, { status: 403, headers: buildCorsHeaders(request) })
    }
    await db.interactionType.delete({ where: { id } })
    return NextResponse.json({ success: true }, { headers: buildCorsHeaders(request) })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete interaction type' }, { status: 500, headers: buildCorsHeaders(request) })
  }
}
