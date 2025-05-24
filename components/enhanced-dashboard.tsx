"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  CalendarDays,
  User,
  MessageSquare,
  AlertCircle,
  Search,
  Plus,
  Eye,
  Edit,
  Sparkles,
  Mail,
  Clock,
  Users,
  BarChart3,
  Filter,
} from "lucide-react"
import Link from "next/link"
import { AppHeader } from "@/components/app-header"
import { AiInsightsPanel } from "@/components/ai-insights-panel"

const interactions = [
  {
    id: 1,
    studentName: "Micheal Newman",
    studentId: "0001",
    program: "foundations",
    type: "Coaching",
    reason: "Job interview preparation",
    notes:
      "Worked on interview skills, practiced common questions, discussed professional attire. Student showed good progress and confidence.",
    date: "2024-12-12",
    time: "10:30 AM",
    staffMember: "Tahir Lee",
    status: "completed",
    followUp: { required: true, date: "2024-12-20", overdue: false },
    aiSummary:
      "Student received coaching on interview preparation with focus on confidence building and professional presentation.",
  },
  {
    id: 2,
    studentName: "Amira Johnson",
    studentId: "0002",
    program: "101",
    type: "Academic Support",
    reason: "Course planning assistance",
    notes:
      "Reviewed current course load, discussed upcoming semester options, identified areas needing additional support.",
    date: "2024-12-11",
    time: "2:15 PM",
    staffMember: "Barbara Cicalese",
    status: "completed",
    followUp: { required: true, date: "2024-12-18", overdue: false },
    aiSummary:
      "Academic planning session focused on course selection and identifying support needs for upcoming semester.",
  },
  {
    id: 3,
    studentName: "Koleona Smith",
    studentId: "0003",
    program: "lightspeed",
    type: "Career Counseling",
    reason: "Industry exploration",
    notes:
      "Explored different career paths in technology, discussed internship opportunities, reviewed portfolio development.",
    date: "2024-12-10",
    time: "11:00 AM",
    staffMember: "Charles Mitchell",
    status: "completed",
    followUp: { required: false },
    aiSummary:
      "Career exploration session covering technology industry opportunities and portfolio development strategies.",
  },
  {
    id: 4,
    studentName: "Zaire Williams",
    studentId: "0004",
    program: "liftoff",
    type: "Performance Improvement",
    reason: "Attendance improvement",
    notes:
      "Discussed attendance patterns, identified barriers to consistent attendance, developed action plan for improvement.",
    date: "2024-12-09",
    time: "9:45 AM",
    staffMember: "Tahir Lee",
    status: "completed",
    followUp: { required: true, date: "2024-12-15", overdue: true },
    aiSummary:
      "Performance improvement plan established to address attendance issues with specific action items and timeline.",
  },
  {
    id: 5,
    studentName: "Micheal Newman",
    studentId: "0001",
    program: "foundations",
    type: "Behavioral Intervention",
    reason: "Classroom disruption",
    notes:
      "Addressed recent classroom behavior issues, discussed expectations and consequences, student was receptive to feedback.",
    date: "2024-12-08",
    time: "3:30 PM",
    staffMember: "Barbara Cicalese",
    status: "completed",
    followUp: { required: true, date: "2024-12-16", overdue: false },
    aiSummary:
      "Behavioral intervention addressing classroom disruptions with clear expectations and follow-up plan established.",
  },
  {
    id: 6,
    studentName: "Amira Johnson",
    studentId: "0002",
    program: "101",
    type: "Coaching",
    reason: "Time management skills",
    notes: "Worked on developing better time management strategies, introduced planning tools and techniques.",
    date: "2024-12-07",
    time: "1:00 PM",
    staffMember: "Charles Mitchell",
    status: "completed",
    followUp: { required: false },
    aiSummary: "Time management coaching session introducing planning strategies and organizational tools.",
  },
]

const students = [
  { id: "all", name: "All Students" },
  { id: "0001", name: "Micheal Newman" },
  { id: "0002", name: "Amira Johnson" },
  { id: "0003", name: "Koleona Smith" },
  { id: "0004", name: "Zaire Williams" },
]

const interactionTypes = [
  { value: "all", label: "All Types" },
  { value: "coaching", label: "Coaching" },
  { value: "academic", label: "Academic Support" },
  { value: "career", label: "Career Counseling" },
  { value: "performance", label: "Performance Improvement" },
  { value: "behavioral", label: "Behavioral Intervention" },
]

