// filepath: e:\Download\vrc\backend\src\app\(payload)\api\health\route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

// Helper function to create CORS headers
function createCorsHeaders() {
  const headers = new Headers()
  headers.append('Access-Control-Allow-Origin', '*') // Allow all origins during development
  headers.append('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
  headers.append('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  headers.append('Cache-Control', 'no-cache, no-store, must-revalidate')
  headers.append('X-Health-Status', 'ok')
  headers.append('X-Backend-Available', 'true')
  headers.append('X-Health-Timestamp', new Date().toISOString())
  return headers
}

/**
 * GET handler for health endpoint
 * Used to check if the API server is running correctly
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // Initialize Payload
    const payload = await getPayload({
      config,
    })

    // Get package.json version if available
    let apiVersion = '1.0.0'
    try {
      const packageInfo = require('../../../../package.json')
      apiVersion = packageInfo.version || apiVersion
    } catch (e) {
      // Fallback to default version if package.json can't be read
    }

    // Basic response payload
    const healthData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      server: 'VRC Backend API',
      environment: process.env.NODE_ENV || 'development',
      apiVersion,
    }

    // Set headers and return response
    const headers = createCorsHeaders()
    return NextResponse.json(healthData, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error('Health check error:', error)
    
    // Even in error conditions, try to return a 200 response
    // This helps monitoring systems know the server is at least responding
    const headers = createCorsHeaders()
    headers.set('X-Health-Status', 'degraded')
    
    return NextResponse.json(
      {
        status: 'degraded',
        timestamp: new Date().toISOString(),
        message: 'API is responding but encountered an internal error',
        error: process.env.NODE_ENV === 'development' 
          ? error instanceof Error ? error.message : String(error)
          : 'Internal server error'
      },
      {
        status: 200, // Still return 200 to indicate server is responding
        headers,
      }
    )
  }
}

/**
 * HEAD handler for health endpoint
 * Lightweight check that only returns headers, no body
 */
export async function HEAD(req: NextRequest): Promise<NextResponse> {
  const headers = createCorsHeaders()
  return new NextResponse(null, {
    status: 200,
    headers,
  })
}

/**
 * OPTIONS handler for CORS preflight requests
 */
export function OPTIONS() {
  const headers = createCorsHeaders()
  return new NextResponse(null, {
    status: 204,
    headers,
  })
}
