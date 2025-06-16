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
        type: { select: { name: true } },
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
      id: interaction.id,
      studentName: `${interaction.studentFirstName} ${interaction.studentLastName}`,
      studentId: interaction.studentId,
      program: '', // fallback since not selected from DB
      type: interaction.type?.name ?? '',
      reason: interaction.reason,
      notes: interaction.notes,
      date: interaction.date,
      time: interaction.time,
      staffMember: interaction.staffMember,
      status: interaction.status,
      followUp: {
        date: interaction.followUpDate || undefined,
        required: interaction.followUpRequired,
        sent: interaction.followUpSent,
        student: interaction.followUpStudent,
        staff: interaction.followUpStaff,
        studentEmail: interaction.followUpStudentEmail || undefined,
        staffEmail: interaction.followUpStaffEmail || undefined
      },
      aiSummary: interaction.aiSummary || '',
      isArchived: false
    }))

    let sentCount = 0
    for (const interaction of formattedInteractions) {
      // Send to student if requested and email available
      if (interaction.followUp.student && interaction.followUp.studentEmail) {
        await sendFollowUpEmail({
          to: interaction.followUp.studentEmail,
          type: 'student',
          interaction
        })
        sentCount++
      }
      
      // Send to staff if requested and email available  
      if (interaction.followUp.staff && interaction.followUp.staffEmail) {
        await sendFollowUpEmail({
          to: interaction.followUp.staffEmail,
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
