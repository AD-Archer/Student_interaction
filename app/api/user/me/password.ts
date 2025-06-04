/**
 * POST /api/user/me/password
 * Allows the current authenticated user to change their password.
 * Expects: { currentPassword: string, newPassword: string }
 * Returns 200 on success, 400/401/500 on error.
 *
 * This route is called by the StaffManagement self-password change form.
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

function buildCorsHeaders(request: NextRequest) {
  const origin = request.headers.get('origin') || '*'
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true'
  }
}

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(null, { status: 204, headers: buildCorsHeaders(request) })
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401, headers: buildCorsHeaders(request) }
      )
    }
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number }
    const user = await db.user.findUnique({ where: { id: decoded.userId } })
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404, headers: buildCorsHeaders(request) }
      )
    }
    const { currentPassword, newPassword } = await request.json()
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current and new password required' },
        { status: 400, headers: buildCorsHeaders(request) }
      )
    }
    const isValid = await bcrypt.compare(currentPassword, user.password)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401, headers: buildCorsHeaders(request) }
      )
    }
    const hashed = await bcrypt.hash(newPassword, 10)
    await db.user.update({ where: { id: user.id }, data: { password: hashed } })
    return NextResponse.json({ success: true }, { headers: buildCorsHeaders(request) })
  } catch (error) {
    console.error('Error changing password:', error)
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500, headers: buildCorsHeaders(request) }
    )
  }
}
