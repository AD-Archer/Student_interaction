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
import { useRouter } from "next/navigation"

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
  const [search, setSearch] = useState("")

  // Mass edit state
  const [massEdit, setMassEdit] = useState({ startId: "", endId: "", newCohort: "" })

  // Selection state for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const allVisibleIds = students.map(s => s.id);
  const allSelected = allVisibleIds.length > 0 && allVisibleIds.every(id => selectedIds.includes(id));
  const toggleSelectAll = () => setSelectedIds(allSelected ? [] : allVisibleIds);
  const toggleSelect = (id: string) => setSelectedIds(sel => sel.includes(id) ? sel.filter(i => i !== id) : [...sel, id]);

  // Toggle for selection mode
  const [selectMode, setSelectMode] = useState(false);

  // Sorting state
  const [sortBy, setSortBy] = useState<'id' | 'firstName' | 'lastName'>('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const router = useRouter()

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

  // Helper to get phase/program for a given cohort number
  const getPhaseForCohort = (cohort: number | string | null | undefined): string => {
    if (!cohort) return ''
    const cohortStr = typeof cohort === 'number' ? String(cohort) : cohort
    // cohortPhaseMap is phase -> cohortNum, so invert to cohortNum -> phase
    const foundPhase = Object.entries(cohortPhaseMap).find(([, v]) => v === cohortStr)?.[0]
    return foundPhase || ''
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

  // Promote to Lightspeed and redirect to student page with edit open
  const handlePromoteToLightspeed = async () => {
    if (!editingStudent) return
    setUpdating(true)
    setError(null)
    try {
      const updatedStudent = { ...editingStudent, program: "lightspeed" }
      const res = await fetch(`/api/students/${editingStudent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedStudent)
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to update student")
      }
      setEditingStudent(null)
      setSaveResult({ success: true, message: "Student promoted to Lightspeed!" })
      setTimeout(() => setSaveResult(null), 2000)
      // Redirect to student page with edit open
      router.push(`/students/${updatedStudent.id}?edit=1`)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setUpdating(false)
    }
  }

  // Sort students before filtering
  const sortedStudents = [...students].sort((a, b) => {
    let cmp = 0;
    if (sortBy === 'id') {
      // Numeric sort if possible
      const aNum = parseInt(a.id, 10);
      const bNum = parseInt(b.id, 10);
      if (!isNaN(aNum) && !isNaN(bNum)) cmp = aNum - bNum;
      else cmp = a.id.localeCompare(b.id);
    } else {
      cmp = (a[sortBy] || '').localeCompare(b[sortBy] || '');
    }
    return sortDir === 'asc' ? cmp : -cmp;
  });
  const filteredStudents = sortedStudents.filter(student => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    if (
      student.firstName.toLowerCase().includes(q) ||
      student.lastName.toLowerCase().includes(q) ||
      (student.email?.toLowerCase().includes(q) ?? false) ||
      student.id.toLowerCase().includes(q)
    ) {
      return true;
    }
    for (const [phase, cohortNum] of Object.entries(cohortPhaseMap)) {
      if (
        student.cohort?.toString() === cohortNum &&
        phase.toLowerCase().includes(q)
      ) {
        return true;
      }
    }
    return false;
  })

  // Bulk actions
  const handleBulkCohort = async (newCohort: string) => {
    let successCount = 0, failCount = 0;
    for (const id of selectedIds) {
      const s = students.find(stu => stu.id === id);
      if (!s) continue;
      try {
        const res = await fetch(`/api/students/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...s, cohort: parseInt(newCohort) })
        });
        if (res.ok) successCount++;
        else failCount++;
      } catch { failCount++; }
    }
    setSaveResult({ success: failCount === 0, message: `Updated ${successCount} students${failCount ? `, ${failCount} failed` : ''}` });
    setSelectedIds([]);
    fetchStudents();
  };
  const handleBulkDelete = async () => {
    let successCount = 0, failCount = 0;
    for (const id of selectedIds) {
      try {
        const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
        if (res.ok) successCount++;
        else failCount++;
      } catch { failCount++; }
    }
    setSaveResult({ success: failCount === 0, message: `Deleted ${successCount} students${failCount ? `, ${failCount} failed` : ''}` });
    setSelectedIds([]);
    fetchStudents();
  };
  const handleBulkLightspeed = async () => {
    let successCount = 0, failCount = 0;
    for (const id of selectedIds) {
      const s = students.find(stu => stu.id === id);
      if (!s) continue;
      try {
        const res = await fetch(`/api/students/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...s, program: "lightspeed" })
        });
        if (res.ok) successCount++;
        else failCount++;
      } catch { failCount++; }
    }
    setSaveResult({ success: failCount === 0, message: `Promoted ${successCount} students${failCount ? `, ${failCount} failed` : ''}` });
    setSelectedIds([]);
    fetchStudents();
  };

  return (
    <div className="space-y-6">

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
                  value={newStudent.id || ""}
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
                  value={newStudent.email || ""}
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
                  value={newStudent.firstName || ""}
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
                  value={newStudent.lastName || ""}
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
                  value={newStudent.cohort || ""}
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
      {/* Mass Edit Students Card */}
      {/**
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
            <Edit className="h-5 w-5 text-blue-600" />
            <span>Mass Edit Students</span>
          </CardTitle>
          <CardDescription>
            Update the cohort number for a range of students by ID (e.g., 0001–0300).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={async e => {
              e.preventDefault();
              setError(null);
              setSaveResult(null);
              const { startId, endId, newCohort } = massEdit;
              if (!startId || !endId || !newCohort) {
                setError("All fields are required.");
                return;
              }
              setLoading(true);
              try {
                const res = await fetch('/api/students/bulk-edit', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ startId, endId, newCohort })
                });
                const result = await res.json();
                if (res.ok && result.success) {
                  setSaveResult({ success: true, message: `Updated ${result.updated} students${result.failed ? `, ${result.failed} failed` : ''}` });
                } else {
                  setSaveResult({ success: false, message: result.error || 'Bulk update failed' });
                }
                fetchStudents();
              } catch (err) {
                setSaveResult({ success: false, message: 'Bulk update failed' });
              } finally {
                setLoading(false);
              }
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startId">Start ID</Label>
                <Input id="startId" name="startId" type="text" placeholder="e.g., 0001" required value={massEdit.startId} onChange={e => {
                  setMassEdit(m => ({ ...m, startId: e.target.value }));
                  if (e.target.value === "" && massEdit.endId === "") setSearch("");
                }} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endId">End ID</Label>
                <Input id="endId" name="endId" type="text" placeholder="e.g., 0004" required value={massEdit.endId} onChange={e => {
                  setMassEdit(m => ({ ...m, endId: e.target.value }));
                  if (e.target.value === "" && massEdit.startId === "") setSearch("");
                }} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newCohort">New Cohort Number</Label>
                <Input id="newCohort" name="newCohort" type="number" placeholder="e.g., 2" required value={massEdit.newCohort} onChange={e => setMassEdit(m => ({ ...m, newCohort: e.target.value }))} />
              </div>
            </div>
            <Button type="submit" variant="default" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating…
                </>
              ) : (
                <>Apply to Range</>
              )}
            </Button>
            {saveResult && (
              <Alert className={saveResult.success ? "border-green-200 bg-green-50 mt-4" : "border-red-200 bg-red-50 mt-4"}>
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
          </form>
        </CardContent>
      </Card>
      **/}

      {/* Bulk Actions Bar */}
      {selectMode && selectedIds.length > 0 && (
        <div className="flex gap-2 mb-4 items-center bg-blue-50 border border-blue-200 rounded p-2">
          <span className="font-medium">Bulk actions for {selectedIds.length} selected:</span>
          <Button size="sm" variant="outline" onClick={() => { const cohort = prompt('Enter new cohort number:'); if (cohort) handleBulkCohort(cohort); }}>Edit Cohort</Button>
          <Button size="sm" variant="destructive" onClick={handleBulkDelete}>Delete</Button>
          <Button size="sm" variant="secondary" onClick={handleBulkLightspeed}><Zap className="h-4 w-4 mr-1 text-yellow-500" />Promote to Lightspeed</Button>
        </div>
      )}

      {/* Current Students Card */}
      <Card className="shadow-lg w-full max-w-none mx-auto">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center space-x-2 text-lg sm:text-xl">
              <Users className="h-4 w-5 text-blue-600" />
              <span>Current Students</span>
            </div>
            <div className="flex items-center"><Button size="sm" variant={selectMode ? "default" : "outline"} onClick={() => setSelectMode(m => !m)}>
              {selectMode ? "Exit Select Mode" : "Select Students"}
            </Button></div>
          </div>
          <CardDescription className="text-center sm:text-left">
            Manage existing students and promote foundations students to lightspeed status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Student Search Input */}
          <div className="mb-4 flex flex-col items-stretch w-full">
            <Input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full"
            />
            <div className="flex flex-wrap gap-2 mt-2 items-center justify-start w-full">
              <span className="text-xs text-gray-600">Sort by:</span>
              <Button size="sm" variant={sortBy === 'id' ? 'default' : 'outline'} onClick={() => setSortBy('id')}>ID Number</Button>
              <Button size="sm" variant={sortBy === 'firstName' ? 'default' : 'outline'} onClick={() => setSortBy('firstName')}>First Name</Button>
              <Button size="sm" variant={sortBy === 'lastName' ? 'default' : 'outline'} onClick={() => setSortBy('lastName')}>Last Name</Button>
              <Button size="sm" variant="ghost" onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}>
                {sortDir === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
            {selectMode && (
              <div className="flex items-center gap-2 mt-2 w-full">
                <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} style={{ width: 28, height: 28 }} />
                <span className="text-xs text-gray-600">Select All</span>
              </div>
            )}
          </div>
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
              {filteredStudents.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No students found</p>
              ) : (
                filteredStudents.map(student => (
                  <div
                    key={student.id}
                    className={`flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-4 rounded-lg border bg-gray-50 w-full`}
                    style={{ minWidth: 0 }}
                    onClick={() => { if (!selectMode) router.push(`/students/${student.id}`); }}
                  >
                    {selectMode && (
                      <div className="flex items-center gap-2 w-full max-w-[40px]">
                        <input type="checkbox" checked={selectedIds.includes(student.id)} onChange={e => { e.stopPropagation(); toggleSelect(student.id); }} style={{ width: 28, height: 28 }} />
                      </div>
                    )}
                    <div className="flex flex-col items-start min-w-[180px] w-full">
                      <div className="font-semibold text-lg text-left">{student.firstName} {student.lastName}</div>
                      <div className="text-xs text-gray-600 text-left">ID: {student.id} • Program: {getPhaseForCohort(student.cohort)} • Email: {student.email || 'N/A'}</div>
                    </div>
                    <div className="flex items-center gap-2 justify-end w-full max-w-xs" onClick={e => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/students/${student.id}?edit=1`)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      {student.program === "lightspeed" ? (
                        <div className="flex items-center gap-2">
                          <span className="text-green-600 font-medium flex items-center gap-1">
                            <Zap className="h-4 w-4" />
                            Lightspeed
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
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
    </div>
  )
}
