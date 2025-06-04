/**
 * AISummaryCard component displays the AI-generated summary after form submission.
 * Shows up after successful interaction save with formatted summary content and
 * navigation option back to the dashboard.
 */

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"

interface AISummaryCardProps {
  aiSummary: string
  isVisible: boolean
}

export function AISummaryCard({ aiSummary, isVisible }: AISummaryCardProps) {
  const router = useRouter()

  if (!isVisible) return null

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
            {aiSummary.split("\n").map((line, index) => (
              <div key={index} className="text-sm text-gray-700">
                {line}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 text-center">
          <Button variant="outline" onClick={() => router.push('/')}>
            Go to Dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
