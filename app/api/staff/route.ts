// API route for staff operations
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

// GET /api/staff - Fetch all staff members
export async function GET(request: NextRequest) {
  try {
    const staff = await db.user.findMany({
      where: {
        status: 'active'
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true,
        permissions: true,
        lastLogin: true
      },
      orderBy: {
        firstName: 'asc'
      }
    })

    // Add "All Staff" option for compatibility with frontend filters
    const staffWithAll = [
      { id: "all", firstName: "All", lastName: "Staff", email: "", role: "", status: "", permissions: [], lastLogin: null },
      ...staff
    ]

    return NextResponse.json(staffWithAll, { headers: buildCorsHeaders(request) })

  } catch (error) {
    console.error('Error fetching staff:', error)
    return NextResponse.json(
      { error: 'Failed to fetch staff' },
      { status: 500, headers: buildCorsHeaders(request) }
    )
  }
}
