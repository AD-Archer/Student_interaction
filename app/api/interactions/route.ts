/**
 * API route for student interactions CRUD operations
 *
 * This GET handler now uses the cohort-to-phase mapping from system settings (cohortPhaseMap)
 * to determine the correct interaction frequency for each student based on their cohort's current phase.
 * It marks interactions as overdue if the last interaction date exceeds the required interval for that phase.
 *
 * If you update cohort-phase mapping or frequency settings, this logic will always reflect the latest values.
 *
 * Note: Uses type assertions for systemSettings fields to work around Prisma type limitations. Make sure your DB and schema are up to date.
 */

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
    const { searchParams } = new URL(request.url)
    const cohort = searchParams.get('cohort')
    const followUpRequired = searchParams.get('followUpRequired')

    // Build where clause for filtering
    const where: Partial<{
      student: { cohort: number }
      followUpRequired: boolean
      followUpSent: boolean
      isArchived: boolean
    }> = {}
    if (cohort && cohort !== 'all') {
      where.student = { cohort: parseInt(cohort) }
    }
    if (followUpRequired === 'true') {
      where.followUpRequired = true
      where.followUpSent = false
      where.isArchived = false
    }

    // Fetch system settings for cohort-phase mapping and interaction frequencies
    // I cast to unknown first, then to the expected object shape to avoid Prisma type errors
    const systemSettings = await db.systemSettings.findFirst({
      orderBy: { updatedAt: 'desc' }
    }) as unknown as {
      cohortPhaseMap?: Record<string, string>
      foundationsInteractionDays?: number
      liftoffInteractionDays?: number
      lightspeedInteractionDays?: number
      program101InteractionDays?: number
      defaultInteractionDays?: number
      [key: string]: unknown
    }
    // I expect cohortPhaseMap to be a JSON object like { "1": "liftoff", "2": "101", "3": "foundations" }
    let cohortPhaseMap: Record<string, string> = {}
    if (systemSettings?.cohortPhaseMap && typeof systemSettings.cohortPhaseMap === 'object' && !Array.isArray(systemSettings.cohortPhaseMap)) {
      cohortPhaseMap = systemSettings.cohortPhaseMap as Record<string, string>
    }

    // Helper to get phase for a cohort
    const getPhaseForCohort = (cohortNum: number | null): string => {
      if (!cohortNum) return 'default'
      return cohortPhaseMap?.[cohortNum.toString()] || 'default'
    }
    // Helper to get frequency for a phase
    const getFrequencyForPhase = (phase: string): number => {
      switch (phase) {
        case 'foundations': return systemSettings?.foundationsInteractionDays || 14
        case 'liftoff': return systemSettings?.liftoffInteractionDays || 21
        case 'lightspeed': return systemSettings?.lightspeedInteractionDays || 7
        case '101': return systemSettings?.program101InteractionDays || 30
        default: return systemSettings?.defaultInteractionDays || 30
      }
    }

    // Fetch all interactions with student info
    const interactions = await db.interaction.findMany({
      where,
      select: {
        id: true,
        studentId: true,
        studentFirstName: true,
        studentLastName: true,
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
        followUpStudentEmail: true,
        followUpStaffEmail: true,
        staffMemberId: true,
        createdAt: true,
        updatedAt: true,
        isArchived: true,
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            cohort: true, // I add cohort so we can map to phase
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
      orderBy: { createdAt: 'desc' }
    })

    // For each interaction, determine if it's overdue based on cohort-phase mapping and frequency
    const today = new Date()
    const formattedInteractions = interactions.map((interaction) => {
      const cohortNum = interaction.student?.cohort || null
      const phase = getPhaseForCohort(cohortNum)
      const frequency = getFrequencyForPhase(phase)
      // Parse last interaction date (assume YYYY-MM-DD or similar)
      const lastDate = interaction.date
      let daysSince = null
      if (lastDate) {
        const last = new Date(lastDate)
        daysSince = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))
      }
      // Mark as overdue if daysSince exceeds frequency
      const isOverdue = daysSince !== null && daysSince > frequency
      return {
        id: interaction.id,
        studentName: `${interaction.studentFirstName} ${interaction.studentLastName}`,
        studentFirstName: interaction.studentFirstName,
        studentLastName: interaction.studentLastName,
        studentId: interaction.studentId,
        cohort: cohortNum,
        type: interaction.type,
        reason: interaction.reason,
        notes: interaction.notes,
        date: interaction.date,
        time: interaction.time,
        staffMember: interaction.staffMember,
        status: interaction.status,
        aiSummary: interaction.aiSummary,
        isArchived: interaction.isArchived,
        followUpDate: interaction.followUpDate,
        isOverdue,
        daysSinceLastInteraction: daysSince,
        phase,
        frequency,
        followUp: {
          required: interaction.followUpRequired,
          date: interaction.followUpDate,
          overdue: interaction.followUpOverdue,
          studentEmail: interaction.followUpStudentEmail,
          staffEmail: interaction.followUpStaffEmail
        }
      }
    })

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

    // Get the student's cohort and derive the phase/program from cohortPhaseMap
    const student = await db.student.findUnique({ where: { id: studentId } })
    let program = 'default'
    if (student && student.cohort) {
      // Fetch system settings for cohort-phase mapping
      const systemSettings = await db.systemSettings.findFirst({ orderBy: { updatedAt: 'desc' } })
      let cohortPhaseMap: Record<string, string> = {}
      if (systemSettings?.cohortPhaseMap && typeof systemSettings.cohortPhaseMap === 'object' && !Array.isArray(systemSettings.cohortPhaseMap)) {
        cohortPhaseMap = systemSettings.cohortPhaseMap as Record<string, string>
      }
      program = cohortPhaseMap[student.cohort.toString()] || 'default'
    }

    // Create the interaction, explicitly set isArchived to false by default
    const interaction = await db.interaction.create({
      data: {
        studentFirstName,
        studentLastName,
        studentId,
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
        isArchived: false, // always start unarchived
        program // set from mapping
      },
      select: {
        id: true,
        studentId: true,
        studentFirstName: true,
        studentLastName: true,
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
