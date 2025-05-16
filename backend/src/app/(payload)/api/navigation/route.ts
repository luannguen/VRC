import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

// Helper function to create CORS headers
function createCorsHeaders() {
  const headers = new Headers()
  headers.append('Access-Control-Allow-Origin', '*')
  headers.append('Access-Control-Allow-Methods', 'GET, OPTIONS')
  headers.append('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return headers
}

// Pre-flight request handler for CORS
export async function OPTIONS() {
  const headers = createCorsHeaders()
  return new Response(null, { 
    status: 204, 
    headers 
  })
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // Initialize Payload
    const payload = await getPayload({
      config,
    })

    // Get the navigation type from the query parameter (default to 'main')
    const url = new URL(req.url)
    const type = url.searchParams.get('type') || 'main'    // Query the navigation collection
    const result = await payload.find({
      collection: 'navigation' as 'pages',
      where: {
        type: { equals: type },
        status: { equals: 'published' },
      },
      sort: 'order',
      depth: 1, // 1 level of relationship population
    })

    // Return the result
    const headers = createCorsHeaders()
    return NextResponse.json(
      {
        success: true,
        data: result.docs,
        totalDocs: result.totalDocs,
        totalPages: result.totalPages,
        page: result.page,
      },
      {
        status: 200,
        headers,
      }
    )
  } catch (error) {
    console.error('Navigation API Error:', error)
    const headers = createCorsHeaders()
    return NextResponse.json(
      {
        success: false,
        message: 'Có lỗi xảy ra khi lấy dữ liệu menu.',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 500,
        headers,
      }
    )
  }
}
