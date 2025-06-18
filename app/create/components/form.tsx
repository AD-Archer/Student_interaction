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

import React, { useState, useEffect, useRef } from "react"
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

export function Form({ interactionId, initialStudentId, initialStudentName }: { interactionId?: number, initialStudentId?: string, initialStudentName?: string }) {
  const router = useRouter()
  const { user } = useAuth()

  // Restore two booleans for follow-up recipients
  const [followUpStudent, setFollowUpStudent] = useState(false)
  const [followUpStaff, setFollowUpStaff] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // I manage all form state and updates
  const {
    formData,
    updateFormData,
  } = useFormData({ interactionId, initialStudentId, initialStudentName })

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
    setFormError(null)
    // Client-side validation for required fields
    if (!formData.studentName || !formData.studentId || !formData.interactionType || !formData.reason || !formData.notes) {
      setFormError("Please fill out all required fields before saving.")
      return
    }
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
      },
      // I add updatedBy for audit trail
      ...(interactionId && user ? { updatedBy: `${user.firstName} ${user.lastName}` } : {})
    }
    let shouldSendNow = false
    if (payload.followUp.required && payload.followUp.date) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const followUpDate = new Date(payload.followUp.date)
      followUpDate.setHours(0, 0, 0, 0)
      shouldSendNow = followUpDate <= today
    }
    try {
      let response
      if (interactionId) {
        // I update the existing interaction if editing
        response = await fetch(`/api/interactions/${interactionId}` , {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      } else {
        // I create a new interaction if not editing
        response = await fetch("/api/interactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      }
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

  const isDirty = useRef(false)

  // Watch for changes to formData to set dirty flag
  useEffect(() => {
    // If any field is filled, mark as dirty
    isDirty.current = !!(
      formData.studentName ||
      formData.studentId ||
      formData.interactionType ||
      formData.reason ||
      formData.notes ||
      formData.followUpDate ||
      formData.staffEmail
    )
  }, [formData])

  // Warn on page unload if dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty.current) {
        e.preventDefault()
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?"
        return e.returnValue
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [])

  // Block navigation if dirty (Next.js back/forward and in-app links)
  useEffect(() => {
    // Block browser back/forward
    const unblock = (event: PopStateEvent) => {
      if (isDirty.current) {
        const confirmLeave = window.confirm("You have unsaved changes. Are you sure you want to leave this page?")
        if (!confirmLeave) {
          event.preventDefault?.()
          window.history.pushState(null, '', window.location.href)
          return false
        }
      }
      return true
    }
    window.addEventListener('popstate', unblock)

    // Intercept all <a> clicks for in-app navigation
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'A') {
        const href = (target as HTMLAnchorElement).getAttribute('href')
        if (href && !href.startsWith('#') && isDirty.current && href !== window.location.pathname) {
          const confirmLeave = window.confirm("You have unsaved changes. Are you sure you want to leave this page?")
          if (!confirmLeave) {
            e.preventDefault()
            return false
          }
        }
      }
    }
    document.addEventListener('click', handleLinkClick)
    return () => {
      window.removeEventListener('popstate', unblock)
      document.removeEventListener('click', handleLinkClick)
    }
  }, [])

  return (
    <div className="space-y-8 sm:space-y-10">
      {formError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded p-3 text-sm font-medium">
          {formError}
        </div>
      )}
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
          disableSubmit={
            !formData.studentName ||
            !formData.studentId ||
            !formData.interactionType ||
            !formData.reason ||
            !formData.notes
          }
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
