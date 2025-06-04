/**
 * Email Test API Route
 * Tests email functionality by sending a test email to a specified address.
 * Used by the settings page to verify email configuration and by the form to send follow-up emails.
 * Enhanced to support custom email content including notes and follow-up information.
 */

import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, to, subject, body: emailBody, from, replyTo } = body

    // I handle both the old format (email only) and new format (full email data)
    const recipientEmail = to || email
    const emailSubject = subject || 'Launchpad Student Form - Email Test'
    const fromAddress = from || process.env.EMAIL_FROM
    const replyToAddress = replyTo || process.env.EMAIL_FROM

    if (!recipientEmail) {
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

    // I create the email content based on whether custom content is provided
    let htmlContent = ''
    let textContent = ''

    if (emailBody) {
      // I format the custom email body with nice styling
      textContent = emailBody
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 20px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Launchpad Student Services</h1>
            <p style="margin: 10px 0 0; opacity: 0.9;">Student Interaction Follow-up</p>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none;">
            <div style="color: #1e293b; line-height: 1.6; white-space: pre-wrap;">${emailBody.replace(/\n/g, '<br>')}</div>
          </div>
          
          <div style="background: #f8fafc; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0; border-top: none;">
            <p style="color: #64748b; font-size: 14px; margin: 0;">
              This email was sent from the Launchpad Student Interaction Tracker system.
            </p>
          </div>
        </div>
      `
    } else {
      // I use the default test email content
      htmlContent = `
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
            
            <ul style="color: #475569; line-height: 1.8;">
              <li>Student follow-up notifications</li>
              <li>Staff reminder emails</li>
              <li>Interaction summaries</li>
              <li>System alerts</li>
            </ul>
            
            <div style="background: #dbeafe; border: 1px solid #93c5fd; border-radius: 6px; padding: 15px; margin: 20px 0;">
              <p style="color: #1e40af; margin: 0; font-weight: 500;">
                📧 Test completed at: ${new Date().toLocaleString()}
              </p>
            </div>
            
            <p style="color: #475569; font-size: 14px; margin-bottom: 0;">
              If you have any issues, please check your email configuration settings or contact system support.
            </p>
          </div>
        </div>
      `
      textContent = `Email Test Successful!\n\nYour email configuration is working correctly. Test completed at: ${new Date().toLocaleString()}`
    }

    // I send the email
    const mailOptions = {
      from: fromAddress,
      to: recipientEmail,
      replyTo: replyToAddress,
      subject: emailSubject,
      text: textContent,
      html: htmlContent,
    }

    const info = await transporter.sendMail(mailOptions)

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully!',
      details: {
        messageId: info.messageId,
        recipient: recipientEmail,
        subject: emailSubject,
        timestamp: new Date().toISOString(),
      },
    })

  } catch (error) {
    console.error('Email sending failed:', error)
    
    let errorMessage = 'Failed to send email'
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
