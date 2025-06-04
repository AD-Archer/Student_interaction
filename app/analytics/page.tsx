// filepath: /Users/archer/projects/node/Launchpad_Student_Form/app/analytics/page.tsx
/**
 * Analytics dashboard page that displays real-time data from the Prisma database.
 * Shows comprehensive student interaction metrics, follow-up statistics, program breakdowns,
 * and actionable insights for staff members. All data is fetched from the analytics API endpoint.
 *
 * Note: All data-fetching hooks are memoized to avoid unnecessary re-renders and to satisfy
 * React hook dependency rules. This prevents stale closures and ensures the dashboard always
 * reflects the latest filter state. If you add new fetchers, memoize them with useCallback.
 */

"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, Download, AlertCircle, Clock, Users, TrendingUp, BarChart3 } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { Loader } from "@/components/ui/loader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"

// Types for analytics data
interface AnalyticsData {
  overview: {
    totalStudents: number
    totalInteractions: number
    studentsNeedingInteraction: number
    followUpsRequired: number
    overdueFollowUps: number
    recentInteractions: number
  }
  breakdown: {
    studentsByCohort: Array<{ cohort: string | number; _count: { id: number } }>
    interactionTypes: Array<{ type: string; count: number; percentage: number }>
    staffPerformance: Array<{ staffMember: string; interactions: number }>
  }
  trends: Array<{ month: string; interactions: number; followUps: number }>
  filters: {
    cohort: string
    dateRange: number
  }
}

interface StudentRecord {
  id: string
  firstName: string
  lastName: string
  cohort: number | null
  program: string
  email?: string
  lastInteraction?: string
  daysSinceLastInteraction?: number
}

