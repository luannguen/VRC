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

    const url = new URL(req.url)
    
    // Parse query parameters
    const page = Number(url.searchParams.get('page')) || 1
    const limit = Number(url.searchParams.get('limit')) || 10
    const type = url.searchParams.get('type')
    const featured = url.searchParams.get('featured') === 'true'
    const slug = url.searchParams.get('slug')
    const search = url.searchParams.get('search')

    // Build the query conditionally
    const query: any = {
      status: {
        equals: 'published',
      },
    }

    // Add filters if they exist
    if (type) {
      query.type = {
        equals: type,
      }
    }

    if (featured) {
      query.featured = {
        equals: true,
      }
    }

    if (slug) {
      query.slug = {
        equals: slug,
      }
    }

    if (search) {
      query.title = {
        like: search,
      }
    }    // If fetching a single service by slug
    if (slug) {
      const service = await payload.find({
        collection: 'services' as 'pages',
        where: {
          slug: { equals: slug },
          status: { equals: 'published' },
        },
        depth: 2, // Populate relationships 2 levels deep
      })

      if (service.docs.length === 0) {
        const headers = createCorsHeaders()
        return NextResponse.json(
          {
            success: false,
            message: 'Không tìm thấy dịch vụ.',
          },
          {
            status: 404,
            headers,
          }
        )
      }

      const headers = createCorsHeaders()
      return NextResponse.json(
        {
          success: true,
          data: service.docs[0],
        },
        {
          status: 200,
          headers,
        }
      )
    }    // Otherwise fetch a list of services
    const services = await payload.find({
      collection: 'services' as 'pages',
      where: query,
      sort: 'order', // Sort by order field
      page,
      limit,
      depth: 1, // Populate relationships 1 level deep
    })

    const headers = createCorsHeaders()
    return NextResponse.json(
      {
        success: true,
        data: services.docs,
        totalDocs: services.totalDocs,
        totalPages: services.totalPages,
        page: services.page,
        hasNextPage: services.hasNextPage,
        hasPrevPage: services.hasPrevPage,
      },
      {
        status: 200,
        headers,
      }
    )
  } catch (error) {
    console.error('Services API Error:', error)
    const headers = createCorsHeaders()
    return NextResponse.json(
      {
        success: false,
        message: 'Có lỗi xảy ra khi lấy dữ liệu dịch vụ.',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 500,
        headers,
      }
    )
  }
}
