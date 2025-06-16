"use client"
import React, { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { getPhaseForCohort } from "@/lib/utils"

interface Student {
  id: string
  firstName: string
  lastName: string
  email?: string | null
  program?: string | null
  cohort?: number | null
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

  const handleEdit = () => setEditing(true)
  const handleCancel = () => {
    setEditing(false)
    setEditData(student)
    setSaveError(null)
    setSaveSuccess(false)
  }
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditData(prev => prev ? { ...prev, [e.target.name]: e.target.value } : prev)
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
    } catch (err: any) {
      setSaveError(err.message || "Unknown error")
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
    } catch (err: any) {
      setAiError(err.message || "Unknown error")
    } finally {
      setAiLoading(false)
    }
  }

  // Compute program/phase from cohortPhaseMap and student.cohort
  const program = cohortPhaseMap && student?.cohort != null ? getPhaseForCohort(cohortPhaseMap, student.cohort) : student?.program || 'N/A'

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

  return (
    <main className="max-w-2xl mx-auto py-10 px-4 space-y-8">
      <div className="bg-white rounded-xl shadow p-6 space-y-2">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-1">{student.firstName} {student.lastName}</h1>
            <div className="text-gray-700 text-sm">
              ID: {student.id} •
              <span
                className="cursor-help relative group inline-block"
                title="Program/phase is automatically set based on the student's cohort, as configured in Settings > Phase-to-Cohort Mapping. To change a student's program, update the cohort mapping in settings."
              >
                Program: {program || 'N/A'}
                <span className="absolute left-0 mt-1 w-64 bg-black text-white text-xs rounded p-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 shadow-lg">
                  Program/phase is set automatically based on the student's cohort, as configured in <b>Settings &rarr; Phase-to-Cohort Mapping</b>. To change a student's program, update the cohort mapping in settings.
                </span>
              </span>
              • Email: {student.email || 'N/A'} •
              <span
                className="cursor-help relative group inline-block"
                title="Program/phase is automatically set based on the student's cohort, as configured in Settings > Phase-to-Cohort Mapping. To change a student's program, update the cohort mapping in settings."
              >
                Cohort: {student.cohort || 'Unassigned'}
                <span className="absolute left-0 mt-1 w-64 bg-black text-white text-xs rounded p-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 shadow-lg">
                  Program/phase is set automatically based on the student's cohort, as configured in <b>Settings &rarr; Phase-to-Cohort Mapping</b>. To change a student's program, update the cohort mapping in settings.
                </span>
              </span>
            </div>
          </div>
          {isAdmin && !editing && (
            <button className="text-xs px-3 py-1 rounded bg-blue-100 text-blue-800 hover:bg-blue-200 transition" onClick={handleEdit}>Edit Student</button>
          )}
        </div>
        {isAdmin && editing && editData && (
          <form className="mt-4 space-y-3 bg-blue-50/50 p-4 rounded-xl" onSubmit={e => { e.preventDefault(); handleSave(); }}>
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
              <label className="block text-xs font-medium mb-1">Cohort</label>
              <input name="cohort" value={editData.cohort || ""} onChange={handleChange} className="w-full rounded border border-gray-200 px-2 py-1 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Program</label>
              <input name="program" value={program || ""} className="w-full rounded border border-gray-200 px-2 py-1 text-sm bg-gray-100 cursor-not-allowed" disabled readOnly />
            </div>
            {saveError && <div className="text-xs text-red-600">{saveError}</div>}
            {saveSuccess && <div className="text-xs text-green-600">Student updated!</div>}
            <div className="flex gap-2 mt-2">
              <button type="submit" className="px-3 py-1 rounded bg-blue-600 text-white text-xs hover:bg-blue-700 transition" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
              <button type="button" className="px-3 py-1 rounded bg-gray-200 text-gray-700 text-xs hover:bg-gray-300 transition" onClick={handleCancel} disabled={saving}>Cancel</button>
            </div>
          </form>
        )}
      </div>

      {/* Interactions Section */}
      <section className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Interactions</h2>
          <button className="px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 transition">New Interaction</button>
        </div>
        {interactions.length === 0 ? (
          <p className="text-gray-500">No interactions yet.</p>
        ) : (
          <ul className="space-y-3">
            {interactions.map(interaction => (
              <li key={interaction.id} className="border rounded-lg p-3 bg-blue-50/30">
                <div className="flex justify-between items-center">
                  <div className="font-semibold text-blue-900">{interaction.type}</div>
                  <button className="text-xs text-blue-600 hover:underline">Edit</button>
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

      {/* Notes Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="font-semibold mb-2">Your Personal Notes</h3>
          <textarea className="w-full min-h-[80px] rounded border border-gray-200 p-2 text-sm" placeholder="Add private notes..." />
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="font-semibold mb-2">Staff Notes</h3>
          <textarea className="w-full min-h-[80px] rounded border border-gray-200 p-2 text-sm" placeholder="Add notes for all staff..." />
        </div>
      </section>

      {/* AI Ideas Section */}
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
    </main>
  )
}
