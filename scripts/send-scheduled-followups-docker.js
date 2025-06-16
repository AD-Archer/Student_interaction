#!/usr/bin/env node
/**
 * send-scheduled-followups-docker.js
 * Docker cron job script to send scheduled follow-up emails for Launchpad Student Form.
 *
 * This script is intended to be run inside a Docker container with cron.
 * It loads environment variables from process.env (Docker passes them in),
 * and otherwise works identically to the main script.
 *
 * Usage: This will be called by cron inside the Docker cron service.
 */

import { PrismaClient } from '@prisma/client'
import { createTransport } from 'nodemailer'

const prisma = new PrismaClient()

// Configure nodemailer with Gmail SMTP
const transporter = createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASSWORD,
  },
})

async function sendEmail({ to, subject, text }) {
  return transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text,
  })
}

function buildEmailContent(interaction, recipientType) {
  return `Hello ${recipientType === 'student' ? interaction.studentFirstName : interaction.staffMember},\n\nThis is a reminder for your scheduled follow-up.\n\nSession Details:\n- Student: ${interaction.studentFirstName} ${interaction.studentLastName}\n- Program: ${interaction.program}\n- Type: ${interaction.type}\n- Reason: ${interaction.reason}\n- Notes: ${interaction.notes}\n- Follow-up Date: ${interaction.followUpDate}\n\nBest regards,\nLaunchpad Student Services`
}

async function main() {
  console.log("[DOCKER CRON] Starting scheduled follow-up email script...")

  // Check environment config
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT || !process.env.EMAIL_FROM || !process.env.EMAIL_PASSWORD) {
    console.error("[DOCKER CRON] ERROR: Missing required email environment variables. Check Docker env config.")
  } else {
    console.log("[DOCKER CRON] Email environment variables loaded.")
  }

  // Check Prisma client
  if (prisma) {
    console.log("[DOCKER CRON] Prisma client loaded.")
  } else {
    console.error("[DOCKER CRON] ERROR: Prisma client failed to load.")
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().slice(0, 10)

  const interactions = await prisma.interaction.findMany({
    where: {
      followUpRequired: true,
      followUpSent: false,
      followUpDate: { lte: todayStr },
      isArchived: false,
      OR: [
        { followUpStudent: true },
        { followUpStaff: true }
      ]
    },
    include: {
      student: true,
      staff: true,
    },
  })

  let sentCount = 0
  for (const interaction of interactions) {
    if (interaction.followUpStudent && interaction.followUpStudentEmail) {
      await sendEmail({
        to: interaction.followUpStudentEmail,
        subject: 'Scheduled Follow-up Reminder',
        text: buildEmailContent(interaction, 'student'),
      })
      sentCount++
    }
    if (interaction.followUpStaff && interaction.followUpStaffEmail) {
      await sendEmail({
        to: interaction.followUpStaffEmail,
        subject: 'Scheduled Follow-up Reminder',
        text: buildEmailContent(interaction, 'staff'),
      })
      sentCount++
    }
    await prisma.interaction.update({
      where: { id: interaction.id },
      data: { followUpSent: true },
    })
  }
  console.log(`[DOCKER CRON] Sent ${sentCount} follow-up emails.`)
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[DOCKER CRON] Error sending scheduled follow-ups:', err)
  process.exit(1)
})
