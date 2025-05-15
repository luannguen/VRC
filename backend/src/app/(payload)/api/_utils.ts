/* Utility helper for custom API endpoints */
import config from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'

// Helper function to create CORS headers
export function createCorsHeaders() {
  const headers = new Headers()
  headers.append('Access-Control-Allow-Origin', '*')
  headers.append('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  headers.append('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return headers
}

// Helper function to get Payload instance with proper initialization
export async function getPayloadInstance() {
  // Check if we're in a server environment
  if (typeof window === 'undefined') {
    return await getPayload({
      config,
    })
  }
  return null
}

// Helper function for common error handling
export function handleApiError(error: any, message = 'Đã xảy ra lỗi. Vui lòng thử lại sau.') {
  console.error('API Error:', error)
  const headers = createCorsHeaders()
  
  return NextResponse.json(
    {
      success: false,
      message,
    },
    {
      status: 500,
      headers,
    }
  )
}

// Helper function to handle OPTIONS requests for CORS
export function handleOptionsRequest() {
  const headers = createCorsHeaders()
  return new NextResponse(null, {
    status: 204,
    headers,
  })
}

// Helper function to check authentication
export async function checkAuth(req: NextRequest, requireAuth: boolean) {
  if (!requireAuth) return true
  
  // Check for Bearer token
  const authHeader = req.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) return true
  
  // Check for Payload cookie
  const cookies = req.headers.get('cookie')
  if (cookies && cookies.includes('payload-token=')) return true
  
  return false
}
