/**
 * Email utility for scheduled follow-up emails and staff notifications.
 * This function is used by the followup-cron API route to send emails to students and staff,
 * and by staff management to send password reset and account creation notifications.
 * Supports both development logging and production email sending via nodemailer.
 */

import nodemailer from 'nodemailer'
import type { Interaction } from './data'

interface SendFollowUpEmailOptions {
  to: string
  type: 'student' | 'staff'
  interaction: Interaction
}

interface SendStaffNotificationOptions {
  to: string
  type: 'password-reset' | 'account-created' | 'forgot-password'
  staffName: string
  temporaryPassword?: string
  resetToken?: string
  resetByName?: string
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

function buildStaffNotificationContent(options: SendStaffNotificationOptions) {
  const { type, staffName, temporaryPassword, resetByName } = options
  
  if (type === 'account-created') {
    return {
      subject: 'Welcome to Launchpad Student Services - Your Account is Ready',
      text: `Hello ${staffName},

Welcome to the Launchpad Student Services team! Your account has been created and is ready to use.

Your Login Credentials:
- Email: ${options.to}
- Temporary Password: ${temporaryPassword}

For security reasons, please log in and change your password immediately:
1. Visit the login page
2. Sign in with your credentials above
3. Go to Settings and change your password

If you have any questions or need assistance, please contact your administrator.

Best regards,
Launchpad Student Services Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 30px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Welcome to the student interaction form</h1>
            <p style="margin: 10px 0 0; opacity: 0.9; font-size: 16px;">Student Services Team</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1e293b; margin-bottom: 20px;">Hello ${staffName},</h2>
            
            <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
              Welcome to the Launchpad Student Services team! Your account has been created and is ready to use.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0;">
              <h3 style="color: #1e293b; margin-bottom: 15px;">Your Login Credentials:</h3>
              <p style="margin: 8px 0; color: #475569;"><strong>Email:</strong> ${options.to}</p>
              <p style="margin: 8px 0; color: #475569;"><strong>Temporary Password:</strong> <code style="background: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${temporaryPassword}</code></p>
            </div>
            
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #92400e; margin-bottom: 15px;">Important Security Notice:</h3>
              <p style="color: #92400e; line-height: 1.6; margin-bottom: 15px;">
                For security reasons, please log in and change your password immediately:
              </p>
              <ol style="color: #92400e; line-height: 1.6; padding-left: 20px;">
                <li>Visit the login page</li>
                <li>Sign in with your credentials above</li>
                <li>Go to Settings and change your password</li>
              </ol>
            </div>
            
            <p style="color: #475569; line-height: 1.6; margin-top: 30px;">
              If you have any questions or need assistance, please contact your administrator.
            </p>
            
            <p style="color: #475569; margin-top: 30px;">
              Best regards,<br>
              <strong>Launchpad Student Services Team</strong>
            </p>
          </div>
        </div>
      `
    }
  } else if (type === 'password-reset') {
    return {
      subject: 'Your Launchpad Password Has Been Reset',
      text: `Hello ${staffName},

Your password for the Launchpad Student Services system has been reset by ${resetByName || 'an administrator'}.

Your New Temporary Password: ${temporaryPassword}

For security reasons, please log in and change your password immediately:
1. Visit the login page
2. Sign in with your email and the temporary password above
3. Go to Settings and change your password

If you did not request this password reset or have any concerns, please contact your administrator immediately.

Best regards,
Launchpad Student Services Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 30px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Password Reset</h1>
            <p style="margin: 10px 0 0; opacity: 0.9; font-size: 16px;">Launchpad Student Services</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1e293b; margin-bottom: 20px;">Hello ${staffName},</h2>
            
            <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
              Your password for the Launchpad Student Services system has been reset by ${resetByName || 'an administrator'}.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626; margin: 20px 0;">
              <h3 style="color: #1e293b; margin-bottom: 15px;">Your New Temporary Password:</h3>
              <p style="margin: 8px 0; color: #475569; font-size: 18px; text-align: center;">
                <code style="background: #fef2f2; padding: 8px 16px; border-radius: 4px; font-family: monospace; color: #dc2626; font-weight: bold;">${temporaryPassword}</code>
              </p>
            </div>
            
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #92400e; margin-bottom: 15px;">Important Security Notice:</h3>
              <p style="color: #92400e; line-height: 1.6; margin-bottom: 15px;">
                For security reasons, please log in and change your password immediately:
              </p>
              <ol style="color: #92400e; line-height: 1.6; padding-left: 20px;">
                <li>Visit the login page</li>
                <li>Sign in with your email and the temporary password above</li>
                <li>Go to Settings and change your password</li>
              </ol>
            </div>
            
            <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #dc2626; line-height: 1.6; font-weight: 500;">
                If you did not request this password reset or have any concerns, please contact your administrator immediately.
              </p>
            </div>
            
            <p style="color: #475569; margin-top: 30px;">
              Best regards,<br>
              <strong>Launchpad Student Services Team</strong>
            </p>
          </div>
        </div>
      `
    }
  }
  
  return { subject: '', text: '', html: '' }
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

export async function sendStaffNotification(options: SendStaffNotificationOptions) {
  try {
    // If no email credentials configured, just log (useful for development)
    if (!process.env.EMAIL_FROM || !process.env.EMAIL_PASSWORD) {
      console.log(`[EMAIL] Would send ${options.type} notification to <${options.to}>`)
      console.log(`[EMAIL] Staff: ${options.staffName}`)
      if (options.temporaryPassword) {
        console.log(`[EMAIL] Temporary Password: ${options.temporaryPassword}`)
      }
      return true
    }

    // Build email content based on notification type
    const emailContent = buildStaffNotificationContent(options)
    
    // Send actual email in production
    const result = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: options.to,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
    })

    console.log(`[EMAIL] Successfully sent ${options.type} notification to <${options.to}>`)
    return result
  } catch (error) {
    console.error(`[EMAIL] Failed to send ${options.type} notification to <${options.to}>:`, error)
    throw error
  }
}
