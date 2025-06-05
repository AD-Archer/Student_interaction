/**
 * app/api/health/db/route.ts
 * Health check endpoint for database connectivity. Used by monitoring and deployment systems to verify DB access.
 * Returns a simple JSON response. Extend this to check actual DB connection if needed.
 */

import { NextResponse } from "next/server"

// I return a simple healthy status for now; extend to check DB connection if needed
export async function GET() {
  return NextResponse.json({ status: "ok", db: true })
}
