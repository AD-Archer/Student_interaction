/**
 * Forgot password API route
 * Handles password reset requests by generating secure tokens and sending email notifications
 * Used when staff members forget their passwords and need to reset them securely
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import crypto from 'crypto'
import { sendStaffNotification } from '@/lib/email'

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

// POST /api/auth/forgot-password - Send password reset email
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400, headers: buildCorsHeaders(request) }
      )
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    // I always return success for security reasons (don't reveal if email exists)
    if (!user) {
      console.log(`Password reset requested for non-existent email: ${email}`)
      return NextResponse.json(
        { message: 'If an account with that email exists, a password reset link has been sent.' },
        { status: 200, headers: buildCorsHeaders(request) }
      )
    }

    // Check if user is active
    if (user.status === 'inactive') {
      console.log(`Password reset requested for inactive user: ${email}`)
      return NextResponse.json(
        { message: 'If an account with that email exists, a password reset link has been sent.' },
        { status: 200, headers: buildCorsHeaders(request) }
      )
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Store reset token in database
    await db.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    })

    // Send password reset email
    try {
      await sendStaffNotification({
        type: 'password-reset',
        to: user.email,
        staffName: `${user.firstName} ${user.lastName}`.trim(),
        resetToken // I'll modify the email function to handle both temporary passwords and reset tokens
      })
      console.log(`Password reset email sent to ${user.email}`)
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError)
      // I don't fail the request even if email fails - user should try again
    }

    return NextResponse.json(
      { message: 'If an account with that email exists, a password reset link has been sent.' },
      { status: 200, headers: buildCorsHeaders(request) }
    )

  } catch (error) {
    console.error('Error in forgot password:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: buildCorsHeaders(request) }
    )
  }
}
