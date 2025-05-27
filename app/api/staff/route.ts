// API route for staff operations
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/staff - Fetch all staff members
export async function GET() {
  try {
    const staff = await db.user.findMany({
      where: {
        status: 'active'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        permissions: true,
        lastLogin: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Add "All Staff" option for compatibility with frontend filters
    const staffWithAll = [
      { id: "all", name: "All Staff", email: "", role: "", status: "", permissions: [], lastLogin: null },
      ...staff
    ]

    return NextResponse.json(staffWithAll)

  } catch (error) {
    console.error('Error fetching staff:', error)
    return NextResponse.json(
      { error: 'Failed to fetch staff' },
      { status: 500 }
    )
  }
}
