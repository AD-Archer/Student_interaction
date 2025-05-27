// -----------------------------------------------------------------------------
// app/dashboard/page.tsx
// Dashboard page for Launchpad Philly Student Interaction Tracker.
// This page displays recent student interactions, stats, and allows filtering,
// searching, and editing. Interactions are loaded from the database via API
// endpoints, providing real-time data persistence and consistency.
// -----------------------------------------------------------------------------

"use client"

import { useEffect, useState } from "react"
import { students, interactionTypeOptions as interactionTypes, staffMembers } from "@/lib/data"
import { interactionsAPI } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sparkles,
  MessageSquare,
  Users,
  Plus,
  BarChart3,
  Clock,
  AlertCircle,
  Search,
  Filter,
  ChevronRight,
  User,
  Eye,
  Edit,
  Mail,
} from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AiInsightsPanel } from "./components/ai-insights-panel"
import { useAuth } from "@/components/auth-wrapper"

export default function Page() {
  const { user: activeUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStudent, setSelectedStudent] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedStaff, setSelectedStaff] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [showAiInsights, setShowAiInsights] = useState(false)
  const [interactions, setInteractions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [aiPanelData, setAiPanelData] = useState<{ title: string; notes: string[] }>({ title: "", notes: [] });

  // Load interactions from API
  useEffect(() => {
    const loadInteractions = async () => {
      try {
        setLoading(true)
        const data = await interactionsAPI.getAll()
        setInteractions(data)
      } catch (error) {
        console.error('Error loading interactions:', error)
        // TODO: Show error message to user
      } finally {
        setLoading(false)
      }
    }
    
    loadInteractions()
  }, [])

  // Transform staffMembers to use in filter dropdown
  const staffOptions = [
    { id: "all", name: "All Staff" },
    ...staffMembers.map(staff => ({ id: staff.id.toString(), name: staff.name }))
  ]

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
    const matchesStaff = selectedStaff === "all" || 
      interaction.staffMember === staffMembers.find(sm => sm.id.toString() === selectedStaff)?.name

    return matchesSearch && matchesStudent && matchesType && matchesStaff
  })

  const getStatusColor = (interaction: (typeof interactions)[0]) => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 relative flex">
      {/* Main Content */}
      <div className="flex-1">
        <div className="relative z-10">
        </div>

        <main className="pb-6">
          <div className="px-4 sm:px-6 lg:px-8 space-y-6">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 sm:p-6 lg:p-8 text-white mt-4">
              <div className="space-y-4">
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
                    Welcome back, {activeUser?.name || "User"}!
                  </h1>
                  {loading ? (
                    <p className="text-blue-100 text-sm sm:text-base lg:text-lg mt-2">
                      Loading interactions...
                    </p>
                  ) : (
                    <p className="text-blue-100 text-sm sm:text-base lg:text-lg mt-2">
                      You have{" "}
                      {interactions.filter((i) => i.followUp.overdue).length} overdue
                      follow-ups and{" "}
                      {interactions.filter(
                        (i) => i.followUp.required && !i.followUp.overdue
                      ).length}{" "}
                      pending tasks.
                    </p>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/create" className="flex-1">
                    <Button
                      variant="secondary"
                      className="w-full bg-white text-blue-600 hover:bg-gray-100"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Interaction
                    </Button>
                  </Link>
                  <Link href="/analytics" className="flex-1">
                    <Button
                      variant="secondary"
                      className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30"
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Analytics
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Stats Grid - Mobile Responsive */}
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                {[1,2,3,4].map((i) => (
                  <Card key={i} className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
                    <CardContent className="p-3 sm:p-4 lg:p-6">
                      <div className="animate-pulse">
                        <div className="bg-gray-300 h-8 w-8 rounded-full mb-2"></div>
                        <div className="bg-gray-300 h-4 w-16 rounded mb-1"></div>
                        <div className="bg-gray-300 h-8 w-12 rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <div className="text-center lg:text-left">
                    <div className="flex items-center justify-center lg:justify-start mb-2">
                      <div className="bg-blue-200 p-2 rounded-full">
                        <MessageSquare className="h-4 w-4 lg:h-5 lg:w-5 text-blue-700" />
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-blue-600">
                      Total
                    </p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-900">
                      {interactions.length}
                    </p>
                    <p className="text-xs text-blue-600 mt-1 hidden sm:block">
                      +2 from yesterday
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <div className="text-center lg:text-left">
                    <div className="flex items-center justify-center lg:justify-start mb-2">
                      <div className="bg-green-200 p-2 rounded-full">
                        <Users className="h-4 w-4 lg:h-5 lg:w-5 text-green-700" />
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-green-600">
                      Students
                    </p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-900">
                      4
                    </p>
                    <p className="text-xs text-green-600 mt-1 hidden sm:block">
                      All programs
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <div className="text-center lg:text-left">
                    <div className="flex items-center justify-center lg:justify-start mb-2">
                      <div className="bg-yellow-200 p-2 rounded-full">
                        <Clock className="h-4 w-4 lg:h-5 lg:w-5 text-yellow-700" />
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-yellow-600">
                      Pending
                    </p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-900">
                      {interactions.filter(
                        (i) => i.followUp.required && !i.followUp.overdue
                      ).length}
                    </p>
                    <p className="text-xs text-yellow-600 mt-1 hidden sm:block">
                      Due this week
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <div className="text-center lg:text-left">
                    <div className="flex items-center justify-center lg:justify-start mb-2">
                      <div className="bg-red-200 p-2 rounded-full">
                        <AlertCircle className="h-4 w-4 lg:h-5 lg:w-5 text-red-700" />
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-red-600">
                      Overdue
                    </p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-900">
                      {interactions.filter((i) => i.followUp.overdue).length}
                    </p>
                    <p className="text-xs text-red-600 mt-1 hidden sm:block">
                      Needs attention
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
            )}

            {/* Search and Filters - Mobile Optimized */}
            <Card className="shadow-lg">
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search interactions, students, or notes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-gray-300 focus:border-blue-500"
                    />
                  </div>

                  {/* Filter Toggle */}
                  <div className="flex justify-between items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFilters(!showFilters)}
                      className="flex items-center space-x-2"
                    >
                      <Filter className="h-4 w-4" />
                      <span>Filters</span>
                      <ChevronRight
                        className={`h-4 w-4 transition-transform ${
                          showFilters ? "rotate-90" : ""
                        }`}
                      />
                    </Button>
                    <Badge variant="outline" className="text-gray-600">
                      {filteredInteractions.length} results
                    </Badge>
                  </div>

                  {/* Collapsible Filters */}
                  {showFilters && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
                      <Select
                        value={selectedStudent}
                        onValueChange={setSelectedStudent}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Filter by student" />
                        </SelectTrigger>
                        <SelectContent>
                          {students.map((student) => (
                            <SelectItem key={student.id} value={student.id}>
                              {student.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={selectedType} onValueChange={setSelectedType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Filter by type" />
                        </SelectTrigger>
                        <SelectContent>
                          {interactionTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                        <SelectTrigger>
                          <SelectValue placeholder="Filter by staff" />
                        </SelectTrigger>
                        <SelectContent>
                          {staffOptions.map((staff) => (
                            <SelectItem key={staff.id} value={staff.id}>
                              {staff.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Interactions List - Mobile Optimized */}
            <div className="relative">
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
                {filteredInteractions.map((interaction) => (
                  <Card
                    key={interaction.id}
                    className={`hover:shadow-lg transition-all duration-200 ${getStatusColor(
                      interaction
                    )}`}
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
                              <span className="text-xs text-gray-500">
                                ID: {interaction.studentId}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="ml-2 shrink-0"
                            onClick={() => {
                              setAiPanelData({
                                title: `Summary for ${interaction.studentName}`,
                                notes: interaction.notes.split("\n"),
                              });
                              setShowAiInsights(true);
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
                              className={`flex items-center space-x-2 p-2 rounded-lg ${
                                interaction.followUp.overdue
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {interaction.followUp.overdue ? (
                                <AlertCircle className="h-4 w-4" />
                              ) : (
                                <Clock className="h-4 w-4" />
                              )}
                              <span className="text-sm font-medium">
                                Follow-up: {interaction.followUp.date}
                                {interaction.followUp.overdue && " (Overdue)"}
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
                                // Navigate to /create with the interaction ID as a query parameter
                                window.location.href = `/create?id=${interaction.id}`;
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            {interaction.followUp.required && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 text-blue-600 hover:bg-blue-50"
                              >
                                <Mail className="h-4 w-4 mr-2" />
                                Follow-up
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredInteractions.length === 0 && (
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
              {/* Sidebar for AI Insights, absolutely positioned */}
              {showAiInsights && (
                <div className="absolute top-0 right-0 w-96 ml-4">
                  <AiInsightsPanel isOpen={showAiInsights} onClose={() => setShowAiInsights(false)} title={aiPanelData.title} notes={aiPanelData.notes} />
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
