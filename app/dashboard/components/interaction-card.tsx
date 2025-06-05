// -----------------------------------------------------------------------------
// interaction-card.tsx
// This component displays a summary card for a student interaction, including
// follow-up status, staff, and action buttons. Now features a modern glassmorphism
// design, vibrant gradients, playful accents, and improved layout for a more engaging
// and premium dashboard experience. All logic remains unchanged; only the UI/UX is enhanced.
// -----------------------------------------------------------------------------

"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, Clock, User, Eye, Edit, Mail, ArchiveRestore, Archive, AlertTriangle } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import { useEmailFunctionality } from "@/app/create/hooks/useEmailFunctionality"
import { useState } from "react"
// import { students, staffMembers } from "@/lib/data" // <-- removed, fetch from API instead

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
  studentEmail?: string // add for email functionality
  staffEmail?: string   // add for email functionality
  cohort?: string | number // Add cohort for dashboard display
  phase?: string // Add phase for dashboard display
}

interface InteractionCardProps {
  interaction: Interaction
  onViewInsights: (title: string, notes: string[]) => void
  onArchive?: (id: string, archive: boolean) => Promise<void>
}

export function InteractionCard({ interaction, onViewInsights, onArchive }: InteractionCardProps) {
  const [archiving, setArchiving] = useState(false)
  const [showConfirm, setShowConfirm] = useState<null | "archive" | "unarchive">(null)
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [emailFeedback, setEmailFeedback] = useState<string | null>(null)
  const { sendTestEmailWithNotes } = useEmailFunctionality()

  // Remove unused getStatusColor (no longer needed for card color)

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

  // Handler for sending follow-up email to student or staff
  const handleFollowUpSend = async (target: 'student' | 'staff') => {
    setShowEmailDialog(false)
    setEmailFeedback(null)
    // const student = students.find(s => s.id === interaction.studentId)
    // const staff = staffMembers.find(s => s.name === interaction.staffMember)
    // const studentEmail = student?.email
    // const staffEmail = staff?.email
    const studentEmail = interaction.studentEmail
    const staffEmail = interaction.staffEmail
    try {
      if (target === 'student' && studentEmail) {
        await sendTestEmailWithNotes(studentEmail, 'student', {
          studentId: interaction.studentId,
          studentName: interaction.studentName,
          interactionType: interaction.type,
          reason: interaction.reason,
          notes: interaction.notes,
          followUpDate: interaction.followUp?.date,
          staffEmail,
          studentEmail,
          followUpEmail: true,
        })
        setEmailFeedback('Follow-up email sent to student!')
        return
      }
      if (target === 'staff' && staffEmail) {
        await sendTestEmailWithNotes(staffEmail, 'staff', {
          studentId: interaction.studentId,
          studentName: interaction.studentName,
          interactionType: interaction.type,
          reason: interaction.reason,
          notes: interaction.notes,
          followUpDate: interaction.followUp?.date,
          staffEmail,
          studentEmail,
          followUpEmail: true,
        })
        setEmailFeedback('Follow-up email sent to staff!')
        return
      }
      setEmailFeedback('No email address available for selected recipient.')
    } catch {
      setEmailFeedback('Failed to send follow-up email.')
    }
  }

  // Unarchive button color
  const unarchiveButtonClass = interaction.isArchived
    ? "bg-black text-white hover:bg-gray-900 border-black"
    : ""

  // Remove excessive fading for archived
  const archivedOpacity = interaction.isArchived ? "opacity-100" : ""

  return (
    <Card
      className={`rounded-2xl border border-gray-100 bg-white/70 backdrop-blur-xl shadow-md hover:shadow-lg transition-all duration-200 ${archivedOpacity}`}
    >
      <CardContent className="p-5">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-blue-100">
                  <User className="h-5 w-5 text-blue-500" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 truncate">
                  {interaction.studentName}
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {interaction.cohort && (
                  <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 rounded-full px-3 py-1 text-xs font-semibold">
                    Cohort: {interaction.cohort}
                  </Badge>
                )}
                {interaction.phase && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 rounded-full px-3 py-1 text-xs font-semibold">
                    Phase: {interaction.phase}
                  </Badge>
                )}
                <Badge className={getTypeColor(interaction.type) + " rounded-full px-3 py-1 text-xs font-semibold"}>
                  {interaction.type}
                </Badge>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="ml-2 shrink-0 bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-100 transition-all duration-150"
              onClick={() => {
                onViewInsights(
                  `Summary for ${interaction.studentName}`,
                  interaction.notes.split("\n")
                );
              }}
              aria-label="View AI Insights"
            >
              <Eye className="h-5 w-5 text-blue-600" />
            </Button>
          </div>

          {/* Content */}
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-1">Reason</p>
              <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded-lg border border-gray-200">
                {interaction.reason}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-1">Description</p>
              <p className="text-sm text-gray-700 bg-blue-50 p-2 rounded-lg border border-blue-100">
                {interaction.notes}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <p className="font-semibold text-gray-700">Staff</p>
                <p className="text-gray-700">{interaction.staffMember}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Date</p>
                <p className="text-gray-700">
                  {interaction.date} at {interaction.time}
                </p>
              </div>
            </div>
            {/* Follow-up Status */}
            {interaction.followUp.required && (
              <div
                className={`flex flex-col sm:flex-row sm:items-center gap-2 p-2 rounded-lg border ${
                  interaction.followUp.overdue
                    ? "bg-red-50 text-red-700 border-red-200"
                    : "bg-yellow-50 text-yellow-700 border-yellow-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  {interaction.followUp.overdue ? (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  ) : (
                    <Clock className="h-4 w-4 text-yellow-500" />
                  )}
                  <span className="text-xs font-semibold">
                    Follow-up: {getFollowUpInfo(interaction.followUp.date).formatted}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {getFollowUpInfo(interaction.followUp.date).relative}
                </span>
              </div>
            )}
            {/* Action Buttons */}
            <div className="flex flex-row gap-2 pt-2 border-t border-gray-100 mt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 bg-blue-50 text-blue-700 font-semibold rounded-xl border border-blue-100 hover:bg-blue-100 transition-all duration-150"
                onClick={() => {
                  window.location.href = `/create?id=${interaction.id}`
                }}
                disabled={interaction.isArchived}
              >
                <Edit className="h-4 w-4 mr-1 text-blue-700" />
                Edit
              </Button>
              {interaction.followUp.required && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-pink-50 text-pink-700 font-semibold rounded-xl border border-pink-100 hover:bg-pink-100 transition-all duration-150"
                  disabled={interaction.isArchived}
                  onClick={() => setShowEmailDialog(true)}
                >
                  <Mail className="h-4 w-4 mr-1 text-pink-700" />
                  Follow-up
                </Button>
              )}
              {onArchive && (
                <Button
                  variant={interaction.isArchived ? "default" : "destructive"}
                  size="sm"
                  className={`flex-1 ${unarchiveButtonClass} rounded-xl border border-gray-200 hover:bg-gray-100 transition-all duration-150`}
                  onClick={() => setShowConfirm(interaction.isArchived ? "unarchive" : "archive")}
                  disabled={archiving}
                >
                  {interaction.isArchived ? (
                    <>
                      <ArchiveRestore className="h-4 w-4 mr-1" /> Unarchive
                    </>
                  ) : (
                    <>
                      <Archive className="h-4 w-4 mr-1" /> Archive
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
          {/* Confirmation Alert */}
          {showConfirm && (
            <div className="mt-4 p-3 rounded-lg border border-pink-200 bg-pink-50 flex items-center gap-3 shadow">
              <AlertTriangle className="h-5 w-5 text-pink-600" />
              <span className="flex-1 text-pink-900 font-semibold text-xs">
                {showConfirm === "archive"
                  ? "Are you sure you want to archive this interaction?"
                  : "Are you sure you want to unarchive this interaction?"}
              </span>
              <Button
                size="sm"
                className="bg-pink-600 text-white hover:bg-pink-700 border-pink-600 mr-2 rounded-xl"
                onClick={handleArchive}
                disabled={archiving}
              >
                Yes
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl"
                onClick={() => setShowConfirm(null)}
              >
                Cancel
              </Button>
            </div>
          )}
          {/* Email dialog for follow-up */}
          {showEmailDialog && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
              <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full">
                <div className="mb-4 font-bold text-lg text-blue-700 flex items-center gap-2">
                  <Mail className="h-5 w-5 text-pink-600" />
                  Send Follow-up Email
                </div>
                <div className="mb-4 text-sm text-gray-700">Who do you want to send the follow-up email to?</div>
                <div className="flex gap-2 mb-2">
                  <Button size="sm" className="rounded-xl" onClick={() => handleFollowUpSend('student')} disabled={!interaction.studentEmail}>
                    Student
                  </Button>
                  <Button size="sm" className="rounded-xl" onClick={() => handleFollowUpSend('staff')} disabled={!interaction.staffEmail}>
                    Staff
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-xl" onClick={() => setShowEmailDialog(false)}>
                    Cancel
                  </Button>
                </div>
                {emailFeedback && (
                  <div className={`text-sm mt-2 ${emailFeedback.includes('sent') ? 'text-green-600' : 'text-red-600'}`}>{emailFeedback}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * InteractionCard component
 * Displays a modern, minimal summary card for a student interaction, including key details like student name, staff member, and interaction type.
 * Uses clean glassmorphism, subtle gradients, and simple icons for a calm, premium look. All logic is unchanged; only the UI/UX is streamlined for clarity and modernity.
 */
