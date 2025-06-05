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
import { Sparkles, Wand2, FileText, TrendingUp, Target, Loader2 } from "lucide-react"
import { FormData } from "@/lib/data"
import { AIActionType } from "@/app/create/hooks/useAIFunctionality"

interface InteractionDetailsCardProps {
  formData: FormData
  onFormDataChange: (updates: Partial<FormData>) => void
  notesLoading: boolean
  aiError: string | null
  actionLoading?: AIActionType | null
  onPerformAIAction?: (action: AIActionType, content: string) => Promise<string>
}

export function InteractionDetailsCard({
  formData,
  onFormDataChange,
  notesLoading,
  aiError,
  actionLoading,
  onPerformAIAction
}: InteractionDetailsCardProps) {
  const handleReasonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFormDataChange({ reason: e.target.value })
  }

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onFormDataChange({ notes: e.target.value })
  }

  // I handle AI action button clicks
  const handleAIAction = async (action: AIActionType) => {
    if (!onPerformAIAction || !formData.notes) return
    
    try {
      const result = await onPerformAIAction(action, formData.notes)
      onFormDataChange({ notes: result })
    } catch (error) {
      console.error(`Error performing ${action} action:`, error)
    }
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

        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-700">
            AI Actions:
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAIAction('cleanup')}
              disabled={actionLoading === 'cleanup' || notesLoading || !formData.notes}
              className="flex items-center space-x-1"
            >
              {actionLoading === 'cleanup' ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Wand2 className="h-3 w-3" />
              )}
              <span>Clean Up</span>
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAIAction('summarize')}
              disabled={actionLoading === 'summarize' || notesLoading || !formData.notes}
              className="flex items-center space-x-1"
            >
              {actionLoading === 'summarize' ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <FileText className="h-3 w-3" />
              )}
              <span>Summarize</span>
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAIAction('enhance')}
              disabled={actionLoading === 'enhance' || notesLoading || !formData.notes}
              className="flex items-center space-x-1"
            >
              {actionLoading === 'enhance' ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <TrendingUp className="h-3 w-3" />
              )}
              <span>Enhance</span>
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAIAction('glows-grows')}
              disabled={actionLoading === 'glows-grows' || notesLoading || !formData.notes}
              className="flex items-center space-x-1"
            >
              {actionLoading === 'glows-grows' ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Target className="h-3 w-3" />
              )}
              <span>Glows & Grows</span>
            </Button>
          </div>
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
