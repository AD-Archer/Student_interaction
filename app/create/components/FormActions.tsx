/**
 * FormActions component handles the submit and cancel buttons for the form.
 * Manages loading states and provides clear action buttons with proper icons.
 */

import React from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Send } from "lucide-react"
import { useRouter } from "next/navigation"

interface FormActionsProps {
  isSubmitting: boolean
  onSubmit: (e: React.FormEvent) => void
}

export function FormActions({ isSubmitting, onSubmit }: FormActionsProps) {
  const router = useRouter()

  return (
    <div className="flex flex-col sm:flex-row gap-3 pt-4">
      <Button 
        type="button" 
        variant="outline" 
        onClick={() => router.push("/")} 
        className="flex-1"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Cancel
      </Button>
      <Button 
        type="submit" 
        disabled={isSubmitting} 
        className="flex-1 bg-blue-600 hover:bg-blue-700"
        onClick={onSubmit}
      >
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
  )
}
