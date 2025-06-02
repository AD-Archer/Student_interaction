// API route to check current session
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { db } from '@/lib/db'

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key'

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

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json(
        { user: null, authenticated: false },
        { status: 200, headers: buildCorsHeaders(request) }
      )
    }
    
    try {
      // Verify and decode token
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string; role: string }
      
      // Get fresh user data from database
      const user = await db.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          permissions: true,
          lastLogin: true,
        }
      })
      
      if (!user || user.status !== 'active') {
        return NextResponse.json(
          { user: null, authenticated: false },
          { status: 200, headers: buildCorsHeaders(request) }
        )
      }
      
      return NextResponse.json({
        user,
        authenticated: true
      }, { headers: buildCorsHeaders(request) })
      
    } catch {
      // Token is invalid or expired
      return NextResponse.json(
        { user: null, authenticated: false },
        { status: 200, headers: buildCorsHeaders(request) }
      )
    }
  } catch (error) {
    console.error('Error checking session:', error)
    return NextResponse.json(
      { error: 'Failed to check session' },
      { status: 500, headers: buildCorsHeaders(request) }
    )
  }
}
