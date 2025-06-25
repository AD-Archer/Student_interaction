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
  const [selectedProgram, setSelectedProgram] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortOrder, setSortOrder] = useState("mostRecent"); // Options: "mostRecent", "oldest"
  const [showAiInsights, setShowAiInsights] = useState(false)
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [aiPanelData, setAiPanelData] = useState<{ title: string; notes: string[] }>({ title: "", notes: [] });
  const [showArchived, setShowArchived] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [cohortPhaseMap, setCohortPhaseMap] = useState<Record<string, string>>({});
  
  // I add state for analytics data from the database
  const [analyticsData, setAnalyticsData] = useState<{
    totalStudents: number
    totalInteractions: number
  }>({ totalStudents: 0, totalInteractions: 0 })

  // Load all data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Fetch all data in parallel including analytics
        const [interactionsData, staffData, analyticsResponse] = await Promise.all([
          interactionsAPI.getAll(),
          staffAPI.getAll(),
          fetch('/api/analytics')
        ])
        
        setInteractions(interactionsData)
        setStaff(staffData)
        
        // Parse analytics data
        if (analyticsResponse.ok) {
          const analytics = await analyticsResponse.json()
          setAnalyticsData({
            totalStudents: analytics.overview.totalStudents,
            totalInteractions: analytics.overview.totalInteractions
          })
        }
      } catch (error) {
        console.error('Error loading data:', error)
        // TODO: Show error message to user
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  // Fetch system settings for cohort-phase mapping
  useEffect(() => {
    const fetchCohortPhaseMap = async () => {
      try {
        const res = await fetch("/api/settings/system");
        if (res.ok) {
          const data = await res.json();
          setCohortPhaseMap(data.cohortPhaseMap || {});
        }
      } catch {
        // If this fails, fallback to empty mapping (phase fallback to program)
        setCohortPhaseMap({});
      }
    };
    fetchCohortPhaseMap();
  }, []);

  // Always recalculate overdue status for all interactions
  const processedInteractions = interactions.map(withCalculatedOverdue)

  // Helper to get phase for a cohort number
  const getPhaseForCohort = (cohortNum: string | number | null | undefined, program: string) => {
    if (!cohortNum) return program;
    const key = typeof cohortNum === 'number' ? String(cohortNum) : cohortNum;
    return cohortPhaseMap[key] || program;
  };

  // Helper to safely extract cohort from interaction
  function extractCohort(interaction: Interaction): string | number | undefined {
    // @ts-expect-error: backend may provide cohort directly or nested in student
    if (typeof interaction.cohort !== 'undefined') return interaction.cohort;
    // @ts-expect-error: backend may provide student object
    if (interaction.student && typeof interaction.student.cohort !== 'undefined') return interaction.student.cohort;
    return undefined;
  }

  // Attach cohort and phase to each processed interaction for filtering and display
  const processedWithCohortPhase = processedInteractions.map(i => {
    const cohort = extractCohort(i);
    return {
      ...i,
      cohort: cohort ?? '',
      phase: getPhaseForCohort(cohort ?? '', i.program),
    };
  })

  // Build staff options for filter dropdown
  const staffOptions = staff.map((s) => ({ id: s.id, name: s.name }))

  const filteredInteractions = processedWithCohortPhase
    .filter((interaction) => {
      const searchTermLower = searchTerm.toLowerCase();

      const matchesSearch =
        interaction.studentName.toLowerCase().includes(searchTermLower) ||
        interaction.reason.toLowerCase().includes(searchTermLower) ||
        interaction.notes.toLowerCase().includes(searchTermLower);

      // Filter by program (not cohort)
      const matchesProgram =
        selectedProgram === "all" || interaction.program === selectedProgram;

      // Filter by date range
      const interactionDate = new Date(interaction.date);
      const matchesDateFrom = !dateFrom || interactionDate >= new Date(dateFrom);
      const matchesDateTo = !dateTo || interactionDate <= new Date(dateTo);

      const matchesArchived = showArchived ? interaction.isArchived : !interaction.isArchived;

      const matchesStaff = selectedStaff === "all" || interaction.staffMember === staff.find(s => s.id === selectedStaff)?.name;

      const matchesType = selectedType === "all" || interaction.type === selectedType;

      return matchesSearch && matchesProgram && matchesDateFrom && matchesDateTo && matchesArchived && matchesStaff && matchesType;
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

  // Only include interactions for the current user (staff) for hero section
  const userFullName = activeUser ? `${activeUser.firstName} ${activeUser.lastName}` : null;
  const userInteractions = userFullName
    ? processedInteractions.filter(i => i.staffMember === userFullName)
    : [];

  // Calculate stats using recalculated overdue for ALL interactions (not just current user)
  const overdueCount = processedInteractions.filter((i) => i.followUp.overdue).length;
  const openCount = processedInteractions.filter((i) => i.status === "open").length;
  
  // Debug logging
  console.log('Debug overdue calculation:');
  console.log('Total interactions:', processedInteractions.length);
  console.log('Overdue interactions:', processedInteractions.filter((i) => i.followUp.overdue));
  console.log('Overdue count:', overdueCount);
  console.log('Open count:', openCount);
  
  // User-specific counts for hero section
  const userOverdueCount = userInteractions.filter((i) => i.followUp.overdue).length;
  const userPendingCount = userInteractions.filter((i) => i.followUp.required && !i.followUp.overdue).length;

  // Archive/unarchive handler for dashboard
  const handleArchive = async (id: string, archive: boolean) => {
    try {
      // Always send id as a number for the API
      const interactionId = Number(id)
      
      if (archive) {
        // Find the interaction to check its current status
        const currentInteraction = processedInteractions.find(i => Number(i.id) === interactionId)
        
        // If archiving and the interaction is open, close it first
        if (currentInteraction?.status === "open") {
          const statusRes = await fetch(`/api/interactions/${interactionId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "closed" }),
          })
          if (!statusRes.ok) {
            const err = await statusRes.json().catch(() => ({}))
            alert(err.error || 'Failed to close interaction before archiving')
            return
          }
        }
      }
      
      // Now proceed with archiving/unarchiving
      const res = await fetch(`/api/interactions/${interactionId}`, {
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

  // Status change handler for dashboard
  const handleStatusChange = async (id: string, status: string) => {
    try {
      // Always send id as a number for the API
      const res = await fetch(`/api/interactions/${Number(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        alert(err.error || 'Failed to update interaction status')
        return
      }
      // Refresh data after status change
      const updated = await interactionsAPI.getAll()
      setInteractions(updated)
    } catch {
      alert('Failed to update interaction status')
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
              overdueCount={userOverdueCount}
              pendingCount={userPendingCount}
              loading={loading}
            />

            {/* Stats Grid */}
            <StatsGrid 
              totalInteractions={analyticsData.totalInteractions}
              openCount={openCount}
              overdueCount={overdueCount}
              loading={loading}
              studentCount={analyticsData.totalStudents}
            />

            {/* Search and Filters */}
            <SearchAndFilters 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedProgram={selectedProgram}
              setSelectedProgram={setSelectedProgram}
              dateFrom={dateFrom}
              setDateFrom={setDateFrom}
              dateTo={dateTo}
              setDateTo={setDateTo}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              filteredCount={filteredInteractions.length}
              showArchived={showArchived}
              setShowArchived={setShowArchived}
              staffOptions={staffOptions}
              selectedStaff={selectedStaff}
              setSelectedStaff={setSelectedStaff}
              selectedType={selectedType}
              setSelectedType={setSelectedType}
            />

            {/* Interactions List */}
            <div className="relative">
              <InteractionsList 
                interactions={filteredInteractions.map(i => ({
                  ...i,
                  id: String(i.id),
                  status: i.status || 'open', // Ensure status is included
                  followUp: {
                    ...i.followUp,
                    overdue: Boolean(i.followUp.overdue),
                    date: i.followUp.date ?? "",
                  },
                  isArchived: i.isArchived ?? false,
                  cohort: i.cohort,
                  phase: i.phase,
                  isPIP: (i as unknown as { isPIP?: boolean }).isPIP ?? false, // Only use isPIP if it exists directly
                }))}
                showAiInsights={showAiInsights}
                setShowAiInsights={setShowAiInsights}
                onViewInsights={handleViewInsights}
                onArchive={handleArchive}
                onStatusChange={handleStatusChange}
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
