// -----------------------------------------------------------------------------
// page.tsx
// This is the main page for the /analytics route. It focuses on tracking important
// student interaction data like students needing interactions, required follow-ups,
// and program-specific metrics. The page allows filtering by program type (Foundations, 
// 101, and Liftoff) and provides actionable insights for staff members.
// -----------------------------------------------------------------------------

"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, Download, AlertCircle, Clock, Users } from "lucide-react"
import { useState, useEffect } from "react"
import { Loader } from "@/components/ui/loader"
import { interactions, formStudents } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InsightsOverview } from "./components/insights-overview"

// Identify students needing follow-up
const getFollowUpRequiredInteractions = () => {
  return interactions.filter(interaction => 
    interaction.followUp.required && 
    !interaction.followUp.overdue
  )
}

// Identify overdue follow-ups
const getOverdueFollowUps = () => {
  return interactions.filter(interaction => 
    interaction.followUp.required && 
    interaction.followUp.overdue
  )
}

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProgram, setSelectedProgram] = useState("all")
  // Stats derived from data
  const [stats, setStats] = useState({
    totalStudents: 0,
    needInteraction: 0,
    followUpsRequired: 0,
    followUpsOverdue: 0
  })

  // Calculate metrics based on selected program
  useEffect(() => {
    // Get follow-up metrics
    const followUpsRequired = getFollowUpRequiredInteractions().length
    const followUpsOverdue = getOverdueFollowUps().length
    
    // In a real app, you'd calculate students needing interaction
    // For now we'll just use a percentage of the total student count
    const totalStudentCount = formStudents.filter(student => 
      selectedProgram === "all" ? true : student.program === selectedProgram
    ).length
    
    // Simulate some students needing interaction (in real app this would be from DB)
    const studentsNeedingInteraction = Math.floor(totalStudentCount * 0.3)
    
    setStats({
      totalStudents: totalStudentCount,
      needInteraction: studentsNeedingInteraction,
      followUpsRequired: followUpsRequired,
      followUpsOverdue: followUpsOverdue
    })
  }, [selectedProgram])

  useEffect(() => {
    // Simulate data fetching
    const fetchData = async () => {
      setIsLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setIsLoading(false)
    }
    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <Loader />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <main className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="space-y-6 sm:space-y-8">
          {/* Header Section */}
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Student Interaction Analytics
              </h1>
              <p className="text-gray-600 mt-2">
                Track and manage important student interactions and follow-ups
              </p>
            </div>
            
            {/* Program Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Select 
                defaultValue="all" 
                onValueChange={(value) => setSelectedProgram(value)}
              >
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Program" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                  <SelectItem value="foundations">Foundations</SelectItem>
                  <SelectItem value="101">101</SelectItem>
                  <SelectItem value="liftoff">Liftoff</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 sm:flex-none">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
                <Button className="flex-1 sm:flex-none">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {/* Students Needing Interaction */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-3 sm:p-6">
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start mb-2">
                    <div className="bg-blue-200 p-2 rounded-full">
                      <Users className="h-4 w-4 lg:h-6 lg:w-6 text-blue-700" />
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-blue-600">Need Interaction</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-900">{stats.needInteraction}</p>
                  <div className="flex items-center justify-center lg:justify-start mt-1 sm:mt-2">
                    <span className="text-xs sm:text-sm text-blue-600">of {stats.totalStudents} students</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Follow-ups Required */}
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
              <CardContent className="p-3 sm:p-6">
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start mb-2">
                    <div className="bg-amber-200 p-2 rounded-full">
                      <Clock className="h-4 w-4 lg:h-6 lg:w-6 text-amber-700" />
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-amber-600">Follow-ups Needed</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-amber-900">{stats.followUpsRequired}</p>
                  <div className="flex items-center justify-center lg:justify-start mt-1 sm:mt-2">
                    <span className="text-xs sm:text-sm text-amber-600">scheduled follow-ups</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Overdue Follow-ups */}
            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <CardContent className="p-3 sm:p-6">
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start mb-2">
                    <div className="bg-red-200 p-2 rounded-full">
                      <AlertCircle className="h-4 w-4 lg:h-6 lg:w-6 text-red-700" />
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-red-600">Overdue</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-900">{stats.followUpsOverdue}</p>
                  <div className="flex items-center justify-center lg:justify-start mt-1 sm:mt-2">
                    <span className="text-xs sm:text-sm text-red-600">require immediate action</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Program Statistics */}
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-3 sm:p-6">
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start mb-2">
                    <div className="bg-green-200 p-2 rounded-full">
                      <Users className="h-4 w-4 lg:h-6 lg:w-6 text-green-700" />
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-green-600">
                    {selectedProgram === "all" ? "All Programs" : selectedProgram}
                  </p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-900">{stats.totalStudents}</p>
                  <div className="flex items-center justify-center lg:justify-start mt-1 sm:mt-2">
                    <span className="text-xs sm:text-sm text-green-600">total students</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Student Lists */}
          <Tabs defaultValue="needInteraction" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="needInteraction">Need Interaction</TabsTrigger>
              <TabsTrigger value="followUps">Follow-ups</TabsTrigger>
              <TabsTrigger value="overdue">Overdue</TabsTrigger>
            </TabsList>
            
            {/* Need Interaction Tab */}
            <TabsContent value="needInteraction">
              <Card>
                <CardHeader>
                  <CardTitle>Students Needing Interaction</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {stats.needInteraction > 0 ? (
                    <div className="border rounded-md divide-y">
                      {formStudents
                        .filter(student => 
                          selectedProgram === "all" ? true : student.program === selectedProgram
                        )
                        .slice(0, stats.needInteraction)
                        .map((student, index) => (
                          <div key={index} className="p-4 flex justify-between items-center">
                            <div>
                              <p className="font-medium">{student.name}</p>
                              <p className="text-sm text-gray-500">
                                ID: {student.id} • Program: {student.program}
                              </p>
                            </div>
                            <Button variant="outline" size="sm">
                              Schedule
                            </Button>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-gray-500">No students currently need interaction in this program.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Follow-ups Tab */}
            <TabsContent value="followUps">
              <Card>
                <CardHeader>
                  <CardTitle>Required Follow-ups</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {getFollowUpRequiredInteractions()
                    .filter(interaction => selectedProgram === "all" ? true : interaction.program === selectedProgram)
                    .length > 0 ? (
                    <div className="border rounded-md divide-y">
                      {getFollowUpRequiredInteractions()
                        .filter(interaction => selectedProgram === "all" ? true : interaction.program === selectedProgram)
                        .map((interaction, index) => (
                          <div key={index} className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{interaction.studentName}</p>
                                <p className="text-sm text-gray-500">
                                  ID: {interaction.studentId} • Program: {interaction.program}
                                </p>
                              </div>
                              <Button variant="outline" size="sm">
                                Complete
                              </Button>
                            </div>
                            <div className="mt-2">
                              <p className="text-sm">
                                <span className="font-medium">Follow-up:</span> {interaction.followUp.date}
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Type:</span> {interaction.type}
                              </p>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {interaction.notes}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-gray-500">No follow-ups currently required in this program.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Overdue Tab */}
            <TabsContent value="overdue">
              <Card>
                <CardHeader>
                  <CardTitle>Overdue Follow-ups</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {getOverdueFollowUps()
                    .filter(interaction => selectedProgram === "all" ? true : interaction.program === selectedProgram)
                    .length > 0 ? (
                    <div className="border rounded-md divide-y">
                      {getOverdueFollowUps()
                        .filter(interaction => selectedProgram === "all" ? true : interaction.program === selectedProgram)
                        .map((interaction, index) => (
                          <div key={index} className="p-4 bg-red-50">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center">
                                  <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                                  <p className="font-medium">{interaction.studentName}</p>
                                </div>
                                <p className="text-sm text-gray-500">
                                  ID: {interaction.studentId} • Program: {interaction.program}
                                </p>
                              </div>
                              <Button variant="default" size="sm" className="bg-red-600 hover:bg-red-700">
                                Urgent Action
                              </Button>
                            </div>
                            <div className="mt-2">
                              <p className="text-sm">
                                <span className="font-medium">Due:</span> {interaction.followUp.date} <span className="text-red-500">(overdue)</span>
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Type:</span> {interaction.type}
                              </p>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {interaction.notes}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-gray-500">No overdue follow-ups in this program.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Insights Overview Section */}
          <div className="mt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              Insights Overview
            </h2>
            <InsightsOverview />
          </div>
        </div>
      </main>
    </div>
  )
}
