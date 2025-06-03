/**
 * Individual staff member API route
 * Handles PUT (update) and DELETE operations for specific staff members
 * Used by the staff management system for editing and removing staff
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

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

// PUT /api/staff/[id] - Update staff member
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await context.params
    const id = parseInt(idParam)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid staff ID' },
        { status: 400, headers: buildCorsHeaders(request) }
      )
    }

    const data = await request.json()
    const { firstName, lastName, name, email, role, permissions, isAdmin, password, resetPassword } = data

    // I handle both individual fields and combined name field
    let finalFirstName = firstName
    let finalLastName = lastName
    
    if (name && !firstName && !lastName) {
      // If only name is provided, split it
      const nameParts = name.trim().split(' ')
      finalFirstName = nameParts[0] || ''
      finalLastName = nameParts.slice(1).join(' ') || ''
    }

    // Check if staff member exists
    const existingStaff = await db.user.findUnique({
      where: { id }
    })

    if (!existingStaff) {
      return NextResponse.json(
        { error: 'Staff member not found' },
        { status: 404, headers: buildCorsHeaders(request) }
      )
    }

    // If email is being changed, check if new email already exists
    if (email && email !== existingStaff.email) {
      const emailExists = await db.user.findUnique({
        where: { email }
      })

      if (emailExists) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 409, headers: buildCorsHeaders(request) }
        )
      }
    }

    // Prepare update data
    const updateData: Partial<{
      firstName: string
      lastName: string
      email: string
      role: string
      permissions: string[]
      password: string
    }> = {}
    
    if (finalFirstName) updateData.firstName = finalFirstName
    if (finalLastName) updateData.lastName = finalLastName
    if (email) updateData.email = email
    if (role !== undefined) updateData.role = role // Allow setting empty string
    
    // Handle permissions and admin logic
    if (permissions) {
      updateData.permissions = Array.isArray(permissions) ? permissions : [permissions]
    } else if (isAdmin !== undefined) {
      // If isAdmin is specified but permissions aren't, build permissions
      const currentPermissions = existingStaff.permissions || ['read', 'write']
      let finalPermissions = currentPermissions.filter(p => p !== 'admin')
      if (isAdmin) {
        finalPermissions = [...finalPermissions, 'admin']
      }
      updateData.permissions = finalPermissions
    }
    
    // Handle password reset or new password
    if (resetPassword || password) {
      const passwordToUse = password || '@Changeme2'
      updateData.password = await bcrypt.hash(passwordToUse, 10)
    }

    // Update the staff member
    const updatedStaff = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        permissions: true,
        createdAt: true
      }
    })

    return NextResponse.json(updatedStaff, { headers: buildCorsHeaders(request) })

  } catch (error) {
    console.error('Error updating staff:', error)
    return NextResponse.json(
      { error: 'Failed to update staff member' },
      { status: 500, headers: buildCorsHeaders(request) }
    )
  }
}

// DELETE /api/staff/[id] - Delete (deactivate) staff member
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await context.params
    const id = parseInt(idParam)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid staff ID' },
        { status: 400, headers: buildCorsHeaders(request) }
      )
    }

    // Check if staff member exists
    const existingStaff = await db.user.findUnique({
      where: { id }
    })

    if (!existingStaff) {
      return NextResponse.json(
        { error: 'Staff member not found' },
        { status: 404, headers: buildCorsHeaders(request) }
      )
    }

    // I deactivate instead of hard delete to preserve data integrity
    await db.user.update({
      where: { id },
      data: { status: 'inactive' }
    })

    return NextResponse.json(
      { message: 'Staff member deactivated successfully' },
      { headers: buildCorsHeaders(request) }
    )

  } catch (error) {
    console.error('Error deleting staff:', error)
    return NextResponse.json(
      { error: 'Failed to delete staff member' },
      { status: 500, headers: buildCorsHeaders(request) }
    )
  }
}
