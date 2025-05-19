import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'



import {
  handleOptionsRequest,
  createCORSResponse,
  handleApiError,
  createCORSHeaders
} from '../_shared/cors';

// Pre-flight request handler for CORS
export function OPTIONS(req: NextRequest) {
  return handleOptionsRequest(req);
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
      });
      
      if (project.docs.length === 0) {
        const headers = createCORSHeaders();
        return handleApiError(new Error('Project not found'), 'Không tìm thấy dự án.', 404);
      }

      const headers = createCORSHeaders()
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

    const headers = createCORSHeaders()
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
    const headers = createCORSHeaders()
    return handleApiError(error, 'Có lỗi xảy ra khi lấy dữ liệu dự án.', 500)
  }
}
