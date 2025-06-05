/**
 * API route for importing student data from CSV files
 * Handles parsing CSV data and creating/updating student records in the database
 * Used by the data management section in system settings
 *
 * Note: The cohort field is always parsed as an integer (or null if missing/invalid).
 * This ensures that spreadsheet quirks (extra whitespace, empty, or non-numeric values)
 * never break the import or result in bad data. See cohort parsing logic below.
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

  // Use original header for mapping, but normalize for matching
  const rawHeader = lines[0].split(',').map(h => h.trim())
  const header = rawHeader.map(h => h.toLowerCase().replace(/\s+/g, ''))
  const students: CSVStudent[] = []

  // Map columns from the user's spreadsheet
  // Required: Student Number, First Name, Last Name, Email, Cohort
  const studentIdIndex = header.findIndex(h => h === 'studentnumber' || h === 'student id' || h === 'studentid' || h === 'id')
  const firstNameIndex = header.findIndex(h => h === 'firstname' || h === 'first name')
  const lastNameIndex = header.findIndex(h => h === 'lastname' || h === 'last name')
  const emailIndex = header.findIndex(h => h === 'email' || h === 'emailaddress')
  const cohortIndex = header.findIndex(h => h === 'cohort')

  // Check for required columns
  const missingColumns = []
  if (studentIdIndex === -1) missingColumns.push('Student Number')
  if (firstNameIndex === -1) missingColumns.push('First Name')
  if (lastNameIndex === -1) missingColumns.push('Last Name')
  if (cohortIndex === -1) missingColumns.push('Cohort')
  // Email is optional, but warn if missing

  if (missingColumns.length > 0) {
    throw new Error(`Missing required columns: ${missingColumns.join(', ')}`)
  }

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/["']/g, ''))
    if (values.length < rawHeader.length) continue // Skip incomplete rows

    // Defensive cohort parsing: always trim, treat empty/non-numeric as null
    let cohortRaw = values[cohortIndex] || ''
    cohortRaw = cohortRaw.trim()
    const cohort = cohortRaw && /^\d+$/.test(cohortRaw) ? cohortRaw : ''

    const student: CSVStudent = {
      firstName: values[firstNameIndex] || '',
      lastName: values[lastNameIndex] || '',
      email: emailIndex !== -1 ? values[emailIndex] || '' : '',
      cohort: cohort, // always a string, will be parsed to int later
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
      // I want to robustly handle cohort: trim, treat empty/non-numeric as null, always store as integer or null
      let cohortNumber: number | null = null
      if (typeof student.cohort === 'string') {
        const trimmed = student.cohort.trim()
        // Only treat as a valid cohort if it's a non-empty, all-digit string
        if (/^\d+$/.test(trimmed)) {
          cohortNumber = parseInt(trimmed, 10)
        } else {
          // If cohort is empty, non-numeric, or invalid, store as null
          cohortNumber = null
        }
      }
      const email = student.email ? String(student.email) : null

      if (existingStudent) {
        // Instead of updating, skip existing students
        result.details.skipped++
        continue
      } else {
        // Create new student (do not set program)
        await prisma.student.create({
          data: {
            id: student.studentId,
            firstName: student.firstName,
            lastName: student.lastName,
            email: email,
            cohort: cohortNumber // always int or null
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
