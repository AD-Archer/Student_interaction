/**
 * app/api/admin/flush-db/route.ts
 * API route to flush (delete) all data from the database: students, users, interactions, and related tables.
 * Only accessible by admin users. After flush, the admin will be prompted to create a new account.
 * WARNING: This action is irreversible and should be protected in production.
 */

import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST() {
  // NOTE: You should add authentication/authorization here in production

  try {
    // I delete all data in the correct order to avoid FK constraint errors
    await db.interaction.deleteMany({})
    await db.student.deleteMany({})
    await db.user.deleteMany({})
    await db.staffNote.deleteMany({})
    await db.session.deleteMany({})
    // Add more tables as needed (e.g., cohorts, settings, etc.)
    // await db.cohort.deleteMany({})
    // await db.systemSettings.deleteMany({})

    console.log('Database flushed successfully')

    return NextResponse.json({ 
      success: true, 
      message: "Database flushed successfully. You can now create a new admin account."
    })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
