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
import { db } from '@/lib/db'

// Helper to fetch the latest cohortPhaseMap from system settings
async function getCohortPhaseMap(): Promise<Record<string, string>> {
  const systemSettings = await db.systemSettings.findFirst({ orderBy: { updatedAt: 'desc' } })
  if (systemSettings?.cohortPhaseMap && typeof systemSettings.cohortPhaseMap === 'object' && !Array.isArray(systemSettings.cohortPhaseMap)) {
    return systemSettings.cohortPhaseMap as Record<string, string>
  }
  return {}
}

const prisma = new PrismaClient()

interface CSVStudent {
  firstName: string
  lastName: string
  email: string
  launchpadEmail?: string
  altSchoolEmail?: string
  personalEmail?: string
  phone?: string
  cohort: string
  studentId: string
  meta?: Record<string, any>
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
 * Splits a CSV line into fields, respecting quoted entries that may contain commas
 */
function splitCSVLine(line: string): string[] {
  const fields: string[] = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      fields.push(field)
      field = ''
    } else {
      field += char
    }
  }
  fields.push(field)
  return fields
}

/**
 * Parse CSV data and extract student information
 */
function parseCSV(csvText: string): CSVStudent[] {
  const lines = csvText.trim().split('\n')
  if (lines.length < 2) {
    throw new Error('CSV must contain at least a header row and one data row')
  }

  const rawHeader = splitCSVLine(lines[0]).map(h => h.trim())
  const header = rawHeader.map(h => h.toLowerCase().replace(/\s+/g, ''))
  const students: CSVStudent[] = []

  // Map columns from the user's spreadsheet
  // Required: Student Number, First Name, Last Name, Email, Cohort
  const studentIdIndex = header.findIndex(h => h === 'studentnumber' || h === 'studentid' || h === 'student id' || h === 'id')
  const firstNameIndex = header.findIndex(h => h === 'firstname' || h === 'first name')
  const lastNameIndex = header.findIndex(h => h === 'lastname' || h === 'last name')
  const emailIndex = header.findIndex(h => h === 'email' || h === 'emailaddress')
  // More robust cohort header matching
  const cohortIndex = header.findIndex(h =>
    h === 'cohort' ||
    h === 'cohortnumber' ||
    h === 'cohort#' ||
    h === 'cohortid' ||
    h === 'cohort_id' ||
    h === 'cohort id' ||
    h === 'cohortnum' ||
    h === 'cohortno' ||
    h === 'cohortnumber#' ||
    h === 'cohortnum#'
  )

  // If no cohort header found, fallback to 9th column (index 9) for Launchpad exports
  let fallbackCohortIndex = -1
  if (cohortIndex === -1) {
    // In your CSV, Cohort is always the 10th column (index 9)
    fallbackCohortIndex = 9
  }

  // Check for required columns
  const missingColumns = []
  if (studentIdIndex === -1) missingColumns.push('Student Number')
  if (firstNameIndex === -1) missingColumns.push('First Name')
  if (lastNameIndex === -1) missingColumns.push('Last Name')
  if (cohortIndex === -1 && fallbackCohortIndex === -1) missingColumns.push('Cohort')
  // Email is optional, but warn if missing

  if (missingColumns.length > 0) {
    throw new Error(`Missing required columns: ${missingColumns.join(', ')}`)
  }

  // Add new field indices
  const launchpadEmailIndex = header.findIndex(h => h === 'launchpademail' || h === 'launchpad email')
  const altSchoolEmailIndex = header.findIndex(h => h === 'altschoolemail' || h === 'alternative school email' || h === 'alt school email')
  const personalEmailIndex = header.findIndex(h => h === 'personalemail' || h === 'personal email')
  const phoneIndex = header.findIndex(h => h === 'phone' || h === 'phonenumber' || h === 'phone number')

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    // Use CSV-aware splitting for data rows
    let values = splitCSVLine(lines[i]).map(v => v.trim().replace(/['"]/g, ''))
    // Pad values array to at least the fallback cohort index if needed
    if (values.length <= Math.max(rawHeader.length, fallbackCohortIndex + 1)) {
      const oldLen = values.length
      values = values.concat(Array(Math.max(rawHeader.length, fallbackCohortIndex + 1) - values.length).fill(''))
      console.log(`[IMPORT] Row ${i} padded: original length ${oldLen}, padded to ${values.length}`)
    }
    // Defensive cohort parsing: always trim, treat empty/non-numeric as null
    let cohortRaw = ''
    if (cohortIndex !== -1) {
      cohortRaw = values[cohortIndex] || ''
    } else if (fallbackCohortIndex !== -1) {
      cohortRaw = values[fallbackCohortIndex] || ''
    }
    cohortRaw = cohortRaw.trim()
    const cohort = cohortRaw

    // Build meta with all extra fields
    const knownIndexes = [studentIdIndex, firstNameIndex, lastNameIndex, emailIndex, launchpadEmailIndex, altSchoolEmailIndex, personalEmailIndex, phoneIndex, cohortIndex, fallbackCohortIndex]
    const meta: Record<string, any> = {}
    for (let j = 0; j < values.length; j++) {
      if (!knownIndexes.includes(j) && rawHeader[j]) {
        const key = rawHeader[j].toLowerCase()
        const val = values[j]
        // Filter out SSN fields by key or value
        if (
          key.includes('ssn') ||
          key.includes('socialsecurity') ||
          isLikelySSN(val)
        ) {
          continue
        }
        meta[rawHeader[j]] = val
      }
    }

    // Placeholder function for checking if a value is likely an SSN
    function isLikelySSN(value: string): boolean {
      // Matches patterns like 123-45-6789 or 123456789
      return /^(\d{3}-?\d{2}-?\d{4})$/.test(value)
    }

    const student: CSVStudent = {
      firstName: values[firstNameIndex] || '',
      lastName: values[lastNameIndex] || '',
      email: emailIndex !== -1 ? values[emailIndex] || '' : '',
      launchpadEmail: launchpadEmailIndex !== -1 ? values[launchpadEmailIndex] || '' : undefined,
      altSchoolEmail: altSchoolEmailIndex !== -1 ? values[altSchoolEmailIndex] || '' : undefined,
      personalEmail: personalEmailIndex !== -1 ? values[personalEmailIndex] || '' : undefined,
      phone: phoneIndex !== -1 ? values[phoneIndex] || '' : undefined,
      cohort: cohort,
      studentId: values[studentIdIndex] || '',
      meta: Object.keys(meta).length > 0 ? meta : undefined
    }
    // Validate required fields
    if (student.firstName && student.lastName && student.studentId) {
      students.push(student)
    }
  }
  console.log(`[IMPORT] Parsed students:`, students)
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

  // Fetch cohortPhaseMap once for this import
  const cohortPhaseMap = await getCohortPhaseMap()
  // Invert mapping: phase -> cohortNum to phaseLabel (case-insensitive) -> cohortNum
  const phaseToCohort: Record<string, string> = {}
  for (const [phase, cohortNum] of Object.entries(cohortPhaseMap)) {
    phaseToCohort[phase.toLowerCase()] = cohortNum
  }

  for (const student of students) {
    try {
      // Check if student already exists
      const existingStudent = await prisma.student.findUnique({
        where: { id: student.studentId }
      })

      // Always robustly parse cohort: treat empty/non-numeric as null, else store as integer
      let cohortNumber: number | null = null
      const cohortRaw = typeof student.cohort === 'string' ? student.cohort.trim() : ''
      let resolvedCohort = cohortRaw
      if (/^\d+$/.test(cohortRaw)) {
        cohortNumber = parseInt(cohortRaw, 10)
      } else if (cohortRaw) {
        // Try to resolve phase label to cohort number using mapping
        const mapped = phaseToCohort[cohortRaw.toLowerCase()]
        if (mapped && /^\d+$/.test(mapped)) {
          cohortNumber = parseInt(mapped, 10)
          resolvedCohort = mapped
        } else {
          cohortNumber = null
        }
      }
      const email = student.email ? String(student.email) : null
      const updateData: any = {
        firstName: student.firstName,
        lastName: student.lastName,
        email: email,
        launchpadEmail: student.launchpadEmail !== undefined ? student.launchpadEmail : null,
        altSchoolEmail: student.altSchoolEmail !== undefined ? student.altSchoolEmail : null,
        personalEmail: student.personalEmail !== undefined ? student.personalEmail : null,
        phone: student.phone || null,
        cohort: cohortNumber,
        meta: student.meta || null
      }
      if (existingStudent) {
        await prisma.student.update({
          where: { id: student.studentId },
          data: updateData
        })
        result.details.successfulImports++
      } else {
        await prisma.student.create({
          data: {
            id: student.studentId,
            ...updateData
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
      console.error(`[IMPORT] Error importing student:`, error)
    }
  }

  result.message = `Successfully imported ${result.details.successfulImports} out of ${result.details.totalProcessed} students`
  
  if (result.details.errors.length > 0) {
    result.success = result.details.errors.length < result.details.totalProcessed
  }

  console.log(`[IMPORT] Import result:`, result)
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
