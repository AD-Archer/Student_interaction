/**
 * This file defines the main student interaction form for the Launchpad Philly Student Interaction Tracker.
 * It orchestrates all the smaller form components and hooks to create a cohesive form experience.
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

import React from "react"
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
  const { user } = useAuth() // I get the current staff user for required fields

  // I manage all form state and updates
  const {
    formData,
    updateFormData,
    followUpStudent,
    setFollowUpStudent,
    followUpStaff,
    setFollowUpStaff,
  } = useFormData({ interactionId })

  // I handle AI summary and notes cleanup
  const {
    notesLoading,
    aiError,
    showAiSummary,
    aiSummary,
    handleAiSummarizeNotes,
    generateAISummaryAfterSubmit,
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
    // Debug: log the user object to determine staffMemberId property
    console.log('Current user object:', user)
    // Build the payload with all required fields for the API
    const payload = {
      ...formData,
      type: formData.interactionType, // ensure correct mapping
      staffMember: user ? `${user.firstName} ${user.lastName}` : "", // required
      staffMemberId: user ? (user as unknown as { id: number }).id : null, // type-safe workaround for TS
      followUp: {
        required: followUpStudent || followUpStaff,
        date: formData.followUpDate || null,
        overdue: false // let backend calculate if needed
      }
    }
    console.log('Submitting payload to /api/interactions:', payload)
    try {
      const response = await fetch("/api/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        console.error("Failed to save interaction:", await response.text())
        return
      }
    } catch (err) {
      console.error("Error saving interaction:", err)
      return
    }
    router.push("/")
  }

  // I wrap sendTestEmailWithNotes to match FollowUpCard's expected signature
  const handleSendTestEmail = (email: string, recipientType: 'student' | 'staff') => {
    void sendTestEmailWithNotes(email, recipientType, formData)
  }

  // I wrap handleAiSummarizeNotes to match InteractionDetailsCard's expected signature
  const handleAiSummarizeNotesWrapper = () => {
    void handleAiSummarizeNotes(formData, updateFormData)
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
          onAiSummarizeNotes={handleAiSummarizeNotesWrapper}
        />

        {/* Follow-up scheduling and email */}
        <FollowUpCard
          formData={formData}
          onFormDataChange={updateFormData}
          followUpStudent={followUpStudent}
          followUpStaff={followUpStaff}
          onFollowUpStudentChange={setFollowUpStudent}
          onFollowUpStaffChange={setFollowUpStaff}
          onSendTestEmail={handleSendTestEmail}
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
      />
    </div>
  )
}
