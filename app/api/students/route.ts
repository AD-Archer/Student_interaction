// API route for student operations
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getStudentsNeedingInteraction } from '@/lib/interaction-formula'

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

// GET /api/students - Fetch all students
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cohort = searchParams.get('cohort')
    const needsInteraction = searchParams.get('needsInteraction')

    // Build where clause for filtering
    const whereClause: Record<string, unknown> = {}
    
    if (cohort && cohort !== 'all') {
      whereClause.cohort = parseInt(cohort)
    }

    const students = await db.student.findMany({
      where: whereClause,
      orderBy: {
        firstName: 'asc'
      }
    })

    // If we need students requiring interaction, use the new formula system
    if (needsInteraction === 'true') {
      const studentsNeedingInteraction = await getStudentsNeedingInteraction(whereClause)
      return NextResponse.json(studentsNeedingInteraction, { headers: buildCorsHeaders(request) })
    }

    // For the standard students list (not filtered), add "All Students" option for compatibility
    const studentsWithAll = [
      { id: "all", firstName: "All", lastName: "Students", cohort: null, program: "" },
      ...students
    ]
    return NextResponse.json(studentsWithAll, { headers: buildCorsHeaders(request) })

  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500, headers: buildCorsHeaders(request) }
    )
  }
}

// POST /api/students - Create new student
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const { id, firstName, lastName, program } = data

    // Validate required fields
    if (!id || !firstName || !lastName || !program) {
      return NextResponse.json(
        { error: 'Student ID, first name, last name, and program are required' },
        { status: 400 }
      )
    }

    // Check if student ID already exists
    const existingStudent = await db.student.findUnique({
      where: { id }
    })

    if (existingStudent) {
      return NextResponse.json(
        { error: 'Student ID already exists' },
        { status: 409 }
      )
    }

    // Create the student
    const student = await db.student.create({
      data: {
        id,
        firstName,
        lastName,
        program
      }
    })

    return NextResponse.json(student, { status: 201 })

  } catch (error) {
    console.error('Error creating student:', error)
    return NextResponse.json(
      { error: 'Failed to create student' },
      { status: 500 }
    )
  }
}
