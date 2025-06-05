// API route for staff operations
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
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
        permissions: true,
        createdAt: true
      },
      orderBy: {
        firstName: 'asc'
      }
    })

    // Transform data to include computed name and isAdmin fields
    const transformedStaff = staff.map(member => ({
      ...member,
      name: `${member.firstName} ${member.lastName}`.trim(),
      isAdmin: member.permissions.includes('admin')
    }))

    return NextResponse.json(transformedStaff, { headers: buildCorsHeaders(request) })

  } catch (error) {
    console.error('Error fetching staff:', error)
    return NextResponse.json(
      { error: 'Failed to fetch staff' },
      { status: 500, headers: buildCorsHeaders(request) }
    )
  }
}

// POST /api/staff - Create new staff member
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const { firstName, lastName, name, email, role, permissions, isAdmin, password } = data

    // I handle both individual fields and combined name field
    let finalFirstName = firstName
    let finalLastName = lastName
    
    if (name && !firstName && !lastName) {
      // If only name is provided, split it
      const nameParts = name.trim().split(' ')
      finalFirstName = nameParts[0] || ''
      finalLastName = nameParts.slice(1).join(' ') || ''
    }

    // Validate required fields - role can be empty, password will be auto-generated
    if (!finalFirstName || !finalLastName || !email) {
      return NextResponse.json(
        { error: 'First name, last name, and email are required' },
        { status: 400, headers: buildCorsHeaders(request) }
      )
    }

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409, headers: buildCorsHeaders(request) }
      )
    }

    // Hash the password (use provided password or default)
    const finalPassword = password || '@Changeme2'
    const hashedPassword = await bcrypt.hash(finalPassword, 10)

    // Set default permissions (read and write) and handle admin
    const defaultPermissions = ['read', 'write']
    let finalPermissions = permissions && Array.isArray(permissions) && permissions.length > 0 
      ? permissions 
      : defaultPermissions
    
    // I add admin permission if isAdmin is true
    if (isAdmin && !finalPermissions.includes('admin')) {
      finalPermissions = [...finalPermissions, 'admin']
    }

    // Create the staff member
    const staff = await db.user.create({
      data: {
        firstName: finalFirstName,
        lastName: finalLastName,
        email,
        role: role || '', // Allow empty role
        permissions: finalPermissions,
        password: hashedPassword,
        status: 'active'
      },
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

    // Transform response to include computed fields
    const transformedStaff = {
      ...staff,
      name: `${staff.firstName} ${staff.lastName}`.trim(),
      isAdmin: staff.permissions.includes('admin')
    }

    // Send welcome email notification to new staff member
    try {
      await sendStaffNotification({
        to: email,
        type: 'account-created',
        staffName: `${finalFirstName} ${finalLastName}`.trim(),
        temporaryPassword: finalPassword
      })
      console.log(`Welcome email sent to new staff member: ${email}`)
    } catch (emailError) {
      // I log email errors but don't fail the account creation
      console.error('Failed to send welcome email to new staff member:', emailError)
    }

    return NextResponse.json(transformedStaff, { status: 201, headers: buildCorsHeaders(request) })

  } catch (error) {
    console.error('Error creating staff:', error)
    return NextResponse.json(
      { error: 'Failed to create staff member' },
      { status: 500, headers: buildCorsHeaders(request) }
    )
  }
}
