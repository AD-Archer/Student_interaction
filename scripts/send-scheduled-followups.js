#!/usr/bin/env node
/**
 * send-scheduled-followups.js
 * Node cron job script to send scheduled follow-up emails for Launchpad Student Form.
 *
 * This script should be run periodically (e.g. daily via cron) on your server.
 * It finds all interactions in the database where followUpRequired=true, followUpSent=false,
 * and followUpDate is today or earlier, sends the emails, and marks them as sent.
 *
 * Usage (add to crontab):
 *   0 7 * * * /usr/bin/node /path/to/scripts/send-scheduled-followups.js
 *
 * Requires: Node.js, Prisma Client, nodemailer, dotenv
 */

import { PrismaClient } from '@prisma/client'
import { createTransport } from 'nodemailer'
import path from 'path'
import dotenv from 'dotenv'

// I want to load environment variables from the .env file in the project root
dotenv.config({ path: path.resolve(__dirname, '../.env') })

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
  // You can customize this template as needed
  return `Hello ${recipientType === 'student' ? interaction.studentFirstName : interaction.staffMember},\n\nThis is a reminder for your scheduled follow-up.\n\nSession Details:\n- Student: ${interaction.studentFirstName} ${interaction.studentLastName}\n- Program: ${interaction.program}\n- Type: ${interaction.type}\n- Reason: ${interaction.reason}\n- Notes: ${interaction.notes}\n- Follow-up Date: ${interaction.followUpDate}\n\nBest regards,\nLaunchpad Student Services`
}

async function main() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().slice(0, 10)

  // Find all interactions needing follow-up today or earlier, not yet sent
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
    // Send to student if requested and email available
    if (interaction.followUpStudent && interaction.followUpStudentEmail) {
      await sendEmail({
        to: interaction.followUpStudentEmail,
        subject: 'Scheduled Follow-up Reminder',
        text: buildEmailContent(interaction, 'student'),
      })
      sentCount++
    }
    
    // Send to staff if requested and email available
    if (interaction.followUpStaff && interaction.followUpStaffEmail) {
      await sendEmail({
        to: interaction.followUpStaffEmail,
        subject: 'Scheduled Follow-up Reminder',
        text: buildEmailContent(interaction, 'staff'),
      })
      sentCount++
    }
    
    // Mark as sent
    await prisma.interaction.update({
      where: { id: interaction.id },
      data: { followUpSent: true },
    })
  }
  console.log(`Sent ${sentCount} follow-up emails.`)
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('Error sending scheduled follow-ups:', err)
  process.exit(1)
})
