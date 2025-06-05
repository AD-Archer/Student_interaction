/**
 * AISummaryCard component displays the AI-generated summary after form submission.
 * Shows up after successful interaction save with formatted summary content,
 * multiple AI action buttons for content enhancement, and navigation option back to the dashboard.
 */

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Target } from "lucide-react"
import { useRouter } from "next/navigation"

interface AISummaryCardProps {
  aiSummary: string
  isVisible: boolean
  onGenerateBriefSummary?: () => Promise<string>
  interactionData?: {
    studentName: string
    type: string
    reason: string
    notes: string
  }
}

export function AISummaryCard({ 
  aiSummary, 
  isVisible, 
  onGenerateBriefSummary,
  interactionData 
}: AISummaryCardProps) {
  const router = useRouter()
  const [showBriefSummary, setShowBriefSummary] = useState(false)
  const [displayBriefSummary, setDisplayBriefSummary] = useState("")

  if (!isVisible) return null

  // I handle generating and showing brief summary before navigation
  const handleGoToDashboard = async () => {
    if (onGenerateBriefSummary && interactionData && !displayBriefSummary) {
      setShowBriefSummary(true)
      try {
        const brief = await onGenerateBriefSummary()
        setDisplayBriefSummary(brief)
        // I auto-redirect after showing brief summary for 3 seconds
        setTimeout(() => {
          router.push('/')
        }, 3000)
      } catch (error) {
        console.error('Error generating brief summary:', error)
        router.push('/')
      }
    } else {
      router.push('/')
    }
  }

  // I render the brief summary screen before redirect
  if (showBriefSummary) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-800">
            <Target className="h-5 w-5" />
            <span>Interaction Summary</span>
          </CardTitle>
          <CardDescription>
            Quick overview before returning to dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-700">
              {displayBriefSummary || "Generating brief summary..."}
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 mb-2">
              Redirecting to dashboard in 3 seconds...
            </p>
            <Button variant="outline" onClick={() => router.push('/')}>
              Go Now
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-blue-800">
          <Sparkles className="h-5 w-5" />
          <span>AI Summary</span>
        </CardTitle>
        <CardDescription>
          Automatically generated summary of this interaction
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-white p-4 rounded-lg border">
          <div className="space-y-2">
            {aiSummary.split("\n").map((line: string, index: number) => (
              <div key={index} className="text-sm text-gray-700">
                {line}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 text-center">
          <Button variant="outline" onClick={handleGoToDashboard}>
            Go to Dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
