/**
 * StudentSelectionCard component handles student and interaction type selection.
 * This is the first section of the form where users select a student from an autocomplete combobox
 * and choose the type of interaction they had with that student.
 *
 * Now fetches students from the database via API instead of using hardcoded data.
 * Students are loaded on component mount and cached for the session.
 *
 * The student picker is now a custom combobox for better UX: persistent focus, keyboard navigation,
 * and no dropdown clipping. This avoids the focus and clipping issues of the previous Select-based approach.
 */

import React, { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
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
  const [search, setSearch] = useState("")
  const [cohortFilter, setCohortFilter] = useState<string>("")
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [highlightedIdx, setHighlightedIdx] = useState<number>(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  // I fetch students from the database on component mount
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('/api/students')
        if (!response.ok) {
          throw new Error('Failed to fetch students')
        }
        const data = await response.json()
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

  // I get all unique cohorts from the students list for the filter dropdown
  const cohortOptions = Array.from(new Set(students.map(s => s.cohort).filter((c): c is number => typeof c === 'number'))).sort((a, b) => a - b).map(String)

  // I filter students by cohort and then by search string
  const filteredStudents = students.filter((s) => {
    const matchesCohort = cohortFilter ? String(s.cohort) === cohortFilter : true
    const fullName = `${s.firstName} ${s.lastName}`.toLowerCase()
    return matchesCohort && fullName.includes(search.toLowerCase())
  })

  // I handle keyboard navigation and selection for the combobox
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!dropdownOpen) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlightedIdx(idx => Math.min(idx + 1, filteredStudents.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlightedIdx(idx => Math.max(idx - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (highlightedIdx >= 0 && highlightedIdx < filteredStudents.length) {
        selectStudent(filteredStudents[highlightedIdx])
      }
    } else if (e.key === "Escape") {
      setDropdownOpen(false)
    }
  }

  // I select a student and keep the input focused for continued searching
  const selectStudent = (student: Student) => {
    onFormDataChange({
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`,
      studentEmail: student.email ?? ""
    })
    setSearch(`${student.firstName} ${student.lastName}`)
    setDropdownOpen(false)
    setHighlightedIdx(-1)
    // I keep focus in the input for fast repeated entry
    inputRef.current?.focus()
  }

  // I open the dropdown when input is focused or typed in
  const handleInputFocus = () => {
    setDropdownOpen(true)
    setHighlightedIdx(-1)
  }

  // I close the dropdown if user clicks outside
  useEffect(() => {
    if (!dropdownOpen) return
    const handleClick = (e: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        listRef.current &&
        !listRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [dropdownOpen])

  // I update search and open dropdown on input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setDropdownOpen(true)
    setHighlightedIdx(-1)
  }

  // I keep the input value in sync with the selected student
  useEffect(() => {
    if (!formData.studentId) {
      setSearch("")
      if (formData.studentName !== "" || formData.studentEmail !== "") {
        onFormDataChange({ studentName: "", studentEmail: "" })
      }
    } else if (formData.studentName) {
      // When editing, ensure the input shows the student name from formData
      setSearch(formData.studentName)
    }
  }, [formData.studentId, formData.studentName, formData.studentEmail, onFormDataChange])

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
          <Label htmlFor="student-combobox">Select Student</Label>
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
          <div className="relative">
            <input
              id="student-combobox"
              ref={inputRef}
              type="text"
              value={search}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onKeyDown={handleInputKeyDown}
              placeholder={loading ? "Loading students..." : error ? "Error loading students" : "Search students by name..."}
              className="w-full px-2 py-2 rounded border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
              autoComplete="off"
              disabled={loading}
              aria-autocomplete="list"
              aria-controls="student-combobox-listbox"
              aria-activedescendant={highlightedIdx >= 0 ? `student-option-${filteredStudents[highlightedIdx]?.id}` : undefined}
            />
            {dropdownOpen && (
              <ul
                id="student-combobox-listbox"
                ref={listRef}
                className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg"
                role="listbox"
              >
                {loading && (
                  <li className="flex items-center px-2 py-2 text-gray-500" role="option" aria-disabled="true" aria-selected="false">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />Loading students...
                  </li>
                )}
                {error && (
                  <li className="px-2 py-2 text-red-500" role="option" aria-disabled="true" aria-selected="false">Error: {error}</li>
                )}
                {!loading && !error && filteredStudents.length === 0 && (
                  <li className="px-2 py-2 text-gray-500" role="option" aria-disabled="true" aria-selected="false">No students found</li>
                )}
                {!loading && !error && filteredStudents.map((student, idx) => (
                  <li
                    key={student.id}
                    id={`student-option-${student.id}`}
                    role="option"
                    aria-selected={formData.studentId === student.id}
                    className={`flex items-center gap-2 px-2 py-2 cursor-pointer ${idx === highlightedIdx ? 'bg-blue-100' : ''}`}
                    onMouseDown={e => { e.preventDefault(); selectStudent(student) }}
                    onMouseEnter={() => setHighlightedIdx(idx)}
                  >
                    <User className="h-4 w-4 text-blue-600" />
                    <span className="flex-1">{`${student.firstName} ${student.lastName}`}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="interactionType">Interaction Type</Label>
          {/* I keep the interaction type as a Select for now since it's a small, static list */}
          <select
            id="interactionType"
            value={formData.interactionType}
            onChange={e => onFormDataChange({ interactionType: e.target.value })}
            className="w-full px-2 py-2 rounded border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
          >
            <option value="" disabled>Select interaction type</option>
            {interactionTypes
              .filter((type) => type.value !== "other")
              .map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
          </select>
        </div>
      </CardContent>
    </Card>
  )
}
