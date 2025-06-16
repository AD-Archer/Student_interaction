// Student detail page by ID
import { notFound } from "next/navigation"

interface StudentPageProps {
  params: { id: string }
}

interface Student {
  id: string
  firstName: string
  lastName: string
  email?: string | null
  program?: string | null
  cohort?: number | null
}

async function getStudent(id: string): Promise<Student | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/students/${id}`, { cache: 'no-store' })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export default async function StudentPage({ params }: StudentPageProps) {
  const student = await getStudent(params.id)

  if (!student) {
    return (
      <main className="max-w-2xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-4">Student Not Found</h1>
        <p className="text-gray-500">No student found with ID: {params.id}</p>
      </main>
    )
  }

  return (
    <main className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-4">{student.firstName} {student.lastName}</h1>
      <div className="bg-white rounded-xl shadow p-6 space-y-2">
        <div className="text-lg font-semibold">ID: {student.id}</div>
        <div className="text-gray-700">Program: {student.program || 'N/A'}</div>
        <div className="text-gray-700">Email: {student.email || 'N/A'}</div>
        <div className="text-gray-700">Cohort: {student.cohort || 'Unassigned'}</div>
      </div>
      {/* TODO: Show all interactions for this student here */}
    </main>
  )
}
