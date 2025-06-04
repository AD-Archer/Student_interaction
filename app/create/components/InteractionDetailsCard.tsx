/**
 * InteractionDetailsCard component handles the interaction reason and detailed notes.
 * Includes AI functionality for summarizing and cleaning up notes using the Playlab API.
 * This component manages the core content of what happened during the student interaction.
 */

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import { FormData } from "@/lib/data"

interface InteractionDetailsCardProps {
  formData: FormData
  onFormDataChange: (updates: Partial<FormData>) => void
  notesLoading: boolean
  aiError: string | null
  onAiSummarizeNotes: () => void
}

export function InteractionDetailsCard({
  formData,
  onFormDataChange,
  notesLoading,
  aiError,
  onAiSummarizeNotes
}: InteractionDetailsCardProps) {
  const handleReasonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFormDataChange({ reason: e.target.value })
  }

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onFormDataChange({ notes: e.target.value })
  }

  return (
    <Card className="shadow-md border-gray-100 bg-white/80">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <CardTitle className="text-lg">Interaction Details</CardTitle>
        </div>
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
          Details
        </Badge>
      </CardHeader>
      <hr className="my-2 border-gray-200" />
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reason">Brief Reason for Interaction</Label>
          <Input
            id="reason"
            placeholder="Brief reason for this interaction"
            value={formData.reason}
            onChange={handleReasonChange}
            className="border-gray-200 focus:border-gray-400"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Detailed Notes</Label>
          <Textarea
            id="notes"
            placeholder="Detailed notes about the interaction..."
            value={formData.notes}
            onChange={handleNotesChange}
            rows={12}
            className="border-blue-200 focus:border-blue-400 resize-y"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-end">
          <div className="flex-1 w-full">
            {/* AI button positioned below textarea */}
          </div>
          <Button
            type="button"
            variant="secondary"
            className="mt-2 sm:mt-0 whitespace-nowrap"
            onClick={onAiSummarizeNotes}
            disabled={notesLoading || !formData.notes}
          >
            {notesLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400 mr-2"></div>
                Cleaning...
              </div>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-1 text-blue-500" />
                AI Summarize/Clean Up
              </>
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
  )
}
