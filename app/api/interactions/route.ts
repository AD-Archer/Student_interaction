// API route for student interactions CRUD operations
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

// Define the type for interaction with included relations
interface InteractionWithRelations {
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
  aiSummary: string | null
  followUpRequired: boolean
  followUpDate: string | null
  followUpOverdue: boolean
  staffMemberId: number
  createdAt: Date
  updatedAt: Date
  student: {
    id: string
    firstName: string
    lastName: string
    program: string
    createdAt: Date
    updatedAt: Date
  }
  staff: {
    id: number
    firstName: string
    lastName: string
    role: string
  }
}

// GET /api/interactions - Fetch all interactions
export async function GET(request: NextRequest) {
  try {
    const interactions = await db.interaction.findMany({
      include: {
        student: true,
        staff: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform data to match current frontend format
    const formattedInteractions = interactions.map((interaction: InteractionWithRelations) => ({
      id: interaction.id,
      studentName: `${interaction.studentFirstName} ${interaction.studentLastName}`,
      studentId: interaction.studentId,
      program: interaction.program,
      type: interaction.type,
      reason: interaction.reason,
      notes: interaction.notes,
      date: interaction.date,
      time: interaction.time,
      staffMember: interaction.staffMember,
      status: interaction.status,
      aiSummary: interaction.aiSummary,
      followUp: {
        required: interaction.followUpRequired,
        date: interaction.followUpDate,
        overdue: interaction.followUpOverdue
      }
    }))

    return NextResponse.json(formattedInteractions, { headers: buildCorsHeaders(request) })

  } catch (error) {
    console.error('Error fetching interactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch interactions' },
      { status: 500, headers: buildCorsHeaders(request) }
    )
  }
}

// POST /api/interactions - Create new interaction
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const {
      studentName,
      studentId,
      program,
      type,
      reason,
      notes,
      date,
      time,
      staffMember,
      staffMemberId,
      aiSummary,
      followUp
    } = data

    // Split student name into first and last name for storage
    const [studentFirstName, ...lastNameParts] = studentName?.split(' ') || ['', '']
    const studentLastName = lastNameParts.join(' ')

    // Validate required fields
    if (!studentName || !studentId || !type || !reason || !staffMember || !staffMemberId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create the interaction
    const interaction = await db.interaction.create({
      data: {
        studentFirstName,
        studentLastName,
        studentId,
        program: program || '',
        type,
        reason,
        notes: notes || '',
        date: date || new Date().toLocaleDateString(),
        time: time || new Date().toLocaleTimeString(),
        staffMember,
        staffMemberId: parseInt(staffMemberId),
        status: 'completed',
        aiSummary: aiSummary || null,
        followUpRequired: followUp?.required || false,
        followUpDate: followUp?.date || null,
        followUpOverdue: followUp?.overdue || false
      },
      include: {
        student: true,
        staff: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true
          }
        }
      }
    })

    // Transform response to match frontend format
    const formattedInteraction = {
      id: interaction.id,
      studentName: `${interaction.studentFirstName} ${interaction.studentLastName}`,
      studentId: interaction.studentId,
      program: interaction.program,
      type: interaction.type,
      reason: interaction.reason,
      notes: interaction.notes,
      date: interaction.date,
      time: interaction.time,
      staffMember: interaction.staffMember,
      status: interaction.status,
      aiSummary: interaction.aiSummary,
      followUp: {
        required: interaction.followUpRequired,
        date: interaction.followUpDate,
        overdue: interaction.followUpOverdue
      }
    }

    return NextResponse.json(formattedInteraction, { status: 201, headers: buildCorsHeaders(request) })

  } catch (error) {
    console.error('Error creating interaction:', error)
    return NextResponse.json(
      { error: 'Failed to create interaction' },
      { status: 500, headers: buildCorsHeaders(request) }
    )
  }
}
