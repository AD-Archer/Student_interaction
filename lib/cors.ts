/**
 * CORS utility for API routes
 * Provides consistent CORS headers across all API endpoints to ensure
 * proper cross-origin requests work on Vercel deployment.
 * All routes should use these headers to prevent CORS issues.
 */

import { NextRequest, NextResponse } from 'next/server'

// Build CORS headers per request to support credentials
export function buildCorsHeaders(request: NextRequest) {
  const origin = request.headers.get('origin') || '*'
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true'
  }
}

// Handle preflight requests consistently
export function handleOptionsRequest(request: NextRequest) {
  return NextResponse.json(null, { status: 204, headers: buildCorsHeaders(request) })
}

// Create a response with CORS headers
// I use a generic type T here so this function is type-safe for any response data shape
export function createCorsResponse<T>(data: T, options: { status?: number } = {}, request: NextRequest) {
  return NextResponse.json(data, { 
    status: options.status || 200, 
    headers: buildCorsHeaders(request) 
  })
}

// Create an error response with CORS headers
export function createCorsErrorResponse(error: string, status: number, request: NextRequest) {
  return NextResponse.json(
    { error },
    { status, headers: buildCorsHeaders(request) }
  )
}
