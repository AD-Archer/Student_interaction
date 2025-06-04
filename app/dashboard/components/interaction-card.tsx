// -----------------------------------------------------------------------------
// interaction-card.tsx
// This component displays a summary card for a student interaction, including
// follow-up status, staff, and action buttons. Now includes Archive/Unarchive
// support. Used in the dashboard InteractionsList. Only the original staff
// creator is shown and cannot be changed after creation.
// -----------------------------------------------------------------------------

"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, Clock, User, Eye, Edit, Mail, ArchiveRestore, Archive, AlertTriangle } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import { useState } from "react"

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

interface InteractionCardProps {
  interaction: Interaction
  onViewInsights: (title: string, notes: string[]) => void
  onArchive?: (id: string, archive: boolean) => Promise<void>
}

export function InteractionCard({ interaction, onViewInsights, onArchive }: InteractionCardProps) {
  const [archiving, setArchiving] = useState(false)
  const [showConfirm, setShowConfirm] = useState<null | "archive" | "unarchive">(null)

  const getStatusColor = (interaction: Interaction) => {
    if (interaction.followUp.required && interaction.followUp.overdue) {
      return "border-l-4 border-l-red-500 bg-red-50"
    }
    if (interaction.followUp.required) {
      return "border-l-4 border-l-yellow-500 bg-yellow-50"
    }
    return "border-l-4 border-l-green-500 bg-white"
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      Coaching: "bg-blue-100 text-blue-800 border-blue-200",
      "Academic Support": "bg-green-100 text-green-800 border-green-200",
      "Career Counseling": "bg-purple-100 text-purple-800 border-purple-200",
      "Performance Improvement": "bg-orange-100 text-orange-800 border-orange-200",
      "Behavioral Intervention": "bg-red-100 text-red-800 border-red-200",
    }
    return colors[type] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const getProgramColor = (program: string) => {
    const colors: Record<string, string> = {
      foundations: "bg-blue-100 text-blue-700 border-blue-200",
      "101": "bg-green-100 text-green-700 border-green-200",
      lightspeed: "bg-purple-100 text-purple-700 border-purple-200",
      liftoff: "bg-orange-100 text-orange-700 border-orange-200",
    }
    return colors[program] || "bg-gray-100 text-gray-700 border-gray-200"
  }

  // Helper to format follow-up date and relative time
  const getFollowUpInfo = (dateStr: string) => {
    if (!dateStr) return { formatted: "N/A", relative: "" }
    const date = new Date(dateStr)
    const formatted = format(date, "MMM d, yyyy")
    const relative = formatDistanceToNow(date, { addSuffix: true })
    return { formatted, relative }
  }

  // Archive/unarchive handler with confirmation
  const handleArchive = async () => {
    setShowConfirm(null)
    if (!onArchive) return
    setArchiving(true)
    await onArchive(interaction.id, !interaction.isArchived)
    setArchiving(false)
  }

  // Card color for archived state
  const archivedCardColor = interaction.isArchived
    ? "bg-gray-100 border-gray-300"
    : getStatusColor(interaction)

  // Unarchive button color
  const unarchiveButtonClass = interaction.isArchived
    ? "bg-black text-white hover:bg-gray-900 border-black"
    : ""

  // Remove excessive fading for archived
  const archivedOpacity = interaction.isArchived ? "opacity-100" : ""

  return (
    <Card
      className={`hover:shadow-lg transition-all duration-200 ${archivedCardColor} ${archivedOpacity}`}
    >
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <div className="bg-gray-100 p-1.5 rounded-full">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
                <h3 className="font-semibold text-gray-900 truncate">
                  {interaction.studentName}
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={getProgramColor(interaction.program)}
                >
                  {interaction.program}
                </Badge>
                <Badge className={getTypeColor(interaction.type)}>
                  {interaction.type}
                </Badge>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="ml-2 shrink-0"
              onClick={() => {
                onViewInsights(
                  `Summary for ${interaction.studentName}`,
                  interaction.notes.split("\n")
                );
              }}
            >
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">View</span>
            </Button>
          </div>

          {/* Content */}
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                Reason:
              </p>
              <p className="text-sm text-gray-600 bg-red-50 p-2 rounded border border-red-200">
                {interaction.reason}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                Description:
              </p>
              <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded border border-gray-200">
                {interaction.notes}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="font-medium text-gray-700">Staff:</p>
                <p className="text-gray-600">{interaction.staffMember}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Date:</p>
                <p className="text-gray-600">
                  {interaction.date} at {interaction.time}
                </p>
              </div>
            </div>

            {/* Follow-up Status */}
            {interaction.followUp.required && (
              <div
                className={`flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 p-2 rounded-lg ${
                  interaction.followUp.overdue
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                <div className="flex items-center space-x-2">
                  {interaction.followUp.overdue ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : (
                    <Clock className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">
                    Follow-up: {getFollowUpInfo(interaction.followUp.date).formatted}
                  </span>
                </div>
                <span className="text-xs text-gray-700 pl-6 sm:pl-0 sm:ml-2">
                  {getFollowUpInfo(interaction.followUp.date).relative}
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  window.location.href = `/create?id=${interaction.id}`
                }}
                disabled={interaction.isArchived}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              {interaction.followUp.required && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-blue-600 hover:bg-blue-50"
                  disabled={interaction.isArchived}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Follow-up
                </Button>
              )}
              {onArchive && (
                <Button
                  variant={interaction.isArchived ? "default" : "destructive"}
                  size="sm"
                  className={`flex-1 ${unarchiveButtonClass}`}
                  onClick={() => setShowConfirm(interaction.isArchived ? "unarchive" : "archive")}
                  disabled={archiving}
                >
                  {interaction.isArchived ? (
                    <>
                      <ArchiveRestore className="h-4 w-4 mr-2" /> Unarchive
                    </>
                  ) : (
                    <>
                      <Archive className="h-4 w-4 mr-2" /> Archive
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
          {/* Confirmation Alert */}
          {showConfirm && (
            <div className="mt-4 p-3 rounded border border-pink-300 bg-pink-100 flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-pink-600" />
              <span className="flex-1 text-pink-900">
                {showConfirm === "archive"
                  ? "Are you sure you want to archive this interaction?"
                  : "Are you sure you want to unarchive this interaction?"}
              </span>
              <Button
                size="sm"
                className="bg-pink-600 text-white hover:bg-pink-700 border-pink-600 mr-2"
                onClick={handleArchive}
                disabled={archiving}
              >
                Yes
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowConfirm(null)}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * InteractionCard component
 * Displays a brief summary of an interaction, including key details like student name, staff member, and interaction type.
 * This component is used in the InteractionsList to provide a concise overview of each interaction.
 */
