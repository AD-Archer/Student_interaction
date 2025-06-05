// filepath: /Users/archer/projects/node/Launchpad_Student_Form/app/analytics/page.tsx
/**
 * AnalyticsPage
 * Modern, minimal analytics dashboard for student interactions and follow-ups.
 * Uses clean glassmorphism, subtle gradients, and simple icons for a calm, premium look.
 * All logic is unchanged; only the UI/UX is streamlined for clarity and modernity.
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

/**
 * Helper to format a date string as MM/DD/YYYY (US format).
 * Returns 'Invalid date' if input is not a valid date.
 */
const formatDateUS = (dateStr: string | null | undefined): string => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return 'Invalid date'
  // I use toLocaleDateString with US locale for MM/DD/YYYY
  return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCohort, setSelectedCohort] = useState("all")
  const [dateRange, setDateRange] = useState("30")
  const [searchQuery, setSearchQuery] = useState("")
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [studentsNeedingInteraction, setStudentsNeedingInteraction] = useState<StudentRecord[]>([])
  const [followUpRecords, setFollowUpRecords] = useState<FollowUpRecord[]>([])
  const [cohortPhaseMap, setCohortPhaseMap] = useState<Record<string, string>>({})

  // Fetch cohortPhaseMap on mount
  useEffect(() => {
    const fetchCohortPhaseMap = async () => {
      try {
        const res = await fetch("/api/settings/system")
        if (res.ok) {
          const data = await res.json()
          setCohortPhaseMap(data.cohortPhaseMap || {})
        }
      } catch {
        setCohortPhaseMap({})
      }
    }
    fetchCohortPhaseMap()
  }, [])

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

  // Dynamically build cohort options from analytics data
  const cohortOptions = analyticsData
    ? Array.from(new Set(analyticsData.breakdown.studentsByCohort.map(c => c.cohort)))
        .filter(c => c !== 'Unassigned' && c !== null && c !== undefined)
        .sort((a, b) => Number(a) - Number(b))
    : [];

  // Helper to get phase for a cohort (mapping is phase->cohort, so we invert it)
  const getPhaseForCohort = (cohortNum: string | number | null | undefined, program: string) => {
    if (!cohortNum) return program
    const cohortStr = typeof cohortNum === 'number' ? String(cohortNum) : cohortNum
    // Find the phase whose value matches the cohort number
    const foundPhase = Object.entries(cohortPhaseMap).find(([, v]) => v === cohortStr)?.[0]
    return foundPhase || program
  }

  // Helper to get days overdue for a follow-up
  const getDaysOverdue = (followUpDate: string): number => {
    const due = new Date(followUpDate)
    const now = new Date()
    // Calculate difference in days
    return Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
  }

  // Helper to get students overdue for interaction by at least 7 days
  const getStudentsOverdueInteraction = (): StudentRecord[] => {
    return studentsNeedingInteraction.filter(s =>
      typeof s.daysSinceLastInteraction === 'number' && s.daysSinceLastInteraction >= 7
    )
  }


  // Helper to get follow-ups overdue by at least 7 days
  const getFollowUpsOverdueByWeek = (): FollowUpRecord[] => {
    return getOverdueFollowUps().filter(f => getDaysOverdue(f.followUpDate) >= 7 && getDaysOverdue(f.followUpDate) <= 14)
  }

  // Helper to get follow-ups overdue by more than 1 week
  const getFollowUpsOverdueMoreThanWeek = (): FollowUpRecord[] => {
    return getOverdueFollowUps().filter(f => getDaysOverdue(f.followUpDate) > 14)
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
                  className="w-full rounded-xl border border-gray-200 bg-white/70 focus:border-blue-400"
                />
              </div>
              <Select value={selectedCohort} onValueChange={setSelectedCohort}>
                <SelectTrigger className="w-full sm:w-40 rounded-xl border border-gray-200 bg-white/70">
                  <SelectValue placeholder="Cohort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cohorts</SelectItem>
                  {cohortOptions.map((cohort) => (
                    <SelectItem key={String(cohort)} value={String(cohort)}>
                      Cohort {cohort}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-full sm:w-32 rounded-xl border border-gray-200 bg-white/70">
                  <SelectValue placeholder="Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 sm:flex-none rounded-xl border border-gray-200 bg-white/70 hover:bg-blue-50">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                <Button onClick={handleExport} className="flex-1 sm:flex-none rounded-xl bg-blue-600 text-white hover:bg-blue-700">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>

          {/* Key Metrics Dashboard */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-6">
            {/* Total Students */}
            <Card className="bg-white/70 border border-blue-100 rounded-2xl shadow-md">
              <CardContent className="p-4 sm:p-6 flex flex-col items-center justify-center gap-2">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-blue-100 mb-2">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-blue-700">Total Students</p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-900">
                  {analyticsData.overview.totalStudents}
                </p>
              </CardContent>
            </Card>

            {/* Students Needing Interaction */}
            <Card className="bg-white/70 border border-orange-100 rounded-2xl shadow-md">
              <CardContent className="p-4 sm:p-6 flex flex-col items-center justify-center gap-2">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-orange-100 mb-2">
                  <AlertCircle className="h-6 w-6 text-orange-500" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-orange-700">Need Interaction</p>
                <p className="text-2xl sm:text-3xl font-bold text-orange-900">
                  {analyticsData.overview.studentsNeedingInteraction}
                </p>
              </CardContent>
            </Card>

            {/* Follow-ups Required */}
            <Card className="bg-white/70 border border-amber-100 rounded-2xl shadow-md">
              <CardContent className="p-4 sm:p-6 flex flex-col items-center justify-center gap-2">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-amber-100 mb-2">
                  <Clock className="h-6 w-6 text-amber-500" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-amber-700">Follow-ups Needed</p>
                <p className="text-2xl sm:text-3xl font-bold text-amber-900">
                  {analyticsData.overview.followUpsRequired}
                </p>
              </CardContent>
            </Card>

            {/* Overdue Follow-ups */}
            <Card className="bg-white/70 border border-red-100 rounded-2xl shadow-md">
              <CardContent className="p-4 sm:p-6 flex flex-col items-center justify-center gap-2">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-red-100 mb-2">
                  <AlertCircle className="h-6 w-6 text-red-500" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-red-700">Overdue</p>
                <p className="text-2xl sm:text-3xl font-bold text-red-900">
                  {analyticsData.overview.overdueFollowUps}
                </p>
              </CardContent>
            </Card>

            {/* Total Interactions */}
            <Card className="bg-white/70 border border-green-100 rounded-2xl shadow-md">
              <CardContent className="p-4 sm:p-6 flex flex-col items-center justify-center gap-2">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-green-100 mb-2">
                  <BarChart3 className="h-6 w-6 text-green-500" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-green-700">Total Interactions</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-900">
                  {analyticsData.overview.totalInteractions}
                </p>
              </CardContent>
            </Card>

            {/* Recent Interactions */}
            <Card className="bg-white/70 border border-purple-100 rounded-2xl shadow-md">
              <CardContent className="p-4 sm:p-6 flex flex-col items-center justify-center gap-2">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-purple-100 mb-2">
                  <TrendingUp className="h-6 w-6 text-purple-500" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-purple-700">Recent ({dateRange}d)</p>
                <p className="text-2xl sm:text-3xl font-bold text-purple-900">
                  {analyticsData.overview.recentInteractions}
                </p>
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
                  {/* Overdue by 1 week or more */}
                  {getStudentsOverdueInteraction().length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-red-600 mb-2">Overdue for Interaction (7+ days)</h3>
                      <div className="border rounded-md divide-y">
                        {getStudentsOverdueInteraction().map((student, index) => (
                          <div key={index} className="p-4 bg-red-50">
                            <p className="font-medium">{student.firstName} {student.lastName}</p>
                            <p className="text-sm text-gray-500">
                              ID: {student.id} • Cohort: {student.cohort || 'Unassigned'} • Phase: {getPhaseForCohort(student.cohort, student.program)}
                            </p>
                            <p className="text-sm text-red-500">
                              {student.daysSinceLastInteraction} days since last interaction
                            </p>
                            {student.lastInteraction && (
                              <p className="text-xs text-gray-400">
                                Last interaction: {formatDateUS(student.lastInteraction)}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Not overdue (less than 7 days) */}
                  {filteredStudents.filter(s => !s.daysSinceLastInteraction || s.daysSinceLastInteraction < 7).length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">Upcoming/Recent</h3>
                      <div className="border rounded-md divide-y">
                        {filteredStudents.filter(s => !s.daysSinceLastInteraction || s.daysSinceLastInteraction < 7).map((student, index) => (
                          <div key={index} className="p-4 flex justify-between items-center">
                            <div>
                              <p className="font-medium">{student.firstName} {student.lastName}</p>
                              <p className="text-sm text-gray-500">
                                ID: {student.id} • Cohort: {student.cohort || 'Unassigned'} • Phase: {getPhaseForCohort(student.cohort, student.program)}
                              </p>
                              {student.daysSinceLastInteraction && (
                                <p className="text-sm text-orange-500">
                                  {student.daysSinceLastInteraction} days since last interaction
                                </p>
                              )}
                              {student.lastInteraction && (
                                <p className="text-xs text-gray-400">
                                  Last interaction: {formatDateUS(student.lastInteraction)}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {filteredStudents.length === 0 && (
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
                  {/* Overdue by 1 week (7-14 days) */}
                  {getFollowUpsOverdueByWeek().length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-red-600 mb-2">Overdue Follow-ups (7-14 days)</h3>
                      <div className="border rounded-md divide-y">
                        {getFollowUpsOverdueByWeek().map((record, index) => {
                          const student = studentsNeedingInteraction.find(s => s.id === record.studentId) || filteredStudents.find(s => s.id === record.studentId);
                          return (
                            <div key={index} className="p-4 bg-red-50">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">{record.studentFirstName} {record.studentLastName}</p>
                                  <p className="text-sm text-gray-500">
                                    ID: {record.studentId} • Cohort: {record.cohort || 'Unassigned'} • Phase: {getPhaseForCohort(record.cohort, record.program)}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Staff: {record.staffMember}
                                  </p>
                                  {student && typeof student.daysSinceLastInteraction === 'number' && (
                                    <p className="text-sm text-red-500">
                                      {student.daysSinceLastInteraction} days since last interaction
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="mt-2">
                                <p className="text-sm">
                                  <span className="font-medium">Follow-up:</span> {formatDateUS(record.followUpDate)}
                                </p>
                                <p className="text-sm">
                                  <span className="font-medium">Type:</span> {record.type}
                                </p>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {record.notes}
                                </p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  {/* Overdue by more than 1 week (15+ days) */}
                  {getFollowUpsOverdueMoreThanWeek().length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-red-800 mb-2">Severely Overdue Follow-ups (15+ days)</h3>
                      <div className="border rounded-md divide-y">
                        {getFollowUpsOverdueMoreThanWeek().map((record, index) => {
                          const student = studentsNeedingInteraction.find(s => s.id === record.studentId) || filteredStudents.find(s => s.id === record.studentId);
                          return (
                            <div key={index} className="p-4 bg-red-100">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">{record.studentFirstName} {record.studentLastName}</p>
                                  <p className="text-sm text-gray-500">
                                    ID: {record.studentId} • Cohort: {record.cohort || 'Unassigned'} • Phase: {getPhaseForCohort(record.cohort, record.program)}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Staff: {record.staffMember}
                                  </p>
                                  {student && typeof student.daysSinceLastInteraction === 'number' && (
                                    <p className="text-sm text-red-500">
                                      {student.daysSinceLastInteraction} days since last interaction
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="mt-2">
                                <p className="text-sm">
                                  <span className="font-medium">Follow-up:</span> {formatDateUS(record.followUpDate)}
                                </p>
                                <p className="text-sm">
                                  <span className="font-medium">Type:</span> {record.type}
                                </p>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {record.notes}
                                </p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  {/* Not overdue (less than 7 days) */}
                  {getRequiredFollowUps().filter(f => getDaysOverdue(f.followUpDate) < 7).length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">Upcoming/Recent</h3>
                      <div className="border rounded-md divide-y">
                        {getRequiredFollowUps().filter(f => getDaysOverdue(f.followUpDate) < 7).map((record, index) => {
                          const student = studentsNeedingInteraction.find(s => s.id === record.studentId) || filteredStudents.find(s => s.id === record.studentId);
                          return (
                            <div key={index} className="p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">{record.studentFirstName} {record.studentLastName}</p>
                                  <p className="text-sm text-gray-500">
                                    ID: {record.studentId} • Cohort: {record.cohort || 'Unassigned'} • Phase: {getPhaseForCohort(record.cohort, record.program)}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Staff: {record.staffMember}
                                  </p>
                                  {student && typeof student.daysSinceLastInteraction === 'number' && (
                                    <p className="text-sm text-orange-500">
                                      {student.daysSinceLastInteraction} days since last interaction
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="mt-2">
                                <p className="text-sm">
                                  <span className="font-medium">Follow-up:</span> {formatDateUS(record.followUpDate)}
                                </p>
                                <p className="text-sm">
                                  <span className="font-medium">Type:</span> {record.type}
                                </p>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {record.notes}
                                </p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  {getRequiredFollowUps().length === 0 && (
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
                  <CardTitle>Overdue Follow-ups
                    {/* I use &apos; for apostrophe in the tooltip for proper escaping */}
                    <span className="ml-2 cursor-help text-gray-400" title="A follow-up is &apos;overdue&apos; if its scheduled date has passed and no action has been taken.">
                      (What does &apos;overdue&apos; mean?)
                    </span>
                  </CardTitle>
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
                              <span className="font-medium">Due:</span> {formatDateUS(record.followUpDate)}
                              <span className="text-red-500 ml-1">(overdue)</span>
                            </p>
                            {/* I clarify for staff/admins what 'overdue' means, and why this is urgent */}
                            <p className="text-xs text-gray-500 mt-1">
                              Overdue means the follow-up date has passed and action is still required. This is determined by the backend: if <code>isOverdue</code> is true, the follow-up is overdue.
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