export function EnhancedDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStudent, setSelectedStudent] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedInteraction, setSelectedInteraction] = useState<(typeof interactions)[0] | null>(null)
  const [showAiPanel, setShowAiPanel] = useState(false)

  const filteredInteractions = interactions.filter((interaction) => {
    const matchesSearch =
      interaction.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interaction.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interaction.notes.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStudent = selectedStudent === "all" || interaction.studentId === selectedStudent
    const matchesType = selectedType === "all" || interaction.type.toLowerCase().includes(selectedType)

    return matchesSearch && matchesStudent && matchesType
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <AppHeader />

      <main className={`transition-all duration-300 ${showAiPanel ? "mr-96" : ""}`}>
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Welcome back, Tahir!</h1>
                  <p className="text-blue-100 text-lg">
                    You have {interactions.filter((i) => i.followUp.overdue).length} overdue follow-ups and{" "}
                    {interactions.filter((i) => i.followUp.required && !i.followUp.overdue).length} pending tasks.
                  </p>
                </div>
                <div className="flex space-x-3">
                  <Button
                    variant="secondary"
                    onClick={() => setShowAiPanel(!showAiPanel)}
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    AI Insights
                  </Button>
                  <Link href="/create">
                    <Button variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                      <Plus className="h-4 w-4 mr-2" />
                      New Interaction
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total Interactions</p>
                      <p className="text-3xl font-bold text-blue-900">{interactions.length}</p>
                      <p className="text-xs text-blue-600 mt-1">+2 from yesterday</p>
                    </div>
                    <div className="bg-blue-200 p-3 rounded-full">
                      <MessageSquare className="h-6 w-6 text-blue-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Active Students</p>
                      <p className="text-3xl font-bold text-green-900">4</p>
                      <p className="text-xs text-green-600 mt-1">All programs</p>
                    </div>
                    <div className="bg-green-200 p-3 rounded-full">
                      <Users className="h-6 w-6 text-green-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-600">Pending Follow-ups</p>
                      <p className="text-3xl font-bold text-yellow-900">
                        {interactions.filter((i) => i.followUp.required && !i.followUp.overdue).length}
                      </p>
                      <p className="text-xs text-yellow-600 mt-1">Due this week</p>
                    </div>
                    <div className="bg-yellow-200 p-3 rounded-full">
                      <Clock className="h-6 w-6 text-yellow-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-600">Overdue Follow-ups</p>
                      <p className="text-3xl font-bold text-red-900">
                        {interactions.filter((i) => i.followUp.overdue).length}
                      </p>
                      <p className="text-xs text-red-600 mt-1">Needs attention</p>
                    </div>
                    <div className="bg-red-200 p-3 rounded-full">
                      <AlertCircle className="h-6 w-6 text-red-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions & Filters */}
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                  <div className="flex flex-col md:flex-row gap-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search interactions, students, or notes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-gray-300 focus:border-blue-500"
                      />
                    </div>

                    <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                      <SelectTrigger className="w-48">
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
                      <SelectTrigger className="w-48">
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
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      More Filters
                    </Button>
                    <Button variant="outline" size="sm">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Analytics
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interactions List */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Recent Interactions</h2>
                <Badge variant="outline" className="text-gray-600">
                  {filteredInteractions.length} results
                </Badge>
              </div>

              {filteredInteractions.map((interaction) => (
                <Card
                  key={interaction.id}
                  className={`hover:shadow-lg transition-all duration-200 ${getStatusColor(interaction)}`}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-4 flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="bg-gray-100 p-2 rounded-full">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900">{interaction.studentName}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className={getProgramColor(interaction.program)}>
                                {interaction.program}
                              </Badge>
                              <Badge className={getTypeColor(interaction.type)}>{interaction.type}</Badge>
                              <span className="text-sm text-gray-500">ID: {interaction.studentId}</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-14">
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">Reason:</p>
                            <p className="text-sm text-gray-600 bg-red-50 p-2 rounded border border-red-200">
                              {interaction.reason}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">Staff Member:</p>
                            <p className="text-sm text-gray-600">{interaction.staffMember}</p>
                          </div>
                        </div>

                        <div className="pl-14">
                          <p className="text-sm font-medium text-gray-700 mb-1">Notes:</p>
                          <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded border border-blue-200 line-clamp-2">
                            {interaction.notes}
                          </p>
                        </div>

                        <div className="flex items-center space-x-6 text-sm text-gray-500 pl-14">
                          <span className="flex items-center space-x-1">
                            <CalendarDays className="h-4 w-4" />
                            <span>
                              {interaction.date} at {interaction.time}
                            </span>
                          </span>
                          {interaction.followUp.required && (
                            <span
                              className={`flex items-center space-x-1 px-2 py-1 rounded-full ${
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
                              <span>
                                Follow-up: {interaction.followUp.date}
                                {interaction.followUp.overdue && " (Overdue)"}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2 ml-6">
                        <Button variant="outline" size="sm" onClick={() => setSelectedInteraction(interaction)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        {interaction.followUp.required && (
                          <Button variant="outline" size="sm" className="text-blue-600 hover:bg-blue-50">
                            <Mail className="h-4 w-4 mr-2" />
                            Follow-up
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredInteractions.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No interactions found</h3>
                  <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
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
        </div>
      </main>

      {/* AI Insights Panel */}
      <AiInsightsPanel isOpen={showAiPanel} onClose={() => setShowAiPanel(false)} />

      {/* Interaction Detail Modal */}
      {selectedInteraction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center space-x-2 text-xl">
                    <span>{selectedInteraction.studentName}</span>
                    <Badge className={getTypeColor(selectedInteraction.type)}>{selectedInteraction.type}</Badge>
                  </CardTitle>
                  <CardDescription className="text-base mt-2">
                    {selectedInteraction.date} at {selectedInteraction.time} • Staff: {selectedInteraction.staffMember}
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setSelectedInteraction(null)}>
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Reason</h4>
                <p className="text-gray-700 bg-red-50 p-4 rounded-lg border border-red-200">
                  {selectedInteraction.reason}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Notes</h4>
                <p className="text-gray-700 bg-blue-50 p-4 rounded-lg border border-blue-200 leading-relaxed">
                  {selectedInteraction.notes}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  <span>AI Summary</span>
                </h4>
                <p className="text-gray-700 bg-blue-50 p-4 rounded-lg border border-blue-200 leading-relaxed">
                  {selectedInteraction.aiSummary}
                </p>
              </div>

              {selectedInteraction.followUp.required && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Follow-up</h4>
                  <div
                    className={`p-4 rounded-lg border ${
                      selectedInteraction.followUp.overdue ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"
                    }`}
                  >
                    <p className="text-gray-700">
                      Scheduled for: {selectedInteraction.followUp.date}
                      {selectedInteraction.followUp.overdue && (
                        <span className="text-red-600 font-medium ml-2">(Overdue)</span>
                      )}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-6 border-t">
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Interaction
                </Button>
                {selectedInteraction.followUp.required && (
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Follow-up Email
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
