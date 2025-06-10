/**
 * API route to check if the scheduled follow-up cron logic is working (dry run).
 * This endpoint works both in Docker and in the real app, and does NOT send emails or mark anything as sent.
 * Returns the count and details of interactions that would be processed if the cron ran now.
 *
 * Usage: GET /api/cron-health
 */

import { PrismaClient } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function GET() {
  const prisma = new PrismaClient()
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().slice(0, 10)
    const interactions = await prisma.interaction.findMany({
      where: {
        followUpRequired: true,
        followUpSent: false,
        followUpDate: { lte: todayStr },
        isArchived: false,
        OR: [
          { followUpStudent: true },
          { followUpStaff: true }
        ]
      },
      select: {
        id: true,
        followUpStudent: true,
        followUpStudentEmail: true,
        followUpStaff: true,
        followUpStaffEmail: true,
        followUpDate: true,
      },
    })
    return Response.json({
      ok: true,
      count: interactions.length,
      interactions,
      message: `If the cron ran now, it would process ${interactions.length} interaction(s).`
    })
  } catch (err) {
    return Response.json({ ok: false, error: (err as Error).message }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
