/**
 * API route for individual student operations (GET, PUT, DELETE by ID)
 * 
 * This file handles specific student operations using their ID as a path parameter.
 * It supports updating student information and could be extended for deletion if needed.
 * 
 * Future developers: This is where you'd add DELETE functionality if required.
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

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

// GET /api/students/[id] - Get specific student
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const student = await db.student.findUnique({
      where: { id: id }
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404, headers: buildCorsHeaders(request) }
      )
    }

    return NextResponse.json(student, { headers: buildCorsHeaders(request) })

  } catch (error) {
    console.error('Error fetching student:', error)
    return NextResponse.json(
      { error: 'Failed to fetch student' },
      { status: 500, headers: buildCorsHeaders(request) }
    )
  }
}

// PUT /api/students/[id] - Update student
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const data = await request.json()
    const { firstName, lastName, email, cohort } = data

    // Validate required fields
    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: 'First name and last name are required' },
        { status: 400, headers: buildCorsHeaders(request) }
      )
    }

    // Check if student exists
    const existingStudent = await db.student.findUnique({
      where: { id: id }
    })

    if (!existingStudent) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404, headers: buildCorsHeaders(request) }
      )
    }

    // Update the student
    const student = await db.student.update({
      where: { id: id },
      data: {
        firstName,
        lastName,
        email: email || null,
        cohort: cohort ? (typeof cohort === 'string' ? parseInt(cohort) : cohort) : null
      }
    })

    return NextResponse.json(student, { headers: buildCorsHeaders(request) })

  } catch (error) {
    console.error('Error updating student:', error)
    return NextResponse.json(
      { error: 'Failed to update student' },
      { status: 500, headers: buildCorsHeaders(request) }
    )
  }
}

// DELETE /api/students/[id] - Delete student (optional, for future use)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    // Check if student exists
    const existingStudent = await db.student.findUnique({
      where: { id: id }
    })

    if (!existingStudent) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404, headers: buildCorsHeaders(request) }
      )
    }

    // Delete the student
    await db.student.delete({
      where: { id: id }
    })

    return NextResponse.json(
      { message: 'Student deleted successfully' },
      { headers: buildCorsHeaders(request) }
    )

  } catch (error) {
    console.error('Error deleting student:', error)
    return NextResponse.json(
      { error: 'Failed to delete student' },
      { status: 500, headers: buildCorsHeaders(request) }
    )
  }
}
