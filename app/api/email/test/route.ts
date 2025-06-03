/**
 * Email Test API Route
 * Tests email functionality by sending a test email to a specified address.
 * Used by the settings page to verify email configuration.
 */

import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email address is required' },
        { status: 400 }
      )
    }

    // I create the email transporter using environment variables
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASSWORD,
      },
    })

    // I verify the connection first
    await transporter.verify()

    // I send a test email
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Launchpad Student Form - Email Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 20px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Launchpad Student Form</h1>
            <p style="margin: 10px 0 0; opacity: 0.9;">Email Configuration Test</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1e293b; margin-top: 0;">✅ Email Test Successful!</h2>
            <p style="color: #475569; line-height: 1.6;">
              Your email configuration is working correctly. The Launchpad Student Form system can now send:
            </p>
            
            <ul style="color: #475569; line-height: 1.6;">
              <li>Follow-up reminders to students</li>
              <li>Notifications to staff members</li>
              <li>System alerts and updates</li>
              <li>Automated email notifications</li>
            </ul>
            
            <div style="background: #dbeafe; border: 1px solid #93c5fd; border-radius: 6px; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #1e40af; font-size: 14px;">
                <strong>Test Details:</strong><br>
                Sent: ${new Date().toLocaleString()}<br>
                From: ${process.env.EMAIL_FROM}<br>
                To: ${email}
              </p>
            </div>
            
            <p style="color: #64748b; font-size: 12px; margin-bottom: 0;">
              This is an automated test email from the Launchpad Student Form system.
            </p>
          </div>
        </div>
      `,
      text: `
Launchpad Student Form - Email Test

✅ Email Test Successful!

Your email configuration is working correctly. The Launchpad Student Form system can now send follow-up reminders, notifications, and system alerts.

Test Details:
Sent: ${new Date().toLocaleString()}
From: ${process.env.EMAIL_FROM}
To: ${email}

This is an automated test email from the Launchpad Student Form system.
      `,
    }

    const info = await transporter.sendMail(mailOptions)

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully!',
      details: {
        messageId: info.messageId,
        recipient: email,
        timestamp: new Date().toISOString(),
      },
    })

  } catch (error) {
    console.error('Email test failed:', error)
    
    let errorMessage = 'Failed to send test email'
    if (error instanceof Error) {
      errorMessage = error.message
    }

    return NextResponse.json(
      { 
        success: false, 
        message: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
