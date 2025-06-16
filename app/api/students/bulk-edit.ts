import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

function buildCorsHeaders(request: NextRequest) {
  const origin = request.headers.get('origin') || '*'
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true'
  }
}

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(null, { status: 204, headers: buildCorsHeaders(request) })
}

// POST /api/students/bulk-edit
export async function POST(request: NextRequest) {
  try {
    const { startId, endId, newCohort } = await request.json()
    if (!startId || !endId || !newCohort) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    // Find all students in the range
    const allStudents = await db.student.findMany({})
    let inRange: typeof allStudents = []
    if (/^\d+$/.test(startId) && /^\d+$/.test(endId)) {
      const nStart = parseInt(startId, 10)
      const nEnd = parseInt(endId, 10)
      const min = Math.min(nStart, nEnd)
      const max = Math.max(nStart, nEnd)
      inRange = allStudents.filter(s => {
        const nId = parseInt(s.id, 10)
        return !isNaN(nId) && nId >= min && nId <= max
      })
    } else {
      const min = startId < endId ? startId : endId
      const max = startId > endId ? startId : endId
      inRange = allStudents.filter(s => s.id >= min && s.id <= max)
    }
    let successCount = 0
    let failCount = 0
    for (const s of inRange) {
      try {
        await db.student.update({
          where: { id: s.id },
          data: { cohort: typeof newCohort === 'string' ? parseInt(newCohort) : newCohort }
        })
        successCount++
      } catch {
        failCount++
      }
    }
    return NextResponse.json({ success: true, updated: successCount, failed: failCount }, { headers: buildCorsHeaders(request) })
  } catch (error) {
    console.error('Bulk edit error:', error)
    return NextResponse.json({ error: 'Bulk edit failed' }, { status: 500 })
  }
}
