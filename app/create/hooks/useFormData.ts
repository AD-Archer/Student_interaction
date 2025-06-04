/**
 * Custom hook for managing form data state and operations.
 * This centralizes all form state management including initial data loading,
 * updates, and form validation logic for the student interaction form.
 */

import { useState, useEffect } from "react"
import { FormData } from "@/lib/data"
import { interactionsAPI } from "@/lib/api"
import { useAuth } from "@/components/auth-wrapper"

interface UseFormDataProps {
  interactionId?: number
}

export function useFormData({ interactionId }: UseFormDataProps = {}) {
  const { user } = useAuth()
  
  const [formData, setFormData] = useState<FormData>({
    studentName: "",
    studentId: "",
    studentEmail: "",
    interactionType: "",
    reason: "",
    notes: "",
    followUpEmail: false,
    followUpDate: "",
    staffEmail: user?.email ?? "",
  })

  const [followUpStudent, setFollowUpStudent] = useState(false)
  const [followUpStaff, setFollowUpStaff] = useState(false)

  // Calculate default follow-up date (2 weeks from today)
  const today = new Date()
  const twoWeeksFromToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14)
    .toISOString().slice(0, 10)

  // Update follow-up date when checkboxes change
  useEffect(() => {
    if ((followUpStudent || followUpStaff) && !formData.followUpDate) {
      setFormData((prev) => ({ ...prev, followUpDate: twoWeeksFromToday }))
    }
    if (!followUpStudent && !followUpStaff && formData.followUpDate) {
      setFormData((prev) => ({ ...prev, followUpDate: "" }))
    }
  }, [followUpStudent, followUpStaff, formData.followUpDate, twoWeeksFromToday])

  // Load existing interaction data if editing
  useEffect(() => {
    if (interactionId !== undefined) {
      const loadInteraction = async () => {
        try {
          const interaction = await interactionsAPI.getById(interactionId)
          setFormData({
            studentName: interaction.studentName,
            studentId: interaction.studentId,
            studentEmail: interaction.studentEmail || "",
            interactionType: interaction.type,
            reason: interaction.reason,
            notes: interaction.notes,
            followUpEmail: interaction.followUp.required,
            followUpDate: interaction.followUp.date || "",
            staffEmail: user?.email ?? "",
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
  }, [interactionId, user?.email])

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
  }

  const generateAiSummary = (data: FormData): string => {
    return `• Student ${data.studentName} (ID: ${data.studentId}) participated in ${data.interactionType} session
• Primary reason: ${data.reason}
• Key discussion points documented in notes
• ${data.followUpEmail ? `Follow-up scheduled for ${data.followUpDate}` : "No follow-up required at this time"}
• Interaction logged for workforce development tracking`
  }

  return {
    formData,
    updateFormData,
    followUpStudent,
    setFollowUpStudent,
    followUpStaff,
    setFollowUpStaff,
    generateAiSummary,
  }
}
