// API route to check current session
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { db } from '@/lib/db'

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key'

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json(
        { user: null, authenticated: false },
        { status: 200 }
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
          { status: 200 }
        )
      }
      
      return NextResponse.json({
        user,
        authenticated: true
      })
      
    } catch {
      // Token is invalid or expired
      return NextResponse.json(
        { user: null, authenticated: false },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error('Error checking session:', error)
    return NextResponse.json(
      { error: 'Failed to check session' },
      { status: 500 }
    )
  }
}
