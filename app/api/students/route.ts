// API route for student operations
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/students - Fetch all students
export async function GET() {
  try {
    const students = await db.student.findMany({
      orderBy: {
        firstName: 'asc'
      }
    })

    // Add "All Students" option for compatibility with frontend
    const studentsWithAll = [
      { id: "all", firstName: "All", lastName: "Students", program: "" },
      ...students
    ]

    return NextResponse.json(studentsWithAll)

  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
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
