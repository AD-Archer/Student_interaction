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

export type AIActionType = 'cleanup' | 'summarize' | 'enhance' | 'glows-grows'

export function useAIFunctionality() {
  const [notesLoading, setNotesLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [showAiSummary, setShowAiSummary] = useState(false)
  const [aiSummary, setAiSummary] = useState("")
  const [briefSummary, setBriefSummary] = useState("")
  const [actionLoading, setActionLoading] = useState<AIActionType | null>(null)

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

  // I handle different AI actions on the summary content
  const performAIAction = async (action: AIActionType, content: string): Promise<string> => {
    setActionLoading(action)
    setAiError(null)

    try {
      let instruction = ''
      
      switch (action) {
        case 'cleanup':
          instruction = 'Please clean up and improve the grammar, punctuation, and readability of the following text while maintaining its original meaning and structure. Return the response in plain text format:'
          break
        case 'summarize':
          instruction = 'Please provide a concise summary of the following text, highlighting the key points. Return the response in plain text format:'
          break
        case 'enhance':
          instruction = 'Please enhance the following text by adding more detail, context, and professional language while keeping the core message intact. Return the response in plain text format:'
          break
        case 'glows-grows':
          instruction = 'Please reorganize the following text into two clear sections: "Glows" (positive aspects, successes, strengths) and "Grows" (areas for improvement, challenges, development opportunities). Return the response in plain text format:'
          break
      }

      const payload = { message: `${instruction}\n\n${content}` }
      
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`AI API returned status ${response.status}`)
      }

      const { result } = await response.json()
      return result
    } catch (error) {
      setAiError(error instanceof Error ? error.message : 'An unknown error occurred.')
      throw error
    } finally {
      setActionLoading(null)
    }
  }

  // I generate a brief summary of the entire interaction card
  const generateBriefSummary = async (interactionData: InteractionData) => {
    try {
      const instruction = 'Please provide a very brief 1-2 sentence summary of this student interaction:'
      const payload = {
        message: `${instruction}\n\nStudent: ${interactionData.studentName}\nType: ${interactionData.type}\nReason: ${interactionData.reason}\nNotes: ${interactionData.notes}`
      }
      
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      if (response.ok) {
        const { result } = await response.json()
        setBriefSummary(result)
        return result
      }
    } catch (error) {
      console.error('Error generating brief summary:', error)
    }
    return ''
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
    briefSummary,
    actionLoading,
    handleAiSummarizeNotes,
    generateAISummaryAfterSubmit,
    performAIAction,
    generateBriefSummary,
  }
}
