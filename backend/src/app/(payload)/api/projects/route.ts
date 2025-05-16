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
    const category = url.searchParams.get('category')
    const featured = url.searchParams.get('featured') === 'true'
    const service = url.searchParams.get('service')
    const slug = url.searchParams.get('slug')
    const search = url.searchParams.get('search')

    // Build the query conditionally
    const query: any = {
      status: {
        equals: 'published',
      },
    }

    // Add filters if they exist
    if (category) {
      query.categories = {
        in: [category],
      }
    }

    if (featured) {
      query.featured = {
        equals: true,
      }
    }

    if (service) {
      query.services = {
        contains: service,
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
    }    // If fetching a single project by slug
    if (slug) {
      const project = await payload.find({
        collection: 'projects' as 'pages',
        where: {
          slug: { equals: slug },
          status: { equals: 'published' },
        },
        depth: 2, // Populate relationships 2 levels deep
      })

      if (project.docs.length === 0) {
        const headers = createCorsHeaders()
        return NextResponse.json(
          {
            success: false,
            message: 'Không tìm thấy dự án.',
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
          data: project.docs[0],
        },
        {
          status: 200,
          headers,
        }
      )
    }    // Otherwise fetch a list of projects
    const projects = await payload.find({
      collection: 'projects' as 'pages',
      where: query,
      sort: '-updatedAt', // Most recently updated first
      page,
      limit,
      depth: 1, // Populate relationships 1 level deep
    })

    const headers = createCorsHeaders()
    return NextResponse.json(
      {
        success: true,
        data: projects.docs,
        totalDocs: projects.totalDocs,
        totalPages: projects.totalPages,
        page: projects.page,
        hasNextPage: projects.hasNextPage,
        hasPrevPage: projects.hasPrevPage,
      },
      {
        status: 200,
        headers,
      }
    )
  } catch (error) {
    console.error('Projects API Error:', error)
    const headers = createCorsHeaders()
    return NextResponse.json(
      {
        success: false,
        message: 'Có lỗi xảy ra khi lấy dữ liệu dự án.',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 500,
        headers,
      }
    )
  }
}
