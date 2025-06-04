// filepath: /app/api/followup-cron/route.ts
/**
 * API route for scheduled follow-up email sending.
 * This endpoint is meant to be triggered by a cron job or scheduler (e.g. daily).
 * It finds all interactions with followUpRequired=true, followUpSent=false, and followUpDate <= today,
 * sends the appropriate follow-up emails, and marks followUpSent=true.
 *
 * To use: set up a cron job or serverless scheduler to call this endpoint daily.
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendFollowUpEmail } from '@/lib/email' // You must implement this utility

export async function POST() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().slice(0, 10)
    
    // Find all interactions needing follow-up today or earlier, not yet sent
    const interactions = await db.interaction.findMany({
      where: {
        followUpRequired: true,
        followUpDate: { lte: todayStr },
        isArchived: false,
        OR: [
          { followUpStudent: true },
          { followUpStaff: true }
        ]
      },
      select: {
        id: true,
        studentFirstName: true,
        studentLastName: true,
        studentId: true,
        program: true,
        type: true,
        reason: true,
        notes: true,
        date: true,
        time: true,
        status: true,
        aiSummary: true,
        followUpDate: true,
        followUpRequired: true,
        followUpSent: true,
        followUpStudent: true,
        followUpStudentEmail: true,
        followUpStaff: true,
        followUpStaffEmail: true,
        staffMember: true
      }
    })

    const formattedInteractions = interactions.map(interaction => ({
      ...interaction,
      studentName: `${interaction.studentFirstName} ${interaction.studentLastName}`,
      followUp: {
        date: interaction.followUpDate || undefined, // Convert null to undefined
        required: interaction.followUpRequired,
        sent: interaction.followUpSent,
        student: interaction.followUpStudent,
        staff: interaction.followUpStaff,
        studentEmail: interaction.followUpStudentEmail || undefined, // Convert null to undefined
        staffEmail: interaction.followUpStaffEmail || undefined // Convert null to undefined
      },
      aiSummary: interaction.aiSummary || '' // Convert null to empty string
    }))

    let sentCount = 0
    for (const interaction of formattedInteractions) {
      // Send to student if requested and email available
      if (interaction.followUpStudent && interaction.followUpStudentEmail) {
        await sendFollowUpEmail({
          to: interaction.followUpStudentEmail,
          type: 'student',
          interaction
        })
        sentCount++
      }
      
      // Send to staff if requested and email available  
      if (interaction.followUpStaff && interaction.followUpStaffEmail) {
        await sendFollowUpEmail({
          to: interaction.followUpStaffEmail,
          type: 'staff',
          interaction
        })
        sentCount++
      }
      
      // Mark as sent
      await db.interaction.update({
        where: { id: interaction.id },
        data: { followUpSent: true }
      })
    }
    
    return NextResponse.json({ success: true, sentCount })
  } catch (error) {
    console.error('Error in follow-up cron:', error)
    return NextResponse.json({ error: 'Failed to send scheduled follow-ups' }, { status: 500 })
  }
}
