/**
 * API route for importing student data from CSV files
 * Handles parsing CSV data and creating/updating student records in the database
 * Used by the data management section in system settings
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface CSVStudent {
  firstName: string
  lastName: string
  email: string
  cohort: string
  studentId: string
}

interface ImportResult {
  success: boolean
  message: string
  details: {
    totalProcessed: number
    successfulImports: number
    skipped: number
    errors: string[]
  }
}

/**
 * Parse CSV data and extract student information
 */
function parseCSV(csvText: string): CSVStudent[] {
  const lines = csvText.trim().split('\n')
  if (lines.length < 2) {
    throw new Error('CSV must contain at least a header row and one data row')
  }

  const header = lines[0].toLowerCase().split(',').map(h => h.trim())
  const students: CSVStudent[] = []

  // Check for required columns
  const requiredColumns = ['firstname', 'lastname', 'email', 'cohort', 'studentid']
  const missingColumns = requiredColumns.filter(col => {
    if (col === 'studentid') {
      // I want to match 'studentid', 'student_id', or just 'id'
      return !header.some(h =>
        h.includes('studentid') ||
        h.includes('student_id') ||
        h === 'id'
      )
    }
    return !header.some(h => h.includes(col))
  })

  if (missingColumns.length > 0) {
    throw new Error(`Missing required columns: ${missingColumns.join(', ')}`)
  }

  // Find column indices (flexible matching)
  const getColumnIndex = (variations: string[]) => {
    return header.findIndex(h => variations.some(v => h.includes(v)))
  }

  const firstNameIndex = getColumnIndex(['firstname', 'first_name', 'first name'])
  const lastNameIndex = getColumnIndex(['lastname', 'last_name', 'last name'])
  const emailIndex = getColumnIndex(['email', 'email_address'])
  const cohortIndex = getColumnIndex(['cohort', 'cohort_number'])
  const studentIdIndex = getColumnIndex(['studentid', 'student_id', 'id'])

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/["']/g, ''))
    
    if (values.length < header.length) continue // Skip incomplete rows

    const student: CSVStudent = {
      firstName: values[firstNameIndex] || '',
      lastName: values[lastNameIndex] || '',
      email: values[emailIndex] || '',
      cohort: values[cohortIndex] || '',
      studentId: values[studentIdIndex] || ''
    }

    // Validate required fields
    if (student.firstName && student.lastName && student.studentId) {
      students.push(student)
    }
  }

  return students
}

/**
 * Import students into the database
 */
async function importStudents(students: CSVStudent[]): Promise<ImportResult> {
  const result: ImportResult = {
    success: true,
    message: '',
    details: {
      totalProcessed: students.length,
      successfulImports: 0,
      skipped: 0,
      errors: []
    }
  }

  for (const student of students) {
    try {
      // Check if student already exists
      const existingStudent = await prisma.student.findUnique({
        where: { id: student.studentId }
      })

      // Ensure cohort is converted to a number and email is validated as a string
      const cohortNumber = student.cohort ? parseInt(student.cohort, 10) : null;
      const email = student.email ? String(student.email) : null;

      if (existingStudent) {
        // Update existing student
        await prisma.student.update({
          where: { id: student.studentId },
          data: {
            firstName: student.firstName,
            lastName: student.lastName,
            email: email, // Ensure email is passed as a string
            cohort: cohortNumber,
            program: 'foundations' // Default program, can be updated later
          }
        })
        result.details.successfulImports++
      } else {
        // Create new student
        await prisma.student.create({
          data: {
            id: student.studentId,
            firstName: student.firstName,
            lastName: student.lastName,
            email: email, // Ensure email is passed as a string
            cohort: cohortNumber,
            program: 'foundations' // Default program, can be updated later
          }
        })
        result.details.successfulImports++
      }
    } catch (error) {
      result.details.errors.push(
        `Failed to import ${student.firstName} ${student.lastName} (ID: ${student.studentId}): ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
    }
  }

  result.message = `Successfully imported ${result.details.successfulImports} out of ${result.details.totalProcessed} students`
  
  if (result.details.errors.length > 0) {
    result.success = result.details.errors.length < result.details.totalProcessed
  }

  return result
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      return NextResponse.json(
        { error: 'File must be a CSV file' },
        { status: 400 }
      )
    }

    const csvText = await file.text()
    const students = parseCSV(csvText)

    if (students.length === 0) {
      return NextResponse.json(
        { error: 'No valid student data found in CSV' },
        { status: 400 }
      )
    }

    const result = await importStudents(students)

    return NextResponse.json({
      ...result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Student import error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to import students',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
