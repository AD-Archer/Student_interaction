/**
 * System Settings API Route
 * Handles CRUD operations for system-wide configuration settings including
 * student interaction frequency rules, priority escalation, and follow-up settings.
 * This connects to the SystemSettings model and provides the backend for the settings UI.
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Build CORS headers per request to support credentials
function buildCorsHeaders(request: NextRequest) {
  const origin = request.headers.get('origin') || '*'
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true'
  }
}

// Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(null, { status: 204, headers: buildCorsHeaders(request) })
}

// GET /api/settings/system - Fetch current system settings
export async function GET(request: NextRequest) {
  try {
    // I get or create the system settings (there should only be one record)
    let settings = await db.systemSettings.findUnique({
      where: { id: 1 }
    })

    // If no settings exist, create default ones
    if (!settings) {
      settings = await db.systemSettings.create({
        data: { id: 1 }
      })
    }

    return NextResponse.json(settings, { headers: buildCorsHeaders(request) })

  } catch (error) {
    console.error('Error fetching system settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch system settings' },
      { status: 500, headers: buildCorsHeaders(request) }
    )
  }
}

// PUT /api/settings/system - Update system settings
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    
    // I validate the numeric fields to ensure they're positive integers
    const numericFields = [
      'defaultInteractionDays',
      'foundationsInteractionDays', 
      'liftoffInteractionDays',
      'lightspeedInteractionDays',
      'program101InteractionDays',
      'priorityEscalationDays',
      'followUpGracePeriodDays'
    ]

    for (const field of numericFields) {
      if (data[field] !== undefined) {
        const value = parseInt(data[field])
        if (isNaN(value) || value < 1) {
          return NextResponse.json(
            { error: `${field} must be a positive integer` },
            { status: 400, headers: buildCorsHeaders(request) }
          )
        }
        data[field] = value
      }
    }

    // I update the system settings, creating if it doesn't exist
    const settings = await db.systemSettings.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, ...data }
    })

    return NextResponse.json(settings, { headers: buildCorsHeaders(request) })

  } catch (error) {
    console.error('Error updating system settings:', error)
    return NextResponse.json(
      { error: 'Failed to update system settings' },
      { status: 500, headers: buildCorsHeaders(request) }
    )
  }
}
