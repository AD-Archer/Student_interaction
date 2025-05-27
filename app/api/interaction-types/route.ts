// API route for interaction types
import { NextResponse } from 'next/server'

// GET /api/interaction-types - Fetch all available interaction types
export async function GET() {
  try {
    // These are the standard interaction types for the system
    const interactionTypes = [
      { value: "all", label: "All Types" },
      { value: "coaching", label: "Coaching" },
      { value: "academic", label: "Academic Support" },
      { value: "career", label: "Career Counseling" },
      { value: "performance", label: "Performance Improvement" },
      { value: "behavioral", label: "Behavioral Intervention" }
    ]

    return NextResponse.json(interactionTypes)

  } catch (error) {
    console.error('Error fetching interaction types:', error)
    return NextResponse.json(
      { error: 'Failed to fetch interaction types' },
      { status: 500 }
    )
  }
}
