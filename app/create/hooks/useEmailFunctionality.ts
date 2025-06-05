/**
 * Custom hook for managing email functionality in the form.
 * This handles sending test emails to students and staff with proper formatting
 * and includes all relevant interaction details and follow-up information.
 */

import { FormData } from "@/lib/data"
import { useAuth } from "@/components/auth-wrapper"

export function useEmailFunctionality() {
  const { user } = useAuth()

  const sendTestEmailWithNotes = async (
    email: string, 
    recipientType: 'student' | 'staff',
    formData: FormData
  ) => {
    try {
      // I use the student name from formData which comes from the database-driven StudentSelectionCard
      const studentName = formData.studentName || 'Student'
      const staffName = user ? `${user.firstName} ${user.lastName}` : "Staff Member"
      
      let emailSubject = ""
      let emailBody = ""

      if (recipientType === 'student') {
        emailSubject = `Follow-up: ${formData.interactionType || 'Interaction'} Session`
        emailBody = `Hi ${studentName.split(' ')[0]},

I hope you're doing well! This is a follow-up from our ${formData.interactionType || 'interaction'} session${formData.reason ? ` regarding ${formData.reason}` : ''}.

**Session Summary:**
${formData.notes || 'No notes available yet.'}

**Next Steps:**
${formData.followUpDate ? `We have scheduled a follow-up for ${new Date(formData.followUpDate).toLocaleDateString()}. Please let me know if you have any questions or if you need to reschedule.` : 'We will be in touch soon regarding next steps.'}

Best regards,
${staffName}
${user?.email || ''}`
      } else {
        emailSubject = `Follow-up Reminder: ${studentName}`
        emailBody = `Hi ${staffName},

This is a reminder about your scheduled follow-up with ${studentName}${formData.followUpDate ? ` on ${new Date(formData.followUpDate).toLocaleDateString()}` : ''}.

**Original Session Details:**
- Type: ${formData.interactionType || 'Not specified'}
- Student: ${studentName}
${formData.reason ? `- Reason: ${formData.reason}` : ''}

**Session Notes:**
${formData.notes || 'No notes available yet.'}

Please reach out to the student to confirm the follow-up appointment.

Best regards,
Student Services System`
      }

      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: emailSubject,
          body: emailBody,
          from: "Launchpad Student Services <noreply@launchpadphilly.org>",
          replyTo: user?.email || "support@launchpadphilly.org"
        })
      })

      if (response.ok) {
        alert(`Test email sent successfully to ${email}`)
      } else {
        alert(`Failed to send test email to ${email}`)
      }
    } catch (error) {
      console.error('Error sending test email:', error)
      alert('Error sending test email')
    }
  }

  // Show a dialog to pick which type of email to send (student or staff)
  // This is now handled in FollowUpCard, so this hook just sends the email

  const sendFollowUpEmails = async (formData: FormData, followUpStudent: boolean, followUpStaff: boolean) => {
    // send follow-up emails if date matches today
    const today = new Date()
    const todayStr = today.toISOString().slice(0, 10)
    
    if (formData.followUpDate === todayStr) {
      const recipients = [] as string[]
      if (followUpStudent && formData.studentEmail) recipients.push(formData.studentEmail)
      if (followUpStaff && formData.staffEmail) recipients.push(formData.staffEmail)
      
      // send email to each recipient
      await Promise.all(
        recipients.map(email =>
          fetch('/api/email/test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          })
        )
      )
      console.log('Follow-up emails sent to:', recipients)
    }
  }

  // Optionally, you could add a sendRealFollowUpEmail function here for real (not test) emails

  return {
    sendTestEmailWithNotes,
    sendFollowUpEmails,
    // sendRealFollowUpEmail, // implement if needed
  }
}
