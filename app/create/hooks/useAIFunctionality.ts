/**
 * Custom hook for managing AI-related functionality in the form.
 * This handles AI summarization of notes, error handling, and loading states
 * for all AI operations throughout the form interaction process.
 */

import { useState } from "react"
import { FormData } from "@/lib/data"

export interface InteractionData {
  studentName: string
  type: string
  reason: string
  notes: string
}

export function useAIFunctionality() {
  const [notesLoading, setNotesLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [showAiSummary, setShowAiSummary] = useState(false)
  const [aiSummary, setAiSummary] = useState("")

  const handleAiSummarizeNotes = async (formData: FormData, updateFormData: (updates: Partial<FormData>) => void) => {
    setNotesLoading(true)
    setAiError(null)

    try {
      // I wrap the detailed notes with an instruction for summarization and improvement
      const instruction = 'Please summarize, clean up, and improve readability of the following notes in English. Return the output in two sections labeled "Glows" and "Grows" in plain text:'
      const prompt = `${instruction}\n\n${formData.notes}`
      const payload = { message: prompt }
      console.log('Sending notes to AI summarization:', payload)

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      console.log('AI API response status:', response.status)

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized: Please log in to use AI features.')
        }
        throw new Error(`AI API returned status ${response.status}`)
      }

      // New shape: { result: string }
      const { result } = await response.json()
      console.log('AI summarization result:', result)

      // replace the notes field with AI cleaned-up text
      updateFormData({ notes: result })
    } catch (error) {
      setAiError(error instanceof Error ? error.message : 'An unknown error occurred.')
    } finally {
      setNotesLoading(false)
    }
  }

  const generateAISummaryAfterSubmit = async (interactionData: InteractionData) => {
    setNotesLoading(true)
    try {
      const instruction = 'Please provide a concise English summary of this student interaction in plain text:'
      const payload = {
        message: `${instruction}\n\nStudent: ${interactionData.studentName}\nType: ${interactionData.type}\nReason: ${interactionData.reason}\nNotes: ${interactionData.notes}`
      }
      const aiResponse = await fetch('/api/ai', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload)
      })
      if (aiResponse.ok) {
        const { result } = await aiResponse.json()
        setAiSummary(result)
        setShowAiSummary(true)
      }
    } catch (error) {
      console.error('Error generating AI summary:', error)
    } finally {
      setNotesLoading(false)
    }
  }

  return {
    notesLoading,
    aiError,
    showAiSummary,
    aiSummary,
    handleAiSummarizeNotes,
    generateAISummaryAfterSubmit,
  }
}
