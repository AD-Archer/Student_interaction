// -----------------------------------------------------------------------------
// app/dashboard/page.tsx
// Dashboard page for Launchpad Philly Student Interaction Tracker.
// This page displays recent student interactions, stats, and allows filtering,
// searching, and editing. Interactions are loaded from the database via API
// endpoints, providing real-time data persistence and consistency.
//
// NOTE: We recalculate the overdue status for each interaction on the fly
// based on the current date and the follow-up date, to ensure the UI is always
// accurate regardless of backend data. This affects stats and all components
// that display overdue status.
// -----------------------------------------------------------------------------

"use client"

import { useEffect, useState } from "react"
import { interactionsAPI, staffAPI } from "@/lib/api"
import { useAuth } from "@/components/auth-wrapper"
import { 
  HeroSection, 
  StatsGrid, 
  SearchAndFilters, 
  InteractionsList, 
  AiInsightsPanel
} from "./components"

import { Interaction, StaffMember } from "@/lib/data"

// Helper to recalculate overdue status based on followUp.date
const withCalculatedOverdue = (interaction: Interaction): Interaction => {
  // If no follow-up required, just return as is
  if (!interaction.followUp?.required || !interaction.followUp?.date) {
    return {
      ...interaction,
      followUp: {
        ...interaction.followUp,
        overdue: false,
      },
    }
  }
  // Compare follow-up date to today (ignore time)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const followUpDate = new Date(interaction.followUp.date)
  followUpDate.setHours(0, 0, 0, 0)
  // If follow-up date is before today, it's overdue
  const overdue = followUpDate < today
  return {
    ...interaction,
    followUp: {
      ...interaction.followUp,
      overdue,
    },
  }
}

export default function Page() {
  const { user: activeUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCohort, setSelectedCohort] = useState("all");
  const [sortOrder, setSortOrder] = useState("mostRecent"); // Options: "mostRecent", "oldest"
  const [showAiInsights, setShowAiInsights] = useState(false)
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [aiPanelData, setAiPanelData] = useState<{ title: string; notes: string[] }>({ title: "", notes: [] });
  const [showArchived, setShowArchived] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState("all")

  // Load all data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Fetch all data in parallel
        const [interactionsData, staffData] = await Promise.all([
          interactionsAPI.getAll(),
          staffAPI.getAll()
        ])
        
        setInteractions(interactionsData)
        setStaff(staffData)
      } catch (error) {
        console.error('Error loading data:', error)
        // TODO: Show error message to user
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  // Always recalculate overdue status for all interactions
  const processedInteractions = interactions.map(withCalculatedOverdue)

  // Build staff options for filter dropdown
  const staffOptions = staff.map((s) => ({ id: s.id, name: s.name }))

  const filteredInteractions = processedInteractions
    .filter((interaction) => {
      const searchTermLower = searchTerm.toLowerCase();

      const matchesSearch =
        interaction.studentName.toLowerCase().includes(searchTermLower) ||
        interaction.reason.toLowerCase().includes(searchTermLower) ||
        interaction.notes.toLowerCase().includes(searchTermLower);

      const matchesCohort =
        selectedCohort === "all" || interaction.program.toLowerCase() === selectedCohort.toLowerCase();

      const matchesArchived = showArchived ? interaction.isArchived : !interaction.isArchived;

      const matchesStaff = selectedStaff === "all" || interaction.staffMember === staff.find(s => s.id === selectedStaff)?.name;

      return matchesSearch && matchesCohort && matchesArchived && matchesStaff;
    })
    .sort((a, b) => {
      if (sortOrder === "mostRecent") {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
    });

  const handleViewInsights = (title: string, notes: string[]) => {
    setAiPanelData({ title, notes });
    setShowAiInsights(true);
  }

  // Calculate stats using recalculated overdue
  const overdueCount = processedInteractions.filter((i) => i.followUp.overdue).length
  const pendingCount = processedInteractions.filter((i) => i.followUp.required && !i.followUp.overdue).length

  // Archive/unarchive handler for dashboard
  const handleArchive = async (id: string, archive: boolean) => {
    try {
      // Always send id as a number for the API
      const res = await fetch(`/api/interactions/${Number(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: archive }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        alert(err.error || 'Failed to archive interaction')
        return
      }
      // Refresh data after archiving
      const updated = await interactionsAPI.getAll()
      setInteractions(updated)
    } catch {
      alert('Failed to archive interaction')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 relative flex">
      {/* Main Content */}
      <div className="flex-1">
        <div className="relative z-10">
        </div>

        <main className="pb-6">
          <div className="px-4 sm:px-6 lg:px-8 space-y-6">
            {/* Hero Section */}
            <HeroSection 
              userName={activeUser ? `${activeUser.firstName} ${activeUser.lastName}` : "User"}
              overdueCount={overdueCount}
              pendingCount={pendingCount}
              loading={loading}
            />

            {/* Stats Grid */}
            <StatsGrid 
              totalInteractions={processedInteractions.length}
              pendingCount={pendingCount}
              overdueCount={overdueCount}
              loading={loading}
            />

            {/* Search and Filters */}
            <SearchAndFilters 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedCohort={selectedCohort}
              setSelectedCohort={setSelectedCohort}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              filteredCount={filteredInteractions.length}
              showArchived={showArchived}
              setShowArchived={setShowArchived}
              staffOptions={staffOptions}
              selectedStaff={selectedStaff}
              setSelectedStaff={setSelectedStaff}
            />

            {/* Interactions List */}
            <div className="relative">
              <InteractionsList 
                interactions={filteredInteractions.map(i => ({
                  ...i,
                  id: String(i.id),
                  followUp: {
                    ...i.followUp,
                    overdue: Boolean(i.followUp.overdue),
                    date: i.followUp.date ?? "",
                  },
                  isArchived: i.isArchived ?? false,
                }))}
                showAiInsights={showAiInsights}
                setShowAiInsights={setShowAiInsights}
                onViewInsights={handleViewInsights}
                onArchive={handleArchive}
              />
              
              {/* Sidebar for AI Insights, absolutely positioned */}
              {showAiInsights && (
                <div className="absolute top-0 right-0 w-96 ml-4">
                  <AiInsightsPanel 
                    isOpen={showAiInsights} 
                    onClose={() => setShowAiInsights(false)} 
                    title={aiPanelData.title} 
                    notes={aiPanelData.notes} 
                  />
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
