"use client"
import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { getPhaseForCohort } from "@/lib/utils"

interface Student {
  id: string
  firstName: string
  lastName: string
  email?: string | null
  program?: string | null
  cohort?: number | null
  launchpadEmail?: string | null
  altSchoolEmail?: string | null
  personalEmail?: string | null
  phone?: string | null
  isLightspeed?: boolean // Lightspeed toggle
  isPIP?: boolean // PIP toggle
  status?: string // Added from schema
  meta?: Record<string, unknown> // Added from schema
  createdAt?: string // Added from schema
  updatedAt?: string // Added from schema
}

interface Interaction {
  id: string | number
  type: string
  reason: string
  notes: string
  date: string
  staffMember: string
  aiSummary?: string
}

export default function StudentPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params?.id
  const [student, setStudent] = useState<Student | null>(null)
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState<Student | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [aiSummary, setAiSummary] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [cohortPhaseMap, setCohortPhaseMap] = useState<Record<string, string> | null>(null)
  const [interactionSearch, setInteractionSearch] = useState("")
  const [personalNotes, setPersonalNotes] = useState("");
  const [staffNotes, setStaffNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null)
  const [savingPersonalNotes, setSavingPersonalNotes] = useState(false);
  const [personalNotesError, setPersonalNotesError] = useState<string | null>(null);
  const [showMeta, setShowMeta] = useState(false);
  // TODO: Replace with real user/auth context
  const isAdmin = true

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([
      fetch(`/api/students/${id}`).then(r => r.ok ? r.json() : null),
      fetch(`/api/interactions?studentId=${id}`).then(r => r.ok ? r.json() : [])
    ]).then(([studentData, interactionData]) => {
      setStudent(studentData)
      setEditData(studentData)
      setInteractions(Array.isArray(interactionData) ? interactionData : [])
      setLoading(false)
    })
  }, [id])

  useEffect(() => {
    fetch('/api/settings/system')
      .then(r => r.ok ? r.json() : null)
      .then(data => setCohortPhaseMap(data?.cohortPhaseMap || null))
  }, [])

  // Fetch staff notes on mount
  useEffect(() => {
    if (!id) return;
    fetch(`/api/students/${id}/notes`).then(r => r.ok ? r.json() : null).then((data) => {
      if (data && Array.isArray(data) && data.length > 0) {
        setStaffNotes(data[0].content || "");
      }
    });
  }, [id]);

  // Fetch personal notes on mount
  useEffect(() => {
    if (!id) return;
    fetch(`/api/students/${id}/personal-notes`).then(r => r.ok ? r.json() : null).then((data) => {
      if (data && data.content) {
        setPersonalNotes(data.content);
      }
    });
  }, [id]);

  const handleEdit = () => setEditing(true)
  const handleCancel = () => {
    setEditing(false)
    setEditData(student)
    setSaveError(null)
    setSaveSuccess(false)
  }
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setEditData(prev => prev ? {
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    } : prev)
  }
  const handleSave = async () => {
    if (!student || !editData) return
    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)
    try {
      const res = await fetch(`/api/students/${student.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData)
      })
      if (!res.ok) throw new Error("Failed to update student")
      setSaveSuccess(true)
      setEditing(false)
      setStudent(editData)
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : String(err) || "Unknown error")
    } finally {
      setSaving(false)
    }
  }
  const handleAISummary = async () => {
    setAiLoading(true)
    setAiError(null)
    setAiSummary(null)
    try {
      // Gather all interaction details into a single string
      const message = interactions.map(i => `Type: ${i.type}\nDate: ${i.date}\nStaff: ${i.staffMember}\nReason: ${i.reason}\nNotes: ${i.notes}`).join("\n---\n")
      const res = await fetch(`/api/ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      })
      if (!res.ok) throw new Error("Failed to generate AI summary")
      const data = await res.json()
      setAiSummary(data.result || "No summary returned.")
    } catch (err: unknown) {
      setAiError(err instanceof Error ? err.message : String(err) || "Unknown error")
    } finally {
      setAiLoading(false)
    }
  }

  // Save staff notes
  const handleSaveStaffNotes = async () => {
    setSavingNotes(true);
    setNotesError(null);
    try {
      const res = await fetch(`/api/students/${id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author: "admin", content: staffNotes, priority: "medium" })
      });
      if (!res.ok) throw new Error("Failed to save note");
    } catch (e: unknown) {
      setNotesError(e instanceof Error ? e.message : String(e) || "Unknown error");
    } finally {
      setSavingNotes(false);
    }
  };

  // Save personal notes
  const handleSavePersonalNotes = async () => {
    setSavingPersonalNotes(true);
    setPersonalNotesError(null);
    try {
      const res = await fetch(`/api/students/${id}/personal-notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: personalNotes })
      });
      if (!res.ok) throw new Error("Failed to save personal note");
    } catch (e: unknown) {
      setPersonalNotesError(e instanceof Error ? e.message : String(e) || "Unknown error");
    } finally {
      setSavingPersonalNotes(false);
    }
  };

  // Compute program/phase from cohortPhaseMap and student.cohort
  const program = cohortPhaseMap && student?.cohort != null ? getPhaseForCohort(cohortPhaseMap, student.cohort) : student?.program || 'N/A'

  // Filter interactions based on search term
  const filteredInteractions = interactionSearch
    ? interactions.filter(i =>
        i.type.toLowerCase().includes(interactionSearch.toLowerCase()) ||
        i.reason.toLowerCase().includes(interactionSearch.toLowerCase()) ||
        i.staffMember.toLowerCase().includes(interactionSearch.toLowerCase()) ||
        i.notes.toLowerCase().includes(interactionSearch.toLowerCase())
      )
    : interactions

  if (loading) {
    return <main className="max-w-2xl mx-auto py-10 px-4"><div>Loading…</div></main>
  }
  if (!student) {
    return (
      <main className="max-w-2xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-4">Student Not Found</h1>
        <p className="text-gray-500">No student found with ID: {id}</p>
      </main>
    )
  }

  // Helper to render interaction type safely
  const renderInteractionType = (type: any) => {
    if (!type) return ''
    if (typeof type === 'object') {
      // Try to render .name or .id, fallback to JSON string
      return type.name || type.id || JSON.stringify(type)
    }
    return type
  }

  // Helper to display student data
  const studentDetailsMain = [
    { label: 'ID', value: student.id },
    { label: 'First Name', value: student.firstName },
    { label: 'Last Name', value: student.lastName },
    { label: 'Status', value: student.status || 'active' },
    { label: 'Cohort', value: student.cohort ?? 'Unassigned' },
    { label: 'Program', value: program || 'N/A' },
  ];
  const studentDetailsContact = [
    { label: 'Email', value: student.email || 'N/A' },
    { label: 'Launchpad Email', value: student.launchpadEmail || 'N/A' },
    { label: 'Alt School Email', value: student.altSchoolEmail || 'N/A' },
    { label: 'Personal Email', value: student.personalEmail || 'N/A' },
    { label: 'Phone', value: student.phone || 'N/A' },
  ];
  const studentDetailsFlags = [
    { label: 'Lightspeed', value: student.isLightspeed ? 'Yes' : 'No' },
    { label: 'PIP', value: student.isPIP ? 'Yes' : 'No' },
  ];
  const studentDetailsDates = [
    { label: 'Created At', value: student.createdAt ? new Date(student.createdAt).toLocaleString() : 'N/A' },
    { label: 'Updated At', value: student.updatedAt ? new Date(student.updatedAt).toLocaleString() : 'N/A' },
  ];

  return (
    <main className="max-w-2xl mx-auto py-10 px-4 space-y-8">
      {/* Student Details Section */}
      <section className="bg-white rounded-xl shadow p-6 mb-4">
        <div className="flex flex-col items-start mb-4">
          <h1 className="text-4xl font-extrabold text-gray-900 leading-tight mb-1">{student.firstName} {student.lastName}</h1>
          <div className="text-base text-gray-600 mb-1">{student.email || 'N/A'}</div>
          <div className="text-base text-blue-700 font-semibold mb-2">{program || 'N/A'}</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mb-4">
          <div>
            <span className="text-xs text-gray-500">Status</span>
            <div className="text-sm text-gray-900">{student.status || 'active'}</div>
          </div>
          <div>
            <span className="text-xs text-gray-500">Cohort</span>
            <div className="text-sm text-gray-900">{student.cohort ?? 'Unassigned'}</div>
          </div>
          <div>
            <span className="text-xs text-gray-500">Launchpad Email</span>
            <div className="text-sm text-gray-900">{student.launchpadEmail || 'N/A'}</div>
          </div>
          <div>
            <span className="text-xs text-gray-500">Alt School Email</span>
            <div className="text-sm text-gray-900">{student.altSchoolEmail || 'N/A'}</div>
          </div>
          <div>
            <span className="text-xs text-gray-500">Personal Email</span>
            <div className="text-sm text-gray-900">{student.personalEmail || 'N/A'}</div>
          </div>
          <div>
            <span className="text-xs text-gray-500">Phone</span>
            <div className="text-sm text-gray-900">{student.phone || 'N/A'}</div>
          </div>
          <div>
            <span className="text-xs text-gray-500">Lightspeed</span>
            <div className="text-sm text-gray-900">{student.isLightspeed ? 'Yes' : 'No'}</div>
          </div>
          <div>
            <span className="text-xs text-gray-500">PIP</span>
            <div className="text-sm text-gray-900">{student.isPIP ? 'Yes' : 'No'}</div>
          </div>
          <div>
            <span className="text-xs text-gray-500">Created At</span>
            <div className="text-sm text-gray-900">{student.createdAt ? new Date(student.createdAt).toLocaleString() : 'N/A'}</div>
          </div>
          <div>
            <span className="text-xs text-gray-500">Updated At</span>
            <div className="text-sm text-gray-900">{student.updatedAt ? new Date(student.updatedAt).toLocaleString() : 'N/A'}</div>
          </div>
        </div>
        {/* Meta Data Toggle for Admins */}
        {isAdmin && student.meta && (
          <div className="mt-4">
            <button
              className="px-3 py-1 rounded bg-gray-200 text-gray-700 text-xs hover:bg-gray-300 transition mb-2"
              onClick={() => setShowMeta(v => !v)}
              type="button"
            >
              {showMeta ? 'Hide Meta Data' : 'Show Meta Data'}
            </button>
            {showMeta && (
              <pre className="bg-gray-900 text-green-200 text-xs rounded p-3 overflow-x-auto whitespace-pre-wrap border border-gray-300">
                {JSON.stringify(student.meta, null, 2)}
              </pre>
            )}
          </div>
        )}
        <div className="flex justify-end mt-2">
          {isAdmin && !editing && (
            <button
              className="text-xs px-3 py-1 rounded bg-blue-100 text-blue-800 hover:bg-blue-200 transition"
              onClick={handleEdit}
            >
              Edit Student
            </button>
          )}
        </div>
      </section>

      {/* AI Ideas Section - moved above interactions */}
      <section className="bg-white rounded-xl shadow p-4">
        <h3 className="font-semibold mb-2">AI Insights & Ideas</h3>
        <button
          className="mb-3 px-3 py-1 rounded bg-blue-600 text-white text-xs hover:bg-blue-700 transition"
          onClick={handleAISummary}
          disabled={aiLoading}
        >
          {aiLoading ? "Generating..." : "Generate AI Summary"}
        </button>
        {aiError && <div className="text-xs text-red-600 mb-2">{aiError}</div>}
        {aiSummary ? (
          <div className="text-sm text-gray-700 whitespace-pre-line border rounded p-2 bg-blue-50/50">{aiSummary}</div>
        ) : (
          <div className="text-sm text-gray-700">(AI-generated ideas and summaries will appear here.)</div>
        )}
      </section>

      {/* Notes Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="font-semibold mb-2">Your Personal Notes</h3>
          <textarea
            className="w-full min-h-[80px] rounded border border-gray-200 p-2 text-sm"
            placeholder="Add private notes..."
            value={personalNotes}
            onChange={e => setPersonalNotes(e.target.value)}
          />
          <button
            className="mt-2 px-3 py-1 rounded bg-blue-600 text-white text-xs hover:bg-blue-700 transition"
            onClick={handleSavePersonalNotes}
            disabled={savingPersonalNotes}
          >
            {savingPersonalNotes ? "Saving..." : "Save Personal Notes"}
          </button>
          {personalNotesError && <div className="text-xs text-red-600 mt-1">{personalNotesError}</div>}
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="font-semibold mb-2">Staff Notes</h3>
          <textarea
            className="w-full min-h-[80px] rounded border border-gray-200 p-2 text-sm"
            placeholder="Add notes for all staff..."
            value={staffNotes}
            onChange={e => setStaffNotes(e.target.value)}
          />
          <button
            className="mt-2 px-3 py-1 rounded bg-blue-600 text-white text-xs hover:bg-blue-700 transition"
            onClick={handleSaveStaffNotes}
            disabled={savingNotes}
          >
            {savingNotes ? "Saving..." : "Save Staff Notes"}
          </button>
          {notesError && <div className="text-xs text-red-600 mt-1">{notesError}</div>}
        </div>
      </section>

      {/* Interactions Section */}
      <section className="bg-white rounded-xl shadow p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <h2 className="text-lg font-semibold">Interactions</h2>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search interactions..."
              className="w-full sm:w-64 px-2 py-1 rounded border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              value={interactionSearch}
              onChange={e => setInteractionSearch(e.target.value)}
            />
            <button
              className="px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 transition"
              onClick={() => router.push(`/create?studentId=${student.id}&studentName=${encodeURIComponent(student.firstName + ' ' + student.lastName)}`)}
            >
              New Interaction
            </button>
          </div>
        </div>
        {filteredInteractions.length === 0 ? (
          <p className="text-gray-500">No interactions found.</p>
        ) : (
          <ul className="space-y-3">
            {filteredInteractions.map(interaction => (
              <li key={interaction.id} className="border rounded-lg p-3 bg-blue-50/30">
                <div className="flex justify-between items-center">
                  <div className="font-semibold text-blue-900">
                    {renderInteractionType(interaction.type)}
                  </div>
                  <button
                    className="text-xs text-blue-600 hover:underline"
                    onClick={() => router.push(`/create?id=${interaction.id}`)}
                  >
                    Edit
                  </button>
                </div>
                <div className="text-xs text-gray-600 mb-1">{interaction.date} • {interaction.staffMember}</div>
                <div className="text-sm text-gray-800 mb-1">{interaction.reason}</div>
                <div className="text-xs text-gray-700 italic">{interaction.notes}</div>
                {interaction.aiSummary && (
                  <div className="text-xs text-blue-700 mt-1">AI: {interaction.aiSummary}</div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Edit Student Modal (if editing) */}
      {isAdmin && editing && editData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl font-bold"
              onClick={handleCancel}
              aria-label="Close"
              type="button"
            >
              ×
            </button>
            <h3 className="text-lg font-semibold mb-4">Edit Student</h3>
            <form className="space-y-3" onSubmit={e => { e.preventDefault(); handleSave(); }}>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-medium mb-1">First Name</label>
                  <input name="firstName" value={editData.firstName || ""} onChange={handleChange} className="w-full rounded border border-gray-200 px-2 py-1 text-sm" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium mb-1">Last Name</label>
                  <input name="lastName" value={editData.lastName || ""} onChange={handleChange} className="w-full rounded border border-gray-200 px-2 py-1 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Email</label>
                <input name="email" value={editData.email || ""} onChange={handleChange} className="w-full rounded border border-gray-200 px-2 py-1 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Launchpad Email</label>
                <input name="launchpadEmail" value={editData.launchpadEmail || ""} onChange={handleChange} className="w-full rounded border border-gray-200 px-2 py-1 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Alternative School Email</label>
                <input name="altSchoolEmail" value={editData.altSchoolEmail || ""} onChange={handleChange} className="w-full rounded border border-gray-200 px-2 py-1 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Personal Email</label>
                <input name="personalEmail" value={editData.personalEmail || ""} onChange={handleChange} className="w-full rounded border border-gray-200 px-2 py-1 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Phone</label>
                <input name="phone" value={editData.phone || ""} onChange={handleChange} className="w-full rounded border border-gray-200 px-2 py-1 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Cohort</label>
                <input name="cohort" value={editData.cohort || ""} onChange={handleChange} className="w-full rounded border border-gray-200 px-2 py-1 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Program</label>
                <input name="program" value={cohortPhaseMap && editData.cohort != null ? getPhaseForCohort(cohortPhaseMap, editData.cohort) : editData.program || 'N/A'} className="w-full rounded border border-gray-200 px-2 py-1 text-sm bg-gray-100 cursor-not-allowed" disabled readOnly />
              </div>
              <div className="flex gap-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="isLightspeed" checked={!!editData.isLightspeed} onChange={handleChange} />
                  Lightspeed
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="isPIP" checked={!!editData.isPIP} onChange={handleChange} />
                  PIP
                </label>
              </div>
              {saveError && <div className="text-xs text-red-600">{saveError}</div>}
              {saveSuccess && <div className="text-xs text-green-600">Student updated!</div>}
              <div className="flex gap-2 mt-2">
                <button type="submit" className="px-3 py-1 rounded bg-blue-600 text-white text-xs hover:bg-blue-700 transition" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
                <button type="button" className="px-3 py-1 rounded bg-gray-200 text-gray-700 text-xs hover:bg-gray-300 transition" onClick={handleCancel} disabled={saving}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
