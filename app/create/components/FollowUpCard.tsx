/**
 * FollowUpCard component manages follow-up scheduling and email recipient selection.
 * Handles both student and staff follow-up options, including test email functionality
 * that uses the actual notes and follow-up information in the email content.
 *
 * Now uses student email from formData instead of hardcoded student data.
 * The student email is properly populated by StudentSelectionCard from database data.
 */

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { User, Send, CalendarDays } from "lucide-react"
import { FormData } from "@/lib/data"
import { useEmailFunctionality } from "../hooks/useEmailFunctionality"

interface FollowUpCardProps {
  formData: FormData
  onFormDataChange: (updates: Partial<FormData>) => void
  followUpStudent: boolean
  followUpStaff: boolean
  onFollowUpStudentChange: (checked: boolean) => void
  onFollowUpStaffChange: (checked: boolean) => void
}

export function FollowUpCard({
  formData,
  onFormDataChange,
  followUpStudent,
  followUpStaff,
  onFollowUpStudentChange,
  onFollowUpStaffChange
}: FollowUpCardProps) {
  const { sendTestEmailWithNotes } = useEmailFunctionality()
  const [feedback, setFeedback] = useState<string | null>(null)
  const [loading, setLoading] = useState<'student' | 'staff' | 'both' | false>(false)
  
  // I use the student email from formData which is populated by StudentSelectionCard from the database
  const studentEmail = formData.studentEmail || ""

  const handleFollowUpDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFormDataChange({ followUpDate: e.target.value })
  }
  const handleStaffEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFormDataChange({ staffEmail: e.target.value })
  }

  // Send follow-up to selected recipients
  const handleSendFollowUp = async () => {
    setFeedback(null)
    const sentTo: string[] = []
    setLoading(
      followUpStudent && followUpStaff ? 'both' : followUpStudent ? 'student' : 'staff'
    )
    try {
      if (followUpStudent && studentEmail) {
        await sendTestEmailWithNotes(studentEmail, 'student', formData)
        sentTo.push('student')
      }
      if (followUpStaff && formData.staffEmail) {
        await sendTestEmailWithNotes(formData.staffEmail, 'staff', formData)
        sentTo.push('staff')
      }
      if (sentTo.length === 0) {
        setFeedback('No valid email address for selected recipients.')
      } else {
        setFeedback(`Follow-up email sent to: ${sentTo.join(' and ')}`)
      }
    } catch {
      setFeedback('Failed to send follow-up email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="shadow-md border-green-100 bg-white/80">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-green-600" />
          <CardTitle className="text-lg">Follow-up</CardTitle>
        </div>
      </CardHeader>
      <hr className="my-2 border-gray-200" />
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="followUpStudent"
              checked={followUpStudent}
              onChange={e => onFollowUpStudentChange(e.target.checked)}
            />
            <Label htmlFor="followUpStudent" className="text-sm sm:text-base">
              Schedule follow-up email with student
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="followUpStaff"
              checked={followUpStaff}
              onChange={e => onFollowUpStaffChange(e.target.checked)}
            />
            <Label htmlFor="followUpStaff" className="text-sm sm:text-base">
              Schedule follow-up email with staff
            </Label>
          </div>
        </div>
        {(followUpStudent || followUpStaff) && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="followUpDate">Follow-up Date</Label>
              <Input
                id="followUpDate"
                type="date"
                value={formData.followUpDate}
                onChange={handleFollowUpDateChange}
              />
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-medium">Email Recipients</Label>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                {followUpStudent && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Student:</span>
                      <span className="text-sm text-gray-700">
                        {studentEmail || "No email address available"}
                      </span>
                    </div>
                    {studentEmail && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => sendTestEmailWithNotes(studentEmail, 'student', formData)}
                        disabled={loading === 'student' || loading === 'both'}
                      >
                        <Send className="h-3 w-3 mr-1" />
                        Test Email
                      </Button>
                    )}
                  </div>
                )}
                {followUpStaff && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Staff:</span>
                      <Input
                        placeholder="Staff email"
                        value={formData.staffEmail}
                        onChange={handleStaffEmailChange}
                        className="flex-1 max-w-xs text-sm"
                      />
                    </div>
                    {formData.staffEmail && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => sendTestEmailWithNotes(formData.staffEmail!, 'staff', formData)}
                        disabled={loading === 'staff' || loading === 'both'}
                      >
                        <Send className="h-3 w-3 mr-1" />
                        Test Email
                      </Button>
                    )}
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-600">
                Test emails will include the current notes and follow-up date information.
              </div>
            </div>
          </div>
        )}
        <div className="flex justify-end mt-2 mb-3 px-6">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleSendFollowUp}
            disabled={!!loading || (!followUpStudent && !followUpStaff)}
            className="bg-fuchsia-600 text-white shadow-[0_0_0_0_rgba(0,0,0,0)] hover:bg-fuchsia-700 hover:shadow-[0_0_12px_2px_rgba(236,72,153,0.7)] focus:ring-2 focus:ring-fuchsia-400 focus:ring-offset-2 transition-all flex items-center gap-2 px-4 py-2"
          >
            <Send className="h-3.5 w-3.5" />
            {loading ? 'Sending...' : 'Send Follow-up Email'}
          </Button>
        </div>
        {feedback && (
          <div className={`text-sm mt-2 p-3 rounded ${feedback.includes('sent') 
            ? 'bg-green-50 text-green-700 border border-green-200 shadow-sm animate-pulse-once' 
            : 'bg-red-50 text-red-600 border border-red-200'}`}>
            {feedback}
          </div>
        )}
      </CardContent>
    </Card>
  )
}


