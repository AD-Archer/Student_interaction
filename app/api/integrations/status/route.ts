/**
 * /api/integrations/status/route.ts
 * API route to fetch the latest SystemIntegrationStatus for all integrations.
 * Used by the settings Integrations tab to display real lastSync/status values.
 *
 * Returns: [{ name, lastSync, status, updatedAt } ...]
 */

import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // I fetch all integration statuses, sorted by name
    const statuses = await prisma.systemIntegrationStatus.findMany({
      orderBy: { name: 'asc' }
    })
    return NextResponse.json({ ok: true, statuses })
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
