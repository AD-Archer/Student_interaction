/**
 * This file defines the main student interaction form for the Launchpad Philly Student Interaction Tracker.
 * It orc    router.push("/")
  }

  // I wrap performAIAction to match InteractionDetailsCard's expected signature all the smaller form components and hooks to create a cohesive form experience.
 * The form is now broken down into logical sections for better maintainability and reusability.
 *
 * Components used:
 * - StudentSelectionCard: handles student and interaction type selection
 * - InteractionDetailsCard: handles reason, notes, and AI summarization
 * - FollowUpCard: handles follow-up scheduling and email
 * - AISummaryCard: displays the AI-generated summary
 * - FormActions: handles submit/cancel actions
 *
 * Custom hooks:
 * - useFormData: manages form state and updates
 * - useAIFunctionality: manages AI summary and notes cleanup
 * - useEmailFunctionality: manages email sending logic
 *
 * This file should only orchestrate the above pieces and not contain inline UI or business logic.
 */

"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { StudentSelectionCard } from "./StudentSelectionCard"
import { InteractionDetailsCard } from "./InteractionDetailsCard"
import { FollowUpCard } from "./FollowUpCard"
import { AISummaryCard } from "./AISummaryCard"
import { FormActions } from "./FormActions"
import { useFormData } from "../hooks/useFormData"
import { useAIFunctionality } from "../hooks/useAIFunctionality"
import { useEmailFunctionality } from "../hooks/useEmailFunctionality"
import { useAuth } from "@/components/auth-wrapper"

export function Form({ interactionId }: { interactionId?: number }) {
  const router = useRouter()
  const { user } = useAuth()

  // Restore two booleans for follow-up recipients
  const [followUpStudent, setFollowUpStudent] = useState(false)
  const [followUpStaff, setFollowUpStaff] = useState(false)

  // I manage all form state and updates
  const {
    formData,
    updateFormData,
  } = useFormData({ interactionId })

  // I handle AI summary and notes cleanup
  const {
    notesLoading,
    aiError,
    showAiSummary,
    aiSummary,
    actionLoading,
    generateAISummaryAfterSubmit,
    performAIAction,
    generateBriefSummary,
  } = useAIFunctionality()

  // I handle email sending logic
  const { sendTestEmailWithNotes } = useEmailFunctionality()

  // I handle the form submission and orchestrate saving the interaction
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    await generateAISummaryAfterSubmit({
      studentName: formData.studentName,
      type: formData.interactionType,
      reason: formData.reason,
      notes: formData.notes,
    })
    // Build the payload with all required fields for the API
    const payload = {
      ...formData,
      type: formData.interactionType,
      staffMember: user ? `${user.firstName} ${user.lastName}` : "",
      staffMemberId: user ? (user as unknown as { id: number }).id : null,
      followUp: {
        required: followUpStudent || followUpStaff,
        student: followUpStudent,
        staff: followUpStaff,
        date: formData.followUpDate || null,
        overdue: false,
        studentEmail: followUpStudent ? formData.studentEmail : null,
        staffEmail: followUpStaff ? formData.staffEmail : null
      }
    }
    // Determine if follow-up should be sent now
    let shouldSendNow = false
    if (payload.followUp.required && payload.followUp.date) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const followUpDate = new Date(payload.followUp.date)
      followUpDate.setHours(0, 0, 0, 0)
      shouldSendNow = followUpDate <= today
    }
    // Save the interaction
    try {
      console.log('Submitting interaction with payload:', payload)
      const response = await fetch("/api/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const errorText = await response.text()
        console.error("Failed to save interaction:", errorText)
        console.error("Response status:", response.status)
        alert(`Failed to save interaction: ${errorText}`)
        return
      }
      const result = await response.json()
      console.log('Interaction saved successfully:', result)
      // Only send follow-up emails if the date is today or in the past
      if (shouldSendNow) {
        if (followUpStudent && formData.studentEmail) {
          await sendTestEmailWithNotes(formData.studentEmail, 'student', formData)
        }
        if (followUpStaff && formData.staffEmail) {
          await sendTestEmailWithNotes(formData.staffEmail, 'staff', formData)
        }
      }
    } catch (err) {
      console.error("Error saving interaction:", err)
      return
    }
    router.push("/")
  }


  // I wrap performAIAction to match AISummaryCard's expected signature
  const handlePerformAIAction = async (action: import('../hooks/useAIFunctionality').AIActionType, content: string) => {
    return await performAIAction(action, content)
  }

  return (
    <div className="space-y-8 sm:space-y-10">
      <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-10">
        {/* Student and interaction type selection */}
        <StudentSelectionCard
          formData={formData}
          onFormDataChange={updateFormData}
        />

        {/* Reason, notes, and AI summarization */}
        <InteractionDetailsCard
          formData={formData}
          onFormDataChange={updateFormData}
          notesLoading={notesLoading}
          aiError={aiError}
          actionLoading={actionLoading}
          onPerformAIAction={handlePerformAIAction}
        />

        {/* Follow-up scheduling and email */}
        <FollowUpCard
          formData={formData}
          onFormDataChange={updateFormData}
          followUpStudent={followUpStudent}
          followUpStaff={followUpStaff}
          onFollowUpStudentChange={setFollowUpStudent}
          onFollowUpStaffChange={setFollowUpStaff}
        />

        {/* Submit/cancel actions */}
        <FormActions
          isSubmitting={notesLoading}
          onSubmit={handleSubmit}
        />
      </form>

      {/* AI summary display */}
      <AISummaryCard
        aiSummary={aiSummary}
        isVisible={showAiSummary}
        onGenerateBriefSummary={() => generateBriefSummary({
          studentName: formData.studentName,
          type: formData.interactionType,
          reason: formData.reason,
          notes: formData.notes,
        })}
        interactionData={{
          studentName: formData.studentName,
          type: formData.interactionType,
          reason: formData.reason,
          notes: formData.notes,
        }}
      />
    </div>
  )
}
