// API route for student interactions CRUD operations
// This file handles GET (fetch all) and POST (create) for student interactions.
// It ensures the archive state (isArchived) is always included in responses, so the frontend can display and update archive status.
// PATCH for archiving is handled in /api/interactions/[id]/route.ts. If you add new fields to the Interaction model, update the queries and response formatting here.
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


// GET /api/interactions - Fetch all interactions
export async function GET(request: NextRequest) {
  try {
    // I include isArchived so the frontend can show archive state
    const interactions = await db.interaction.findMany({
      select: {
        id: true,
        studentId: true,
        studentFirstName: true,
        studentLastName: true,
        program: true,
        type: true,
        reason: true,
        notes: true,
        date: true,
        time: true,
        staffMember: true,
        status: true,
        aiSummary: true,
        followUpRequired: true,
        followUpDate: true,
        followUpOverdue: true,
        followUpStudentEmail: true, // I need this for followUp.studentEmail
        followUpStaffEmail: true,   // I need this for followUp.staffEmail
        staffMemberId: true,
        createdAt: true,
        updatedAt: true,
        isArchived: true, // ensure this is always present
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            program: true,
            createdAt: true,
            updatedAt: true
          }
        },
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

    // Transform data to match current frontend format, including isArchived
    const formattedInteractions = interactions.map((interaction) => ({
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
      isArchived: interaction.isArchived, // I add this so the UI can see archive state
      followUp: {
        required: interaction.followUpRequired,
        date: interaction.followUpDate,
        overdue: interaction.followUpOverdue,
        studentEmail: interaction.followUpStudentEmail,
        staffEmail: interaction.followUpStaffEmail
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

    // Create the interaction, explicitly set isArchived to false by default
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
        followUpOverdue: followUp?.overdue || false,
        followUpStudentEmail: followUp?.studentEmail || null,
        followUpStaffEmail: followUp?.staffEmail || null,
        isArchived: false // always start unarchived
      },
      select: {
        id: true,
        studentId: true,
        studentFirstName: true,
        studentLastName: true,
        program: true,
        type: true,
        reason: true,
        notes: true,
        date: true,
        time: true,
        staffMember: true,
        status: true,
        aiSummary: true,
        followUpRequired: true,
        followUpDate: true,
        followUpOverdue: true,
        staffMemberId: true,
        createdAt: true,
        updatedAt: true,
        isArchived: true, // ensure this is always present
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            program: true,
            createdAt: true,
            updatedAt: true
          }
        },
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

    // Transform response to match frontend format, including isArchived
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
      isArchived: interaction.isArchived, // I add this so the UI can see archive state
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

// PATCH /api/interactions/:id - Archive or unarchive an interaction
// Removed: This endpoint is not needed. Use /api/interactions/[id] for PATCH requests.
