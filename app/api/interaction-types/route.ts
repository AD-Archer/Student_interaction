// API route for interaction types
import { NextRequest, NextResponse } from 'next/server'

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
    // These are the standard interaction types for the system
    const interactionTypes = [
      { value: "all", label: "All Types" },
      { value: "coaching", label: "Coaching" },
      { value: "academic", label: "Academic Support" },
      { value: "career", label: "Career Counseling" },
      { value: "performance", label: "Performance Improvement" },
      { value: "behavioral", label: "Behavioral Intervention" }
    ]

    return NextResponse.json(interactionTypes, { headers: buildCorsHeaders(request) })

  } catch (error) {
    console.error('Error fetching interaction types:', error)
    return NextResponse.json(
      { error: 'Failed to fetch interaction types' },
      { status: 500, headers: buildCorsHeaders(request) }
    )
  }
}
