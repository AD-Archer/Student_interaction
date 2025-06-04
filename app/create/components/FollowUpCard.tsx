/**
 * FollowUpCard component manages follow-up scheduling and email recipient selection.
 * Handles both student and staff follow-up options, including test email functionality
 * that uses the actual notes and follow-up information in the email content.
 *
 * Updates:
 * - Shows a clear message in the follow-up dialog if the student email is missing, so the user knows why the button is disabled.
 * - Adds a visual cue for the current value of formData.studentEmail for debugging.
 * - Improved UI for better feedback when sending emails.
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
      let success = false
      if (target === 'student' && formData.studentEmail) {
        await sendTestEmailWithNotes(formData.studentEmail, 'student', formData)
        setFollowUpFeedback(`Follow-up email successfully sent to student (${formData.studentEmail})`)
        success = true
      } else if (target === 'staff' && formData.staffEmail) {
        await sendTestEmailWithNotes(formData.staffEmail, 'staff', formData)
        setFollowUpFeedback(`Follow-up email successfully sent to staff (${formData.staffEmail})`)
        success = true
      } else {
        const recipient = target === 'student' ? 'student' : 'staff'
        setFollowUpFeedback(`No email address available for ${recipient}. Please provide one before sending.`)
      }
      if (success) {
        // I want to close the dialog after the user sees the success alert
        const timer = setTimeout(() => {
          setShowFollowUpDialog(false)
          setFollowUpFeedback(null)
        }, 1800)
        // Clean up timer if dialog is closed early
        return () => clearTimeout(timer)
      }
    } catch (error) {
      console.error("Follow-up email error:", error)
      setFollowUpFeedback(`Failed to send follow-up email to ${target}. Please try again or check network connection.`)
    } finally {
      setFollowUpLoading(false)
      // Dialog remains open on error so user can see feedback and manually close when ready
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
      <div className="flex justify-end mt-2 mb-3 px-6">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setShowFollowUpDialog(true)}
          disabled={!formData.studentEmail && !formData.staffEmail}
          className="bg-fuchsia-600 text-white shadow-[0_0_0_0_rgba(0,0,0,0)] hover:bg-fuchsia-700 hover:shadow-[0_0_12px_2px_rgba(236,72,153,0.7)] focus:ring-2 focus:ring-fuchsia-400 focus:ring-offset-2 transition-all flex items-center gap-2 px-4 py-2"
        >
          <Send className="h-3.5 w-3.5" />
          Send Follow-up Email
        </Button>
      </div>
      {/* Follow-up dialog */}
      {showFollowUpDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-700/50 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-6 max-w-sm w-full animate-slide-up">
            <div className="flex justify-between items-center mb-4">
              <div className="font-semibold text-lg">Send Follow-up Email</div>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 w-8 p-0 rounded-full focus:ring-2 focus:ring-purple-400 focus:outline-none" 
                onClick={() => setShowFollowUpDialog(false)} 
                disabled={followUpLoading !== false}
                aria-label="Close dialog"
              >
                ✕
              </Button>
            </div>
            <div className="mb-4 text-sm text-gray-700">Who do you want to send the follow-up email to?</div>
            {/* Recipient information */}
            <div className="mb-3 text-xs bg-gray-50 border border-gray-100 rounded-md p-3">
              <div className="flex items-center mb-1">
                <div className="w-16 font-medium">Student:</div> 
                <span className={formData.studentEmail ? 'text-green-700 font-medium' : 'text-red-600'}>
                  {formData.studentEmail || 'None provided'}
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-16 font-medium">Staff:</div> 
                <span className={formData.staffEmail ? 'text-green-700 font-medium' : 'text-gray-400 italic'}>
                  {formData.staffEmail || 'Not set'}
                </span>
              </div>
            </div>
            <div className="flex gap-2 mb-2">
              <Button
                type="button" // I always want this to be a button, not a submit, so dialog never closes unexpectedly
                size="sm"
                className={`followup-glow-btn ${!formData.studentEmail ? 'opacity-50' : ''}`}
                onClick={() => handleFollowUpSend('student')}
                disabled={!formData.studentEmail || followUpLoading !== false}
                title={!formData.studentEmail ? "Student email address is missing" : "Send follow-up to student"}
              >
                {followUpLoading === 'student' ? 'Sending...' : 'Student'}
              </Button>
              <Button
                type="button" // I always want this to be a button, not a submit, so dialog never closes unexpectedly
                size="sm"
                className={`followup-glow-btn ${!formData.staffEmail ? 'opacity-50' : ''}`}
                onClick={() => handleFollowUpSend('staff')}
                disabled={!formData.staffEmail || followUpLoading !== false}
                title={!formData.staffEmail ? "Staff email address is missing" : "Send follow-up to staff member"}
              >
                {followUpLoading === 'staff' ? 'Sending...' : 'Staff'}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowFollowUpDialog(false)} disabled={followUpLoading !== false}>
                Cancel
              </Button>
            </div>
            {/* Show a message if student email is missing */}
            {!formData.studentEmail && (
              <div className="text-xs text-red-600 mt-1 mb-2 bg-red-50 p-2 rounded border border-red-100">
                <p>Student email address is missing. This can happen if:</p>
                <ul className="list-disc ml-4 mt-1">
                  <li>You haven&apos;t selected a student</li>
                  <li>The selected student doesn&apos;t have an email on record</li>
                </ul>
              </div>
            )}
            {followUpFeedback && (
              <div className={`text-sm mt-2 p-3 rounded ${followUpFeedback.includes('sent') 
                ? 'bg-green-50 text-green-700 border border-green-200 shadow-sm animate-pulse-once' 
                : 'bg-red-50 text-red-600 border border-red-200'}`}>
                <div className="flex items-center">
                  {followUpFeedback.includes('sent') ? (
                    <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                  {followUpFeedback}
                </div>
              </div>
            )}
            <style jsx>{`
              .followup-glow-btn {
                @apply bg-purple-600 text-white font-semibold shadow-md transition-all duration-200;
              }
              .followup-glow-btn:hover:enabled {
                box-shadow: 0 0 0 4px rgba(232, 121, 249, 0.3), 0 2px 8px 0 rgba(162, 28, 175, 0.4);
                background-color: #a21caf;
                transform: translateY(-1px);
              }
              .followup-glow-btn:active:enabled {
                transform: translateY(0px);
                box-shadow: 0 0 0 2px rgba(232, 121, 249, 0.2);
              }
              .followup-glow-btn:disabled {
                @apply opacity-60 cursor-not-allowed;
              }
              @keyframes slideUp {
                from {
                  opacity: 0;
                  transform: translateY(10px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
              .animate-slide-up {
                animation: slideUp 0.2s ease-out;
              }
              @keyframes pulseOnce {
                0%, 100% {
                  opacity: 1;
                }
                50% {
                  opacity: 0.8;
                }
              }
              .animate-pulse-once {
                animation: pulseOnce 2s ease-in-out;
              }
            `}</style>
          </div>
        </div>
      )}
    </Card>
  )
}


