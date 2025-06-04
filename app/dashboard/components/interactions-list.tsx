// -----------------------------------------------------------------------------
// interactions-list.tsx
// This component renders a list of InteractionCard components for the dashboard.
// It now supports archiving/unarchiving cards by calling the onArchive prop.
// -----------------------------------------------------------------------------

"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare, Plus, Sparkles } from "lucide-react"
import Link from "next/link"
import { InteractionCard } from "./interaction-card"

interface Interaction {
  id: string
  studentName: string
  studentId: string
  program: string
  type: string
  reason: string
  staffMember: string
  date: string
  time: string
  notes: string
  followUp: {
    required: boolean
    overdue: boolean
    date: string
  }
  isArchived?: boolean
}

interface InteractionsListProps {
  interactions: Interaction[]
  showAiInsights: boolean
  setShowAiInsights: (show: boolean) => void
  onViewInsights: (title: string, notes: string[]) => void
  onArchive?: (id: string, archive: boolean) => Promise<void>
}

export function InteractionsList({ 
  interactions, 
  showAiInsights, 
  setShowAiInsights, 
  onViewInsights,
  onArchive
}: InteractionsListProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          Recent Interactions
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAiInsights(!showAiInsights)}
        >
          <Sparkles className="h-4 w-4 mr-1" />
          {showAiInsights ? 'Hide Insights' : 'Show Insights'}
        </Button>
      </div>
      
      {interactions.map((interaction) => (
        <InteractionCard 
          key={interaction.id} 
          interaction={interaction} 
          onViewInsights={onViewInsights}
          onArchive={onArchive}
        />
      ))}

      {interactions.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No interactions found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search or filter criteria
            </p>
            <Link href="/create">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create First Interaction
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
