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
    // Fetch all types from DB (both default and custom)
    const allTypes = await db.interactionType.findMany({ 
      orderBy: [
        { isDefault: 'desc' }, // Default types first
        { name: 'asc' }        // Then alphabetical
      ]
    })
    
    // If no types exist in DB, create the default ones
    if (allTypes.length === 0) {
      const defaultTypeNames = [
        "Coaching | Job Readiness",
        "Performance Improvement Plan (PIP)", 
        "Career Counseling",
        "Academic Support",
        "Behavioral Support"
      ]
      
      // Create default types in database
      for (const name of defaultTypeNames) {
        await db.interactionType.create({
          data: { name, isDefault: true }
        })
      }
      
      // Fetch them back
      const newTypes = await db.interactionType.findMany({ 
        orderBy: [
          { isDefault: 'desc' },
          { name: 'asc' }
        ]
      })
      return NextResponse.json(newTypes, { headers: buildCorsHeaders(request) })
    }
    
    return NextResponse.json(allTypes, { headers: buildCorsHeaders(request) })
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
  } catch {
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
  } catch {
    return NextResponse.json({ error: 'Failed to delete interaction type' }, { status: 500, headers: buildCorsHeaders(request) })
  }
}
