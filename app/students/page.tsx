"use client"
import React, { useState, useEffect } from "react"
import { getPhaseForCohort } from "@/lib/utils"

interface Student {
  id: string
  firstName: string
  lastName: string
  email?: string | null
  program?: string | null
  cohort?: number | null
  isPIP?: boolean // Add isPIP for badge
}

export default function StudentsPage() {
  const [search, setSearch] = useState("")
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [cohortPhaseMap, setCohortPhaseMap] = useState<Record<string, string> | null>(null)

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/students")
      if (res.ok) {
        const data = await res.json()
        setStudents(Array.isArray(data) ? data.filter(s => s.id !== "all") : [])
      }
      setLoading(false)
    })()
  }, [])

  useEffect(() => {
    fetch('/api/settings/system')
      .then(r => r.ok ? r.json() : null)
      .then(data => setCohortPhaseMap(data?.cohortPhaseMap || null))
  }, [])

  const filtered = search
    ? students.filter(s =>
        s.firstName.toLowerCase().includes(search) ||
        s.lastName.toLowerCase().includes(search) ||
        (s.email?.toLowerCase().includes(search) ?? false) ||
        s.id.toLowerCase().includes(search)
      )
    : students

  return (
    <main className="min-h-screen w-full bg-gray-50">
      <div className="max-w-5xl mx-auto py-8 px-2">
        <div className="mb-6 flex items-center gap-2">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#e0e7ff"/><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-3.314 0-6 1.343-6 3v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-1c0-1.657-2.686-3-6-3Z" fill="#3730a3"/></svg>
          <h1 className="text-2xl font-bold text-blue-900">All Students</h1>
        </div>
        <form className="mb-5" onSubmit={e => { e.preventDefault() }}>
          <input
            type="text"
            name="q"
            placeholder="Search by name, email, or ID..."
            value={search}
            onChange={e => setSearch(e.target.value.toLowerCase())}
            className="w-full max-w-xs rounded-xl border border-blue-200 px-3 py-2 text-sm bg-white shadow-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
          />
        </form>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {loading ? (
            <p className="text-gray-500 text-center py-2 col-span-full">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="text-gray-500 text-center py-2 col-span-full">No students found</p>
          ) : (
            filtered.map(student => {
              const program = cohortPhaseMap && student.cohort != null
                ? getPhaseForCohort(cohortPhaseMap, student.cohort)
                : student.program || 'N/A';
              return (
                <a
                  key={student.id}
                  href={`/students/${student.id}`}
                  className="block p-4 rounded-2xl border border-blue-100 bg-white/80 hover:bg-blue-50 transition shadow-sm hover:shadow-md group"
                >
                  <div className="flex flex-col items-start gap-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="bg-blue-100 rounded-full h-12 w-12 flex items-center justify-center text-blue-700 font-extrabold text-2xl group-hover:bg-blue-200 transition">
                        {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                      </div>
                      {student.isPIP && (
                        <span className="ml-2 px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-700">PIP</span>
                      )}
                    </div>
                    <div className="font-bold text-blue-900 text-xl leading-tight">{student.firstName} {student.lastName}</div>
                    <div className="text-sm text-gray-600">{student.email || 'N/A'}</div>
                    <div className="text-sm text-blue-700 font-semibold">{program}</div>
                    <div className="text-xs text-gray-500 mt-1">ID: {student.id}</div>
                  </div>
                </a>
              )
            })
          )}
        </div>
      </div>
    </main>
  )
}
