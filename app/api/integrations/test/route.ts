/**
 * API route for testing system integrations
 * Handles testing of Playlab AI and Database connections
 * Returns standardized test results for the settings page
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Playlab API configuration
const PLAYLAB_API_KEY = process.env.PLAYLAB_API_KEY
const PLAYLAB_PROJECT_ID = process.env.PLAYLAB_PROJECT_ID
const PLAYLAB_BASE_URL = 'https://www.playlab.ai/api/v1'

interface TestResult {
  success: boolean
  message: string
  details?: Record<string, unknown>
}

/**
 * Test Playlab AI integration by creating a test conversation
 */
async function testPlaylabIntegration(): Promise<TestResult> {
  try {
    if (!PLAYLAB_API_KEY || !PLAYLAB_PROJECT_ID) {
      return {
        success: false,
        message: 'Playlab API credentials not configured'
      }
    }

    // Test creating a conversation
    const response = await fetch(`${PLAYLAB_BASE_URL}/projects/${PLAYLAB_PROJECT_ID}/conversations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PLAYLAB_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    })

    if (!response.ok) {
      const errorData = await response.text()
      return {
        success: false,
        message: `Playlab API error: ${response.status}`,
        details: { error: errorData }
      }
    }

    const data = await response.json() as { conversation?: { id: string } }
    
    // Clean up by attempting to send a test message
    if (data.conversation?.id) {
      try {
        await fetch(`${PLAYLAB_BASE_URL}/projects/${PLAYLAB_PROJECT_ID}/conversations/${data.conversation.id}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${PLAYLAB_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            input: {
              message: 'Test connection from Launchpad Student Form'
            }
          })
        })
      } catch {
        // Ignore cleanup errors - the main test passed
      }
    }

    return {
      success: true,
      message: 'Successfully connected to Playlab AI',
      details: {
        conversationCreated: true,
        projectId: PLAYLAB_PROJECT_ID
      }
    }
  } catch (error) {
    return {
      success: false,
      message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * Test database connection by performing basic operations
 */
async function testDatabaseIntegration(): Promise<TestResult> {
  try {
    // Test basic database connectivity
    await prisma.$connect()
    
    // Test read operation - count total students
    const studentCount = await prisma.student.count()
    
    // Test read operation - count total interactions
    const interactionCount = await prisma.interaction.count()
    
    // Test read operation - count total users
    const userCount = await prisma.user.count()

    return {
      success: true,
      message: 'Database connection successful',
      details: {
        studentsCount: studentCount,
        interactionsCount: interactionCount,
        usersCount: userCount,
        connected: true
      }
    }
  } catch (error) {
    return {
      success: false,
      message: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * Test email system integration (placeholder for future implementation)
 */
async function testEmailIntegration(): Promise<TestResult> {
  // For now, simulate a successful email test since no actual email service is configured
  return {
    success: true,
    message: 'Email system ready (mock implementation)',
    details: {
      provider: 'mock',
      configured: false
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { integration } = await request.json() as { integration: string }

    if (!integration) {
      return NextResponse.json(
        { error: 'Integration name is required' },
        { status: 400 }
      )
    }

    let result: TestResult

    switch (integration.toLowerCase()) {
      case 'playlab ai':
        result = await testPlaylabIntegration()
        break

      case 'database connection':
        result = await testDatabaseIntegration()
        break
      
      case 'email system':
        result = await testEmailIntegration()
        break
      
      default:
        return NextResponse.json(
          { error: `Unknown integration: ${integration}` },
          { status: 400 }
        )
    }

    return NextResponse.json({
      integration,
      timestamp: new Date().toISOString(),
      ...result
    })

  } catch (error) {
    console.error('Integration test error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to test integration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
