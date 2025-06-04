/**
 * Email utility for scheduled follow-up emails.
 * This function is used by the followup-cron API route to send emails to students and staff.
 * Supports both development logging and production email sending via nodemailer.
 */

import nodemailer from 'nodemailer'
import type { Interaction } from './data'

interface SendFollowUpEmailOptions {
  to: string
  type: 'student' | 'staff'
  interaction: Interaction
}

// Create transporter for Gmail SMTP
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASSWORD,
  },
})

function buildEmailContent(interaction: Interaction, recipientType: 'student' | 'staff') {
  // Build professional email template using core Interaction fields
  const recipientName = recipientType === 'student'
    ? interaction.studentName
    : interaction.staffMember

  return `Hello ${recipientName},

This is a reminder for your scheduled follow-up.

Session Details:
- Student: ${interaction.studentName}
- Program: ${interaction.program}
- Type: ${interaction.type}
- Reason: ${interaction.reason}
- Notes: ${interaction.notes}
- Follow-up Date: ${interaction.followUp.date || 'N/A'}

Best regards,
Launchpad Student Services`
}

export async function sendFollowUpEmail({ to, type, interaction }: SendFollowUpEmailOptions) {
  try {
    // If no email credentials configured, just log (useful for development)
    if (!process.env.EMAIL_FROM || !process.env.EMAIL_PASSWORD) {
      console.log(`[EMAIL] Would send follow-up to ${type} <${to}> for interaction #${interaction.id}`)
      console.log(`[EMAIL] Subject: Scheduled Follow-up Reminder`)
      console.log(`[EMAIL] Content:\n${buildEmailContent(interaction, type)}`)
      return true
    }

    // Send actual email in production
    const result = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: 'Scheduled Follow-up Reminder',
      text: buildEmailContent(interaction, type),
    })

    console.log(`[EMAIL] Successfully sent follow-up to ${type} <${to}> for interaction #${interaction.id}`)
    return result
  } catch (error) {
    console.error(`[EMAIL] Failed to send follow-up to ${type} <${to}>:`, error)
    throw error
  }
}
