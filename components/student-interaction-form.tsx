"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, User, Send, Sparkles, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface FormData {
  studentName: string
  studentId: string
  interactionType: string
  reason: string
  notes: string
  followUpEmail: boolean
  followUpDate: string
}

const interactionTypes = [
  { value: "coaching", label: "Coaching | Job Readiness" },
  { value: "pip", label: "Performance Improvement Plan" },
  { value: "career", label: "Career Counseling" },
  { value: "academic", label: "Academic Support" },
  { value: "behavioral", label: "Behavioral Intervention" },
  { value: "other", label: "Other" },
]

const students = [
  { id: "0001", name: "Micheal Newman", program: "foundations" },
  { id: "0002", name: "Amira Johnson", program: "101" },
  { id: "0003", name: "Koleona Smith", program: "lightspeed" },
  { id: "0004", name: "Zaire Williams", program: "liftoff" },
]

export function StudentInteractionForm() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    studentName: "",
    studentId: "",
    interactionType: "",
    reason: "",
    notes: "",
    followUpEmail: false,
    followUpDate: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAiSummary, setShowAiSummary] = useState(false)
  const [aiSummary, setAiSummary] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Generate AI summary
    const summary = generateAiSummary(formData)
    setAiSummary(summary)
    setShowAiSummary(true)
    setIsSubmitting(false)

    console.log("Form submitted:", formData)

    // Redirect to dashboard after a delay
    setTimeout(() => {
      router.push("/")
    }, 3000)
  }

  const generateAiSummary = (data: FormData): string => {
    return `• Student ${data.studentName} (ID: ${data.studentId}) participated in ${data.interactionType} session
• Primary reason: ${data.reason}
• Key discussion points documented in notes
• ${data.followUpEmail ? `Follow-up scheduled for ${data.followUpDate}` : "No follow-up required at this time"}
• Interaction logged for workforce development tracking`
  }

  const handleStudentSelect = (studentId: string) => {
    const student = students.find((s) => s.id === studentId)
    if (student) {
      setFormData((prev) => ({
        ...prev,
        studentId: student.id,
        studentName: student.name,
      }))
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Student Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="student">Student</Label>
            <Select onValueChange={handleStudentSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select a student" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{student.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {student.program}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="interactionType">Interaction Type</Label>
            <Select
              value={formData.interactionType}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, interactionType: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select interaction type" />
              </SelectTrigger>
              <SelectContent>
                {interactionTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Reason */}
        <div className="space-y-2">
          <Label htmlFor="reason">Reason</Label>
          <Input
            id="reason"
            placeholder="Brief reason for this interaction"
            value={formData.reason}
            onChange={(e) => setFormData((prev) => ({ ...prev, reason: e.target.value }))}
            className="border-red-200 focus:border-red-400"
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Detailed notes about the interaction..."
            value={formData.notes}
            onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
            rows={6}
            className="border-blue-200 focus:border-blue-400"
          />
        </div>

        {/* Follow-up Section */}
        <Card className="border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <CalendarDays className="h-5 w-5 text-green-600" />
              <span>Follow-up</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="followUpEmail"
                checked={formData.followUpEmail}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, followUpEmail: checked as boolean }))}
              />
              <Label htmlFor="followUpEmail">Schedule follow-up email</Label>
            </div>

            {formData.followUpEmail && (
              <div className="space-y-2">
                <Label htmlFor="followUpDate">Follow-up Date</Label>
                <Input
                  id="followUpDate"
                  type="date"
                  value={formData.followUpDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, followUpDate: e.target.value }))}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.push("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Save Interaction
              </>
            )}
          </Button>
        </div>
      </form>

      {/* AI Summary */}
      {showAiSummary && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-800">
              <Sparkles className="h-5 w-5" />
              <span>AI Summary</span>
            </CardTitle>
            <CardDescription>Automatically generated summary of this interaction</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-white p-4 rounded-lg border">
              <div className="space-y-2">
                {aiSummary.split("\n").map((line, index) => (
                  <div key={index} className="text-sm text-gray-700">
                    {line}
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-green-600 font-medium">
                ✅ Interaction saved successfully! Redirecting to dashboard...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 border-t pt-4">
        Last edited: {new Date().toLocaleTimeString()} by you
      </div>
    </div>
  )
}
