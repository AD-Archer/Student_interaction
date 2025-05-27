// API route for student interactions CRUD operations
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/interactions - Fetch all interactions
export async function GET(request: NextRequest) {
  try {
    const interactions = await db.interaction.findMany({
      include: {
        student: true,
        staff: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform data to match current frontend format
    const formattedInteractions = interactions.map(interaction => ({
      id: interaction.id,
      studentName: interaction.studentName,
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

    return NextResponse.json(formattedInteractions)

  } catch (error) {
    console.error('Error fetching interactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch interactions' },
      { status: 500 }
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
        studentName,
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
            name: true,
            role: true
          }
        }
      }
    })

    // Transform response to match frontend format
    const formattedInteraction = {
      id: interaction.id,
      studentName: interaction.studentName,
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

    return NextResponse.json(formattedInteraction, { status: 201 })

  } catch (error) {
    console.error('Error creating interaction:', error)
    return NextResponse.json(
      { error: 'Failed to create interaction' },
      { status: 500 }
    )
  }
}
