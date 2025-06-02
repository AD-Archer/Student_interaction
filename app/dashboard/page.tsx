// -----------------------------------------------------------------------------
// app/dashboard/page.tsx
// Dashboard page for Launchpad Philly Student Interaction Tracker.
// This page displays recent student interactions, stats, and allows filtering,
// searching, and editing. Interactions are loaded from the database via API
// endpoints, providing real-time data persistence and consistency.
// -----------------------------------------------------------------------------

"use client"

import { useEffect, useState } from "react"
import { interactionsAPI, studentsAPI, staffAPI, interactionTypesAPI } from "@/lib/api"
import { useAuth } from "@/components/auth-wrapper"
import { 
  HeroSection, 
  StatsGrid, 
  SearchAndFilters, 
  InteractionsList, 
  AiInsightsPanel 
} from "./components"
import { Interaction, Student, StaffMember, InteractionTypeOption } from "@/lib/data"

export default function Page() {
  const { user: activeUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStudent, setSelectedStudent] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedStaff, setSelectedStaff] = useState("all")
  const [showAiInsights, setShowAiInsights] = useState(false)
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [interactionTypes, setInteractionTypes] = useState<InteractionTypeOption[]>([])
  const [loading, setLoading] = useState(true)
  const [aiPanelData, setAiPanelData] = useState<{ title: string; notes: string[] }>({ title: "", notes: [] });

  // Load all data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Fetch all data in parallel
        const [interactionsData, studentsData, staffData, typesData] = await Promise.all([
          interactionsAPI.getAll(),
          studentsAPI.getAll(),
          staffAPI.getAll(),
          interactionTypesAPI.getAll()
        ])
        
        setInteractions(interactionsData)
        setStudents(studentsData)
        setStaff(staffData)
        setInteractionTypes(typesData)
      } catch (error) {
        console.error('Error loading data:', error)
        // TODO: Show error message to user
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  const filteredInteractions = interactions.filter((interaction) => {
    // Enhanced search functionality to search by first name, last name, or ID
    const searchTermLower = searchTerm.toLowerCase()
    
    const matchesSearch =
      // Student name search (first or last name)
      interaction.studentName.toLowerCase().includes(searchTermLower) ||
      // Student ID search
      interaction.studentId.includes(searchTermLower) ||
      // Content search
      interaction.reason.toLowerCase().includes(searchTermLower) ||
      interaction.notes.toLowerCase().includes(searchTermLower) ||
      // Staff member search (first or last name)
      interaction.staffMember.toLowerCase().includes(searchTermLower)
      
    // Filter by selected student
    const matchesStudent = selectedStudent === "all" || interaction.studentId === selectedStudent
    
    // Filter by selected interaction type
    const matchesType = selectedType === "all" || interaction.type.toLowerCase().includes(selectedType)
    
    // Filter by staff member
    const matchesStaff = selectedStaff === "all" || (() => {
      const selectedStaffMember = staff.find(sm => sm.id.toString() === selectedStaff)
      return selectedStaffMember ? interaction.staffMember === `${selectedStaffMember.firstName} ${selectedStaffMember.lastName}` : false
    })()

    return matchesSearch && matchesStudent && matchesType && matchesStaff
  })

  const handleViewInsights = (title: string, notes: string[]) => {
    setAiPanelData({ title, notes });
    setShowAiInsights(true);
  }

  // Calculate stats
  const overdueCount = interactions.filter((i) => i.followUp.overdue).length
  const pendingCount = interactions.filter((i) => i.followUp.required && !i.followUp.overdue).length

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
              totalInteractions={interactions.length}
              pendingCount={pendingCount}
              overdueCount={overdueCount}
              loading={loading}
            />

            {/* Search and Filters */}
            <SearchAndFilters 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedStudent={selectedStudent}
              setSelectedStudent={setSelectedStudent}
              selectedType={selectedType}
              setSelectedType={setSelectedType}
              selectedStaff={selectedStaff}
              setSelectedStaff={setSelectedStaff}
              filteredCount={filteredInteractions.length}
              students={students}
              interactionTypes={interactionTypes}
              staff={staff}
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
                }))}
                showAiInsights={showAiInsights}
                setShowAiInsights={setShowAiInsights}
                onViewInsights={handleViewInsights}
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