interface FollowUpRecord {
  id: number
  studentFirstName: string
  studentLastName: string
  studentId: string
  cohort: number | null
  program: string
  type: string
  staffMember: string
  followUpDate: string
  notes: string
  isOverdue: boolean
}

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCohort, setSelectedCohort] = useState("all")
  const [dateRange, setDateRange] = useState("30")
  const [searchQuery, setSearchQuery] = useState("")
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [studentsNeedingInteraction, setStudentsNeedingInteraction] = useState<StudentRecord[]>([])
  const [followUpRecords, setFollowUpRecords] = useState<FollowUpRecord[]>([])

  // Memoize fetchers to avoid stale closures and satisfy exhaustive-deps
  const fetchStudentsNeedingInteraction = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        cohort: selectedCohort,
        needsInteraction: 'true'
      })
      const response = await fetch(`/api/students?${params}`)
      if (response.ok) {
        const students = await response.json()
        setStudentsNeedingInteraction(students)
      }
    } catch (error) {
      console.error('Error fetching students:', error)
    }
  }, [selectedCohort])

  const fetchFollowUpRecords = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        cohort: selectedCohort,
        followUpRequired: 'true'
      })
      const response = await fetch(`/api/interactions?${params}`)
      if (response.ok) {
        const interactions = await response.json()
        setFollowUpRecords(interactions)
      }
    } catch (error) {
      console.error('Error fetching follow-ups:', error)
    }
  }, [selectedCohort])

  // Fetch analytics data from API
  // I use useCallback to ensure stable reference for useEffect dependencies
  const fetchAnalyticsData = useCallback(async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        cohort: selectedCohort,
        dateRange: dateRange
      })
      const response = await fetch(`/api/analytics?${params}`)
      if (!response.ok) throw new Error('Failed to fetch analytics')
      const data = await response.json()
      setAnalyticsData(data)
      
      // Fetch detailed student and follow-up data
      await Promise.all([
        fetchStudentsNeedingInteraction(),
        fetchFollowUpRecords()
      ])
      
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }, [selectedCohort, dateRange, fetchStudentsNeedingInteraction, fetchFollowUpRecords])

  useEffect(() => {
    fetchAnalyticsData()
  }, [fetchAnalyticsData])

  // Filtered students for the search box
  const filteredStudents: StudentRecord[] = studentsNeedingInteraction.filter((student: StudentRecord) => {
    const query = searchQuery.toLowerCase()
    const studentName = `${student.firstName} ${student.lastName}`.toLowerCase()
    return studentName.includes(query) || student.id.includes(query)
  })

  // Get required follow-ups (not overdue)
  const getRequiredFollowUps = (): FollowUpRecord[] => {
    return followUpRecords.filter((record: FollowUpRecord) => !record.isOverdue)
  }

  // Get overdue follow-ups
  const getOverdueFollowUps = (): FollowUpRecord[] => {
    return followUpRecords.filter((record: FollowUpRecord) => record.isOverdue)
  }

  // Export analytics data as JSON
  const handleExport = (): void => {
    if (!analyticsData) return
    // I include only the most relevant data for export
    const exportData = {
      overview: analyticsData.overview,
      breakdown: analyticsData.breakdown,
      exportDate: new Date().toISOString(),
      filters: analyticsData.filters
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-cohort-${selectedCohort}-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading || !analyticsData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <Loader />
          <p className="mt-4 text-gray-600">Loading analytics data...</p>
        </div>
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
                Student Analytics Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Real-time insights from student interactions and follow-up tracking
              </p>
            </div>
            
            {/* Filters and Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Search students by name or ID"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={selectedCohort} onValueChange={setSelectedCohort}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Cohort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cohorts</SelectItem>
                  <SelectItem value="1">Cohort 1</SelectItem>
                  <SelectItem value="2">Cohort 2</SelectItem>
                  <SelectItem value="3">Cohort 3</SelectItem>
                  <SelectItem value="4">Cohort 4</SelectItem>
                  <SelectItem value="5">Cohort 5</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 sm:flex-none">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                <Button onClick={handleExport} className="flex-1 sm:flex-none">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>

          {/* Key Metrics Dashboard */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-6">
            {/* Total Students */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-3 sm:p-6">
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start mb-2">
                    <div className="bg-blue-200 p-2 rounded-full">
                      <Users className="h-4 w-4 lg:h-6 lg:w-6 text-blue-700" />
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-blue-600">Total Students</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-900">
                    {analyticsData.overview.totalStudents}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Students Needing Interaction */}
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-3 sm:p-6">
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start mb-2">
                    <div className="bg-orange-200 p-2 rounded-full">
                      <AlertCircle className="h-4 w-4 lg:h-6 lg:w-6 text-orange-700" />
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-orange-600">Need Interaction</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-900">
                    {analyticsData.overview.studentsNeedingInteraction}
                  </p>
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
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-amber-900">
                    {analyticsData.overview.followUpsRequired}
                  </p>
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
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-900">
                    {analyticsData.overview.overdueFollowUps}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Total Interactions */}
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-3 sm:p-6">
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start mb-2">
                    <div className="bg-green-200 p-2 rounded-full">
                      <BarChart3 className="h-4 w-4 lg:h-6 lg:w-6 text-green-700" />
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-green-600">Total Interactions</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-900">
                    {analyticsData.overview.totalInteractions}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Interactions */}
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-3 sm:p-6">
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start mb-2">
                    <div className="bg-purple-200 p-2 rounded-full">
                      <TrendingUp className="h-4 w-4 lg:h-6 lg:w-6 text-purple-700" />
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-purple-600">Recent ({dateRange}d)</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-900">
                    {analyticsData.overview.recentInteractions}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Breakdown Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cohort Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Students by Cohort</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.breakdown.studentsByCohort.map((cohortData, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="font-medium">
                        {cohortData.cohort === 'Unassigned' ? 'Unassigned' : `Cohort ${cohortData.cohort}`}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ 
                              width: `${(cohortData._count.id / analyticsData.overview.totalStudents) * 100}%` 
                            }}
                          />
                        </div>
                        <span className="font-bold">{cohortData._count.id}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Interaction Types */}
            <Card>
              <CardHeader>
                <CardTitle>Interaction Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.breakdown.interactionTypes.slice(0, 5).map((type, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="font-medium">{type.type}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${type.percentage}%` }}
                          />
                        </div>
                        <span className="font-bold">{type.count}</span>
                        <span className="text-sm text-gray-500">({type.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Student Action Lists */}
          <Tabs defaultValue="needInteraction" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="needInteraction">Need Interaction</TabsTrigger>
              <TabsTrigger value="followUps">Follow-ups</TabsTrigger>
              <TabsTrigger value="overdue">Overdue</TabsTrigger>
            </TabsList>
            
            {/* Students Needing Interaction */}
            <TabsContent value="needInteraction">
              <Card>
                <CardHeader>
                  <CardTitle>Students Needing Interaction</CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredStudents.length > 0 ? (
                    <div className="border rounded-md divide-y">
                      {filteredStudents.map((student, index) => (
                        <div key={index} className="p-4 flex justify-between items-center">
                          <div>
                            <p className="font-medium">{student.firstName} {student.lastName}</p>
                            <p className="text-sm text-gray-500">
                              ID: {student.id} • Cohort: {student.cohort || 'Unassigned'} • Program: {student.program}
                            </p>
                            {student.daysSinceLastInteraction && (
                              <p className="text-sm text-red-500">
                                {student.daysSinceLastInteraction} days since last interaction
                              </p>
                            )}
                          </div>
                          <Button variant="outline" size="sm">
                            Schedule
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-gray-500">
                      No students currently need interaction in this cohort.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Required Follow-ups */}
            <TabsContent value="followUps">
              <Card>
                <CardHeader>
                  <CardTitle>Required Follow-ups</CardTitle>
                </CardHeader>
                <CardContent>
                  {getRequiredFollowUps().length > 0 ? (
                    <div className="border rounded-md divide-y">
                      {getRequiredFollowUps().map((record, index) => (
                        <div key={index} className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{record.studentFirstName} {record.studentLastName}</p>
                              <p className="text-sm text-gray-500">
                                ID: {record.studentId} • Cohort: {record.cohort || 'Unassigned'} • Program: {record.program}
                              </p>
                              <p className="text-sm text-gray-500">
                                Staff: {record.staffMember}
                              </p>
                            </div>
                            <Button variant="outline" size="sm">
                              Complete
                            </Button>
                          </div>
                          <div className="mt-2">
                            <p className="text-sm">
                              <span className="font-medium">Follow-up:</span> {record.followUpDate}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Type:</span> {record.type}
                            </p>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {record.notes}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-gray-500">
                      No follow-ups currently required in this cohort.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Overdue Follow-ups */}
            <TabsContent value="overdue">
              <Card>
                <CardHeader>
                  <CardTitle>Overdue Follow-ups</CardTitle>
                </CardHeader>
                <CardContent>
                  {getOverdueFollowUps().length > 0 ? (
                    <div className="border rounded-md divide-y">
                      {getOverdueFollowUps().map((record, index) => (
                        <div key={index} className="p-4 bg-red-50">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center">
                                <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                                <p className="font-medium">{record.studentFirstName} {record.studentLastName}</p>
                              </div>
                              <p className="text-sm text-gray-500">
                                ID: {record.studentId} • Cohort: {record.cohort || 'Unassigned'} • Program: {record.program}
                              </p>
                              <p className="text-sm text-gray-500">
                                Staff: {record.staffMember}
                              </p>
                            </div>
                            <Button variant="default" size="sm" className="bg-red-600 hover:bg-red-700">
                              Urgent Action
                            </Button>
                          </div>
                          <div className="mt-2">
                            <p className="text-sm">
                              <span className="font-medium">Due:</span> {record.followUpDate} 
                              <span className="text-red-500 ml-1">(overdue)</span>
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Type:</span> {record.type}
                            </p>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {record.notes}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-gray-500">
                      No overdue follow-ups in this cohort. Great job!
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Staff Performance Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Top Staff Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analyticsData.breakdown.staffPerformance.slice(0, 6).map((staff, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <p className="font-medium">{staff.staffMember}</p>
                    <p className="text-2xl font-bold text-blue-600">{staff.interactions}</p>
                    <p className="text-sm text-gray-500">interactions</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Trends */}
          {analyticsData.trends.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.trends.map((trend, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="font-medium">{trend.month}</span>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Interactions</p>
                          <p className="font-bold">{trend.interactions}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Follow-ups</p>
                          <p className="font-bold">{trend.followUps}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
