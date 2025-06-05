/**
 * StudentSelectionCard component handles student and interaction type selection.
 * This is the first section of the form where users select a student from the dropdown
 * and choose the type of interaction they had with that student.
 * 
 * Now fetches students from the database via API instead of using hardcoded data.
 * Students are loaded on component mount and cached for the session.
 */

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Loader2 } from "lucide-react"
import { FormData, formInteractionTypes as interactionTypes } from "@/lib/data"

interface Student {
  id: string
  firstName: string
  lastName: string
  email: string | null
  cohort: number | null
  program: string
}

interface StudentSelectionCardProps {
  formData: FormData
  onFormDataChange: (updates: Partial<FormData>) => void
}

export function StudentSelectionCard({ formData, onFormDataChange }: StudentSelectionCardProps) {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // I add a search state for filtering students in large lists
  const [search, setSearch] = useState("")
  // I add a cohort filter state
  const [cohortFilter, setCohortFilter] = useState<string>("")

  // I fetch students from the database on component mount
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('/api/students')
        if (!response.ok) {
          throw new Error('Failed to fetch students')
        }
        const data = await response.json()
        // I filter out the "All Students" option which is used elsewhere but not needed here
        setStudents(data.filter((s: Student) => s.id !== "all"))
      } catch (err) {
        console.error('Error fetching students:', err)
        setError(err instanceof Error ? err.message : 'Failed to load students')
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [])

  const handleStudentChange = (studentId: string) => {
    const student = students.find((s) => s.id === studentId)
    if (student) {
      // I log the selected student for debugging
      console.log(`Selected student: ${student.firstName} ${student.lastName}, Email: ${student.email || 'No email available'}`)
      
      onFormDataChange({
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        studentEmail: student.email ?? ""
      })
    }
  }

  const handleInteractionTypeChange = (value: string) => {
    onFormDataChange({ interactionType: value })
  }

  // I get all unique cohorts from the students list for the filter dropdown, filtering out null/undefined and converting to string
  const cohortOptions = Array.from(new Set(students.map(s => s.cohort).filter((c): c is number => typeof c === 'number'))).sort((a, b) => a - b).map(String)

  // I filter students by cohort and then by search string
  const filteredStudents = students.filter((s) => {
    const matchesCohort = cohortFilter ? String(s.cohort) === cohortFilter : true
    const fullName = `${s.firstName} ${s.lastName}`.toLowerCase()
    return matchesCohort && fullName.includes(search.toLowerCase())
  })

  return (
    <Card className="shadow-md border-blue-100 bg-white/80">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-lg">Student Information</CardTitle>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          Required
        </Badge>
      </CardHeader>
      <hr className="my-2 border-gray-200" />
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="student">Select Student</Label>
          {/* Cohort filter dropdown above the search box */}
          <div className="flex gap-2 mb-2">
            <label htmlFor="cohort-filter" className="text-sm font-medium text-gray-700">Filter by Cohort:</label>
            <select
              id="cohort-filter"
              value={cohortFilter}
              onChange={e => setCohortFilter(e.target.value)}
              className="px-2 py-1 rounded border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="">All Cohorts</option>
              {cohortOptions.map(cohort => (
                <option key={cohort} value={cohort}>{cohort}</option>
              ))}
            </select>
          </div>
          <Select value={formData.studentId} onValueChange={handleStudentChange} disabled={loading}>
            <SelectTrigger>
              <SelectValue placeholder={
                loading ? "Loading students..." : 
                error ? "Error loading students" : 
                "Choose a student"
              } />
            </SelectTrigger>
            <SelectContent>
              {/* I add a search input for filtering students */}
              <div className="px-2 py-1 sticky top-0 z-10 bg-white/95 border-b border-gray-100">
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search students by name..."
                  className="w-full px-2 py-1 rounded border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  autoFocus
                />
              </div>
              {loading && (
                <SelectItem value="loading" disabled>
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading students...</span>
                  </div>
                </SelectItem>
              )}
              {error && (
                <SelectItem value="error" disabled>
                  <div className="flex items-center space-x-2">
                    <span className="text-red-500">Error: {error}</span>
                  </div>
                </SelectItem>
              )}
              {!loading && !error && filteredStudents.length === 0 && (
                <SelectItem value="no-results" disabled>
                  <span className="text-gray-500">No students found</span>
                </SelectItem>
              )}
              {!loading && !error && filteredStudents.map((student) => (
                <SelectItem key={student.id} value={student.id}>
                  <div className="flex items-center space-x-2 w-full">
                    <User className="h-4 w-4" />
                    <span className="flex-1">{`${student.firstName} ${student.lastName}`}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="interactionType">Interaction Type</Label>
          <Select value={formData.interactionType} onValueChange={handleInteractionTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select interaction type" />
            </SelectTrigger>
            <SelectContent>
              {interactionTypes
                .filter((type) => type.value !== "other")
                .map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
