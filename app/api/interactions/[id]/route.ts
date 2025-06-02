/**
 * API route for individual interaction operations by ID.
 * Handles GET, PUT, DELETE for dynamic [id] under /api/interactions.
 * Next.js App Router provides context.params as a Promise<{ id: string }>.
 * Future maintainers: update param extraction if App Router API evolves.
 */

// API route for individual interaction operations
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/interactions/[id] - Fetch single interaction
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await context.params
    const id = parseInt(idParam)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid interaction ID' },
        { status: 400 }
      )
    }

    const interaction = await db.interaction.findUnique({
      where: { id },
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

    if (!interaction) {
      return NextResponse.json(
        { error: 'Interaction not found' },
        { status: 404 }
      )
    }

    // Transform data to match frontend format
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

    return NextResponse.json(formattedInteraction)

  } catch (error) {
    console.error('Error fetching interaction:', error)
    return NextResponse.json(
      { error: 'Failed to fetch interaction' },
      { status: 500 }
    )
  }
}

// PUT /api/interactions/[id] - Update interaction
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await context.params
    const id = parseInt(idParam)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid interaction ID' },
        { status: 400 }
      )
    }

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
      aiSummary,
      followUp
    } = data

    // Split student name into first and last name for storage
    const [studentFirstName, ...lastNameParts] = studentName?.split(' ') || ['', '']
    const studentLastName = lastNameParts.join(' ')

    // Update the interaction
    const interaction = await db.interaction.update({
      where: { id },
      data: {
        studentFirstName,
        studentLastName,
        studentId,
        program,
        type,
        reason,
        notes,
        date,
        time,
        staffMember,
        aiSummary,
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

    return NextResponse.json(formattedInteraction)

  } catch (error) {
    console.error('Error updating interaction:', error)
    return NextResponse.json(
      { error: 'Failed to update interaction' },
      { status: 500 }
    )
  }
}

// DELETE /api/interactions/[id] - Delete interaction
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await context.params
    const id = parseInt(idParam)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid interaction ID' },
        { status: 400 }
      )
    }

    await db.interaction.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Interaction deleted successfully' })

  } catch (error) {
    console.error('Error deleting interaction:', error)
    return NextResponse.json(
      { error: 'Failed to delete interaction' },
      { status: 500 }
    )
  }
}
