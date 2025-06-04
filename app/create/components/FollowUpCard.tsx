/**
 * FollowUpCard component manages follow-up scheduling and email recipient selection.
 * Handles both student and staff follow-up options, including test email functionality
 * that uses the actual notes and follow-up information in the email content.
 */

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { CalendarDays, User, Send } from "lucide-react"
import { FormData } from "@/lib/data"

interface FollowUpCardProps {
  formData: FormData
  onFormDataChange: (updates: Partial<FormData>) => void
  followUpStudent: boolean
  followUpStaff: boolean
  onFollowUpStudentChange: (checked: boolean) => void
  onFollowUpStaffChange: (checked: boolean) => void
  onSendTestEmail: (email: string, recipientType: 'student' | 'staff') => void
}

export function FollowUpCard({
  formData,
  onFormDataChange,
  followUpStudent,
  followUpStaff,
  onFollowUpStudentChange,
  onFollowUpStaffChange,
  onSendTestEmail
}: FollowUpCardProps) {
  const handleFollowUpDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFormDataChange({ followUpDate: e.target.value })
  }

  const handleStaffEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFormDataChange({ staffEmail: e.target.value })
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
                        onClick={() => onSendTestEmail(formData.studentEmail!, 'student')}
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
                        onClick={() => onSendTestEmail(formData.staffEmail!, 'staff')}
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
      </CardContent>
    </Card>
  )
}
