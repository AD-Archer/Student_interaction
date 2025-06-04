/**
 * StudentsSettings.tsx
 *
 * This component provides the UI and logic for managing students in the settings page.
 * It fetches students from the database via the /api/students endpoint, allows manual creation,
 * and lets you toggle lightspeed status for foundations students only.
 * Students are not users and do not require passwords or authentication.
 *
 * This component is only used within the settings page and is not global.
 *
 * Future developers: Connect the actual mutation logic for "lightspeed" if you want to persist it.
 */

import React, { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Users, Loader2, CheckCircle, AlertTriangle, Zap, Edit, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Student type matches the DB shape
interface Student {
  id: string
  firstName: string
  lastName: string
  email?: string | null
  program: string
  cohort?: number | null
}

interface CohortPhaseMap {
  [phase: string]: string
}

export function StudentsSettings() {
  // I fetch students from the API and manage them in state
  const [students, setStudents] = useState<Student[]>([])
  const [cohortPhaseMap, setCohortPhaseMap] = useState<CohortPhaseMap>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveResult, setSaveResult] = useState<{ success: boolean; message: string } | null>(null)
  const [newStudent, setNewStudent] = useState({
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    cohort: "",
    program: "foundations"
  })
  const [creating, setCreating] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [updating, setUpdating] = useState(false)

  // Fetch students and cohort mapping from the API
  useEffect(() => {
    Promise.all([fetchStudents(), fetchCohortMapping()])
  }, [])

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/students")
      if (!res.ok) throw new Error("Failed to fetch students")
      const data = await res.json()
      // Remove the "All Students" option if present
      setStudents(Array.isArray(data) ? data.filter(s => s.id !== "all") : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  const fetchCohortMapping = async () => {
    try {
      const response = await fetch('/api/settings/system')
      if (response.ok) {
        const data = await response.json()
        setCohortPhaseMap(data.cohortPhaseMap || {})
      }
    } catch (err) {
      console.error('Failed to load cohort mapping:', err)
    }
  }

  // I check if a student can be made lightspeed (only foundations students)
  const canToggleLightspeed = (student: Student) => {
    const foundationsCohort = cohortPhaseMap.foundations
    return foundationsCohort && student.cohort?.toString() === foundationsCohort
  }

  // I handle toggling lightspeed status
  const handleToggleLightspeed = async (student: Student) => {
    const newProgram = student.program === "lightspeed" ? "foundations" : "lightspeed"
    
    try {
      // Update in database first
      const res = await fetch(`/api/students/${student.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...student, program: newProgram })
      })
      
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to update student")
      }
      
      // Update UI after successful API call
      setStudents(prev =>
        prev.map(s =>
          s.id === student.id ? { ...s, program: newProgram } : s
        )
      )
      
      setSaveResult({
        success: true,
        message: `${student.firstName} ${student.lastName} ${newProgram === "lightspeed" ? "promoted to" : "returned from"} Lightspeed`
      })
      setTimeout(() => setSaveResult(null), 3000)
      
    } catch (err) {
      // Revert UI changes if API call failed
      setError(err instanceof Error ? err.message : String(err))
      setTimeout(() => setError(null), 5000)
    }
  }

  // I handle manual student creation
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setError(null)
    try {
      const studentData = {
        ...newStudent,
        cohort: newStudent.cohort ? parseInt(newStudent.cohort) : null
      }
      
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentData)
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to create student")
      }
      const created = await res.json()
      setStudents(prev => [...prev, created])
      setNewStudent({ id: "", firstName: "", lastName: "", email: "", cohort: "", program: "foundations" })
      setSaveResult({ success: true, message: "Student created successfully" })
      setTimeout(() => setSaveResult(null), 3000)
    } catch (err) {
      // I expect err to be an Error, but fallback to string if not
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setCreating(false)
    }
  }

  // I handle editing existing students
  const handleEditStudent = (student: Student) => {
    setEditingStudent(student)
    // Clear any existing errors when starting to edit
    setError(null)
    setSaveResult(null)
    
    // Scroll to edit form after a short delay to ensure it renders
    setTimeout(() => {
      const editCard = document.getElementById('edit-student-card')
      if (editCard) {
        editCard.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingStudent) return
    
    setUpdating(true)
    setError(null)
    try {
      const res = await fetch(`/api/students/${editingStudent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingStudent)
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to update student")
      }
      const updated = await res.json()
      setStudents(prev => prev.map(s => s.id === updated.id ? updated : s))
      setEditingStudent(null)
      setSaveResult({ success: true, message: "Student updated successfully" })
      setTimeout(() => setSaveResult(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setUpdating(false)
    }
  }

  const cancelEdit = () => {
    setEditingStudent(null)
    setError(null)
    setSaveResult(null)
  }

  return (
    <div className="space-y-6">
      {/* Current Students Card */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
            <Users className="h-5 w-5 text-blue-600" />
            <span>Current Students</span>
          </CardTitle>
          <CardDescription>
            Manage existing students and promote foundations students to lightspeed status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading students…</span>
            </div>
          ) : error ? (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {students.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No students found</p>
              ) : (
                students.map(student => (
                  <div 
                    key={student.id} 
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      editingStudent?.id === student.id 
                        ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200' 
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-medium">{student.firstName} {student.lastName}</p>
                        <p className="text-sm text-gray-600">
                          ID: {student.id} • Program: {student.program}
                          {student.cohort && ` • Cohort: ${student.cohort}`}
                          {student.email && ` • Email: ${student.email}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={editingStudent?.id === student.id ? "default" : "outline"}
                        onClick={() => editingStudent?.id === student.id ? cancelEdit() : handleEditStudent(student)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        {editingStudent?.id === student.id ? "Cancel Edit" : "Edit"}
                      </Button>
                      {student.program === "lightspeed" ? (
                        <div className="flex items-center gap-2">
                          <span className="text-green-600 font-medium flex items-center gap-1">
                            <Zap className="h-4 w-4" />
                            Lightspeed
                          </span>
                          {canToggleLightspeed(student) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleToggleLightspeed(student)}
                            >
                              Remove Lightspeed
                            </Button>
                          )}
                        </div>
                      ) : (
                        canToggleLightspeed(student) ? (
                          <Button
                            size="sm"
                            onClick={() => handleToggleLightspeed(student)}
                            variant="default"
                            className="bg-yellow-600 hover:bg-yellow-700"
                          >
                            <Zap className="h-4 w-4 mr-1" />
                            Make Lightspeed
                          </Button>
                        ) : (
                          <span className="text-gray-500 text-sm">
                            {student.program === "foundations" ? "Not in foundations cohort" : "Not foundations program"}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Student Card */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span>Create New Student</span>
          </CardTitle>
          <CardDescription>
            Manually add a new student to the system with their cohort and contact information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateStudent} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="student-id">Student ID</Label>
                <Input
                  id="student-id"
                  type="text"
                  placeholder="e.g., 0001"
                  value={newStudent.id}
                  onChange={e => setNewStudent(s => ({ ...s, id: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="student@example.com"
                  value={newStudent.email}
                  onChange={e => setNewStudent(s => ({ ...s, email: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="first-name">First Name</Label>
                <Input
                  id="first-name"
                  type="text"
                  placeholder="First name"
                  value={newStudent.firstName}
                  onChange={e => setNewStudent(s => ({ ...s, firstName: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">Last Name</Label>
                <Input
                  id="last-name"
                  type="text"
                  placeholder="Last name"
                  value={newStudent.lastName}
                  onChange={e => setNewStudent(s => ({ ...s, lastName: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cohort">Cohort Number</Label>
                <Input
                  id="cohort"
                  type="number"
                  placeholder="e.g., 1, 2, 3"
                  value={newStudent.cohort}
                  onChange={e => setNewStudent(s => ({ ...s, cohort: e.target.value }))}
                  required
                />
              </div>
            </div>
            <Button type="submit" disabled={creating} className="w-full sm:w-auto">
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Create Student
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Success/Error Messages */}
      {saveResult && (
        <Alert className={saveResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          {saveResult.success ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={saveResult.success ? "text-green-800" : "text-red-800"}>
            {saveResult.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Edit Student Card - Shows when editing */}
      {editingStudent && (
        <Card id="edit-student-card" className="shadow-lg border-blue-200 bg-blue-50/30">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg sm:text-xl">
              <div className="flex items-center space-x-2">
                <Edit className="h-5 w-5 text-blue-600" />
                <span>Edit Student: {editingStudent.firstName} {editingStudent.lastName}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={cancelEdit}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
            <CardDescription>
              Update student information and settings. Changes will be saved to the database.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateStudent} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-student-id">Student ID</Label>
                  <Input
                    id="edit-student-id"
                    type="text"
                    value={editingStudent.id}
                    disabled
                    className="bg-gray-100"
                  />
                  <p className="text-xs text-gray-500">Student ID cannot be changed</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email Address</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    placeholder="student@example.com"
                    value={editingStudent.email || ""}
                    onChange={e => setEditingStudent(s => s ? { ...s, email: e.target.value } : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-first-name">First Name</Label>
                  <Input
                    id="edit-first-name"
                    type="text"
                    placeholder="First name"
                    value={editingStudent.firstName}
                    onChange={e => setEditingStudent(s => s ? { ...s, firstName: e.target.value } : null)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-last-name">Last Name</Label>
                  <Input
                    id="edit-last-name"
                    type="text"
                    placeholder="Last name"
                    value={editingStudent.lastName}
                    onChange={e => setEditingStudent(s => s ? { ...s, lastName: e.target.value } : null)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-cohort">Cohort Number</Label>
                  <Input
                    id="edit-cohort"
                    type="number"
                    placeholder="e.g., 1, 2, 3"
                    value={editingStudent.cohort?.toString() || ""}
                    onChange={e => setEditingStudent(s => s ? { ...s, cohort: e.target.value ? parseInt(e.target.value) : null } : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-program">Program</Label>
                  <select
                    id="edit-program"
                    value={editingStudent.program}
                    onChange={e => setEditingStudent(s => s ? { ...s, program: e.target.value } : null)}
                    className="w-full border rounded-md px-3 py-2 bg-white"
                  >
                    <option value="foundations">Foundations</option>
                    <option value="101">101</option>
                    <option value="lightspeed">Lightspeed</option>
                    <option value="liftoff">Liftoff</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={updating}>
                  {updating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating…
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Update Student
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
