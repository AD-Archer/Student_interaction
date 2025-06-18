/**
 * app/api/admin/flush-db/route.ts
 * API route to flush (delete) core data: students, interactions, staff notes, and sessions.
 * Leaves users (staff), system settings, and integrations intact for a 'fresh' but not empty site.
 * Only accessible by admin users. After flush, the admin can continue using the site.
 * WARNING: This action is irreversible and should be protected in production.
 */

import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST() {
  // NOTE: You should add authentication/authorization here in production

  try {
    // Delete in order to avoid FK constraint errors
    await db.interaction.deleteMany({})
    await db.staffNote.deleteMany({})
    await db.session.deleteMany({})
    await db.student.deleteMany({})
    // DO NOT delete users, systemSettings, or integrations
    // await db.user.deleteMany({})
    // await db.systemSettings.deleteMany({})
    // await db.systemIntegrationStatus.deleteMany({})

    console.log('Database flushed: students, interactions, staff notes, sessions')

    return NextResponse.json({ 
      success: true, 
      message: "Database flushed: students, interactions, staff notes, and sessions. Settings and staff accounts remain."
    })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
