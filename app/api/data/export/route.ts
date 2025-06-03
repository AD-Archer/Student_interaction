/**
 * API route for exporting student and interaction data
 * Handles generating CSV exports of student data and interaction data
 * Used by the data management section in system settings
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Convert students to CSV format
 */
function studentsToCSV(students: Array<{
  id: string
  firstName: string
  lastName: string
  email: string | null
  cohort: number | null
  program: string
  createdAt: Date
}>): string {
  const header = 'Student ID,First Name,Last Name,Email,Cohort,Program,Created At\n'

  const rows = students.map(student => {
    const fields = [
      student.id,
      student.firstName,
      student.lastName,
      student.email || '',
      student.cohort?.toString() || '',
      student.program,
      student.createdAt.toISOString().split('T')[0] // Date only
    ]

    // Escape fields that might contain commas
    const escapedFields = fields.map(field => 
      field.includes(',') ? `"${field}"` : field
    )

    return escapedFields.join(',')
  })

  return header + rows.join('\n')
}

/**
 * Convert interactions to CSV format
 */
function interactionsToCSV(interactions: Array<{
  id: number
  studentId: string
  studentFirstName: string
  studentLastName: string
  program: string
  type: string
  reason: string
  notes: string
  date: string
  time: string
  staffMember: string
  status: string
  createdAt: Date
}>): string {
  const header = 'Interaction ID,Student ID,Student Name,Program,Type,Reason,Notes,Date,Time,Staff Member,Status,Created At\n'
  
  const rows = interactions.map(interaction => {
    const fields = [
      interaction.id.toString(),
      interaction.studentId,
      `${interaction.studentFirstName} ${interaction.studentLastName}`,
      interaction.program,
      interaction.type,
      interaction.reason,
      interaction.notes.replace(/,/g, ';'), // Replace commas in notes
      interaction.date,
      interaction.time,
      interaction.staffMember,
      interaction.status,
      interaction.createdAt.toISOString().split('T')[0] // Date only
    ]
    
    // Escape fields that might contain commas
    const escapedFields = fields.map(field => 
      field.includes(',') ? `"${field}"` : field
    )
    
    return escapedFields.join(',')
  })
  
  return header + rows.join('\n')
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const exportType = searchParams.get('type') || 'students'

    let csvContent: string
    let filename: string

    switch (exportType) {
      case 'students':
        const students = await prisma.student.findMany({
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            cohort: true,
            program: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' }
        })
        csvContent = studentsToCSV(students)
        filename = `students-export-${new Date().toISOString().split('T')[0]}.csv`
        break

      case 'interactions':
        const interactions = await prisma.interaction.findMany({
          orderBy: { createdAt: 'desc' },
          take: 1000 // Limit to last 1000 interactions to avoid huge files
        })
        csvContent = interactionsToCSV(interactions)
        filename = `interactions-export-${new Date().toISOString().split('T')[0]}.csv`
        break

      case 'all':
        const allStudents = await prisma.student.findMany({
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            cohort: true,
            program: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' }
        })
        
        csvContent = studentsToCSV(allStudents)
        filename = `complete-export-${new Date().toISOString().split('T')[0]}.csv`
        break

      default:
        return NextResponse.json(
          { error: 'Invalid export type. Use: students, interactions, or all' },
          { status: 400 }
        )
    }

    // Return CSV file as download
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })

  } catch (error) {
    console.error('Data export error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to export data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
