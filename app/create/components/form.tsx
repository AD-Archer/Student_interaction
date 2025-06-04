/**
 * This file defines the main student interaction form for the Launchpad Philly Student Interaction Tracker.
 * It handles all user input, AI summarization, and follow-up scheduling, and is styled for a modern, professional look.
 * Key features: dynamic follow-up recipient selection, AI-powered note cleanup, and clear, accessible UI.
 */

"use client"

import React, { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, User, Send, Sparkles, ArrowLeft, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { FormData, formInteractionTypes as interactionTypes, formStudents as students } from "@/lib/data"
import { interactionsAPI } from "@/lib/api"
import { useAuth } from "@/components/auth-wrapper"

export function Form({ interactionId }: { interactionId?: number }) {
  const router = useRouter()
  const { user } = useAuth()
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
  const [notesLoading, setNotesLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null);

  const today = new Date();
  const twoWeeksFromToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14)
    .toISOString().slice(0, 10);

  const [followUpStudent, setFollowUpStudent] = useState(false);
  const [followUpStaff, setFollowUpStaff] = useState(false);

  useEffect(() => {
    if ((followUpStudent || followUpStaff) && !formData.followUpDate) {
      setFormData((prev) => ({ ...prev, followUpDate: twoWeeksFromToday }));
    }
    if (!followUpStudent && !followUpStaff && formData.followUpDate) {
      setFormData((prev) => ({ ...prev, followUpDate: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [followUpStudent, followUpStaff]);

  // Prefill form if editing
  useEffect(() => {
    if (interactionId !== undefined) {
      const loadInteraction = async () => {
        try {
          const interaction = await interactionsAPI.getById(interactionId)
          setFormData({
            studentName: interaction.studentName,
            studentId: interaction.studentId,
            interactionType: interaction.type,
            reason: interaction.reason,
            notes: interaction.notes,
            followUpEmail: interaction.followUp.required,
            followUpDate: interaction.followUp.date || "",
          })
          setFollowUpStudent(interaction.followUp.required)
          setFollowUpStaff(false) // I don't track staff follow-up separately in data
        } catch (error) {
          console.error('Error loading interaction:', error)
          // Handle error - perhaps show a message to user
        }
      }
      loadInteraction()
    }
  }, [interactionId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Build interaction object for API
      const selectedStudent = students.find(s => s.id === formData.studentId)
      const now = new Date()
      const dateStr = now.toISOString().slice(0, 10)
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      
      const interactionData = {
        studentName: selectedStudent ? `${selectedStudent.firstName} ${selectedStudent.lastName}` : formData.studentName,
        studentId: formData.studentId,
        program: selectedStudent?.program || "",
        type: formData.interactionType,
        reason: formData.reason,
        notes: formData.notes,
        date: dateStr,
        time: timeStr,
        staffMember: user ? `${user.firstName} ${user.lastName}` : "Unknown Staff",
        staffMemberId: 1, // TODO: Get actual staff ID from user when available
        aiSummary: generateAiSummary(formData),
        followUp: {
          required: formData.followUpEmail,
          date: formData.followUpEmail ? formData.followUpDate : undefined,
          overdue: false,
        }
      }

      let saved
      if (interactionId !== undefined) {
        // Update existing
        saved = await interactionsAPI.update(interactionId, interactionData)
      } else {
        // Create new
        saved = await interactionsAPI.create(interactionData)
      }

      if (saved && saved.aiSummary) {
        setAiSummary(saved.aiSummary)
        setShowAiSummary(true)
      }

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push("/")
      }, 2000)

    } catch (error) {
      console.error('Error saving interaction:', error)
      // TODO: Show error message to user
    } finally {
      setIsSubmitting(false)
    }
  }

  const generateAiSummary = (data: FormData): string => {
    return `• Student ${data.studentName} (ID: ${data.studentId}) participated in ${data.interactionType} session
• Primary reason: ${data.reason}
• Key discussion points documented in notes
• ${data.followUpEmail ? `Follow-up scheduled for ${data.followUpDate}` : "No follow-up required at this time"}
• Interaction logged for workforce development tracking`
  }

  // New: AI Summarize/Clean Up Notes
  const handleAiSummarizeNotes = async () => {
    setNotesLoading(true);
    setAiError(null);

    try {
      // I wrap the detailed notes with an instruction for summarization and improvement
      const instruction = 'Please summarize, clean up, and improve readability of the following notes in English. Return the output in two sections labeled "Glows" and "Grows":';
      const prompt = `${instruction}\n\n${formData.notes}`;
      const payload = { message: prompt };
      console.log('Sending notes to AI summarization:', payload);

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('AI API response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized: Please log in to use AI features.');
        }
        throw new Error(`AI API returned status ${response.status}`);
      }

      // New shape: { result: string }
      const { result } = await response.json();
      console.log('AI summarization result:', result);

      // replace the notes field with AI cleaned-up text
      setFormData(prev => ({ ...prev, notes: result }));
    } catch (error) {
      console.error('Error summarizing notes:', error);
      setAiError(error instanceof Error ? error.message : 'An unknown error occurred.');
    } finally {
      setNotesLoading(false);
    }
  };

  return (
    <div className="space-y-8 sm:space-y-10">
      <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-10">
        {/* Student Selection */}
        <Card className="shadow-md border-blue-100 bg-white/80">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Student Information</CardTitle>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Required</Badge>
          </CardHeader>
          <hr className="my-2 border-gray-200" />
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student">Select Student</Label>
              <Select
                value={formData.studentId}
                onValueChange={(studentId) => {
                  const student = students.find((s) => s.id === studentId);
                  if (student) {
                    setFormData((prev) => ({ ...prev, studentId: student.id, studentName: `${student.firstName} ${student.lastName}` }));
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      <div className="flex items-center space-x-2 w-full">
                        <User className="h-4 w-4" />
                        <span className="flex-1">{`${student.firstName} ${student.lastName}`}</span>
                        <Badge variant="secondary" className="text-xs ml-auto">
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
                onValueChange={(value) => {
                  setFormData((prev) => ({ ...prev, interactionType: value }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select interaction type" />
                </SelectTrigger>
                <SelectContent>
                  {interactionTypes
                    .filter((type) => type.value !== "other")
                    .map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Interaction Details */}
        <Card className="shadow-md border-gray-100 bg-white/80">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-lg">Interaction Details</CardTitle>
            </div>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Details</Badge>
          </CardHeader>
          <hr className="my-2 border-gray-200" />
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Interaction</Label>
              <Input
                id="reason"
                placeholder="Brief reason for this interaction"
                value={formData.reason}
                onChange={(e) => setFormData((prev) => ({ ...prev, reason: e.target.value }))}
                className="border-red-200 focus:border-red-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Detailed Notes</Label>
              <Textarea
                id="notes"
                placeholder="Detailed notes about the interaction..."
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                rows={12} // increased height for detailed notes
                className="border-blue-200 focus:border-blue-400 resize-y" // allow vertical resizing
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-end">
              <div className="flex-1 w-full">
                {/* ...existing notes textarea... */}
              </div>
              <Button
                type="button"
                variant="secondary"
                className="mt-2 sm:mt-0 whitespace-nowrap"
                onClick={handleAiSummarizeNotes}
                disabled={notesLoading || !formData.notes}
              >
                {notesLoading ? (
                  <div className="flex items-center"><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400 mr-2"></div>Cleaning...</div>
                ) : (
                  <><Sparkles className="h-4 w-4 mr-1 text-blue-500" />AI Summarize/Clean Up</>
                )}
              </Button>
            </div>
            {aiError && (
              <p className="text-red-500 text-sm mt-2 sm:mt-0 sm:ml-2 break-words">
                {aiError}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Follow-up Section */}
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
                  onCheckedChange={(checked) => setFollowUpStudent(!!checked)}
                />
                <Label htmlFor="followUpStudent" className="text-sm sm:text-base">
                  Schedule follow-up email with student
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="followUpStaff"
                  checked={followUpStaff}
                  onCheckedChange={(checked) => setFollowUpStaff(!!checked)}
                />
                <Label htmlFor="followUpStaff" className="text-sm sm:text-base">
                  Schedule follow-up email with staff
                </Label>
              </div>
            </div>
            {(followUpStudent || followUpStaff) && (
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

        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button type="button" variant="outline" onClick={() => router.push("/")} className="flex-1">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 hover:bg-blue-700">
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
              <div className="flex items-center justify-center space-x-2 text-green-600 font-medium">
                <CheckCircle className="h-5 w-5" />
                <span>Interaction saved successfully! Redirecting to dashboard...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
