/**
 * FollowUpCard component manages follow-up scheduling and email recipient selection.
 * Handles both student and staff follow-up options, including test email functionality
 * that uses the actual notes and follow-up information in the email content.
 */

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { CalendarDays, User, Send } from "lucide-react"
import { FormData } from "@/lib/data"
import { EmailTypeDialog } from "./EmailTypeDialog"
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
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [emailDialogTarget, setEmailDialogTarget] = useState<null | { email: string, type: 'student' | 'staff' }>(null)
  const { sendTestEmailWithNotes } = useEmailFunctionality()

  const handleFollowUpDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFormDataChange({ followUpDate: e.target.value })
  }

  const handleStaffEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFormDataChange({ staffEmail: e.target.value })
  }

  // Handler to open dialog and store which email/type
  const handleTestEmailClick = (email: string, type: 'student' | 'staff') => {
    setEmailDialogTarget({ email, type })
    setEmailDialogOpen(true)
  }

  // Handler for dialog selection
  const handleDialogSelect = (type: 'student' | 'staff') => {
    if (emailDialogTarget) {
      sendTestEmailWithNotes(emailDialogTarget.email, type, formData)
    }
    setEmailDialogOpen(false)
    setEmailDialogTarget(null)
  }

  // Handler for follow-up pop up (choose recipient)
  const [showFollowUpDialog, setShowFollowUpDialog] = useState(false)
  const [followUpFeedback, setFollowUpFeedback] = useState<string | null>(null)
  const [followUpLoading, setFollowUpLoading] = useState<'student' | 'staff' | false>(false)

  const handleFollowUpSend = async (target: 'student' | 'staff') => {
    setFollowUpFeedback(null)
    setFollowUpLoading(target)
    try {
      if (target === 'student' && formData.studentEmail) {
        await sendTestEmailWithNotes(formData.studentEmail, 'student', formData)
        setFollowUpFeedback('Follow-up email sent to student!')
      } else if (target === 'staff' && formData.staffEmail) {
        await sendTestEmailWithNotes(formData.staffEmail, 'staff', formData)
        setFollowUpFeedback('Follow-up email sent to staff!')
      } else {
        setFollowUpFeedback('No email address available for selected recipient.')
      }
    } catch {
      setFollowUpFeedback('Failed to send follow-up email.')
    } finally {
      setFollowUpLoading(false)
      setShowFollowUpDialog(false)
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
            <Checkbox
              id="followUpStudent"
              checked={followUpStudent}
              onCheckedChange={onFollowUpStudentChange}
            />
            <Label htmlFor="followUpStudent" className="text-sm sm:text-base">
              Schedule follow-up email with student
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="followUpStaff"
              checked={followUpStaff}
              onCheckedChange={onFollowUpStaffChange}
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

            {/* Email Recipients Display */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Email Recipients</Label>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                {followUpStudent && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Student:</span>
                      <span className="text-sm text-gray-700">
                        {formData.studentEmail || "No email address available"}
                      </span>
                    </div>
                    {formData.studentEmail && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleTestEmailClick(formData.studentEmail!, 'student')}
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
                        onClick={() => handleTestEmailClick(formData.staffEmail!, 'staff')}
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
        <EmailTypeDialog
          open={emailDialogOpen}
          onClose={() => { setEmailDialogOpen(false); setEmailDialogTarget(null) }}
          onSelect={handleDialogSelect}
        />
      </CardContent>
      {/* Add a button to trigger follow-up dialog */}
      <div className="flex justify-end mt-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setShowFollowUpDialog(true)}
          disabled={!formData.studentEmail && !formData.staffEmail}
          className="bg-fuchsia-600 text-white shadow-[0_0_0_0_rgba(0,0,0,0)] hover:bg-fuchsia-700 hover:shadow-[0_0_12px_2px_rgba(236,72,153,0.7)] focus:ring-2 focus:ring-fuchsia-400 focus:ring-offset-2 transition-all"
        >
          Send Follow-up
        </Button>
      </div>
      {/* Follow-up dialog */}
      {showFollowUpDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <div className="mb-4 font-semibold text-lg">Send Follow-up Email</div>
            <div className="mb-4 text-sm text-gray-700">Who do you want to send the follow-up email to?</div>
            <div className="flex gap-2 mb-2">
              <Button
                size="sm"
                className="followup-glow-btn"
                onClick={() => handleFollowUpSend('student')}
                disabled={!formData.studentEmail || followUpLoading !== false}
              >
                {followUpLoading === 'student' ? 'Sending...' : 'Student'}
              </Button>
              <Button
                size="sm"
                className="followup-glow-btn"
                onClick={() => handleFollowUpSend('staff')}
                disabled={!formData.staffEmail || followUpLoading !== false}
              >
                {followUpLoading === 'staff' ? 'Sending...' : 'Staff'}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowFollowUpDialog(false)} disabled={followUpLoading !== false}>
                Cancel
              </Button>
            </div>
            {followUpFeedback && (
              <div className={`text-sm mt-2 ${followUpFeedback.includes('sent') ? 'text-green-600' : 'text-red-600'}`}>{followUpFeedback}</div>
            )}
            {/* Custom style for follow-up dialog buttons */}
            <style jsx>{`
              .followup-glow-btn {
                @apply bg-purple-600 text-white font-semibold shadow-md transition duration-150;
              }
              .followup-glow-btn:hover:enabled {
                box-shadow: 0 0 0 4px #e879f9, 0 2px 8px 0 #a21caf;
                background-color: #a21caf;
                /* Magenta glow and deeper purple background on hover */
              }
              .followup-glow-btn:disabled {
                @apply opacity-60 cursor-not-allowed;
              }
            `}</style>
          </div>
        </div>
      )}
    </Card>
  )
}
