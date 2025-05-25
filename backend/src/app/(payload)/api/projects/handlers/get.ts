import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { createCORSHeaders, handleApiError } from '../../_shared/cors';
import { formatApiResponse, formatApiErrorResponse } from '../../products/utils/responses';
import { isAdminRequest } from '../../products/utils/requests';

// Local utility functions for proper admin format
function formatAdminResponse(data: any): NextResponse {
  const headers = createCORSHeaders();
  headers.append('X-Payload-Admin', 'true');
  headers.append('Cache-Control', 'no-cache, no-store, must-revalidate');
  headers.append('Pragma', 'no-cache');
  headers.append('Expires', '0');
  
  return NextResponse.json(data, {
    status: 200,
    headers
  });
}

function formatAdminErrorResponse(message: string, status: number = 404): NextResponse {
  const headers = createCORSHeaders();
  headers.append('X-Payload-Admin', 'true');
  
  return NextResponse.json({
    message,
    errors: []
  }, {
    status,
    headers
  });
}

/**
 * Fetch projects with various filters, sorting, and pagination
 * Following the successful Related Services pattern
 * 
 * GET /api/projects - List all projects with pagination and filters
 * GET /api/projects?slug=example - Get single project by slug
 * GET /api/projects?id=123456 - Get single project by ID
 * GET /api/projects?category=abc - Filter projects by category
 * GET /api/projects?search=query - Search projects
 * GET /api/projects?page=1&limit=10 - Pagination
 * GET /api/projects?sort=createdAt&sortDirection=desc - Sorting
 */
export async function handleGET(req: NextRequest): Promise<NextResponse> {
  try {
    // Initialize Payload
    const payload = await getPayload({
      config,
    });

    const url = new URL(req.url);
    
    // Parse query parameters - handle both URL params and form data (for method override requests)
    let queryParams = new URLSearchParams();
    
    // First, get URL parameters
    url.searchParams.forEach((value, key) => {
      queryParams.set(key, value);
    });
    
    // If this is a POST request with form data (method override), parse form data as query params
    const contentType = req.headers.get('content-type') || '';
    if (req.method === 'POST' && contentType.includes('application/x-www-form-urlencoded')) {
      try {
        const formData = await req.formData();
        for (const [key, value] of formData.entries()) {
          queryParams.set(key, value.toString());
        }
        console.log('GET /api/projects: Parsed form data as query params:', Object.fromEntries(queryParams.entries()));
      } catch (formError) {
        console.log('GET /api/projects: Could not parse form data, using URL params only');
      }
    }
    
    // Check if this is an admin panel request
    const adminRequest = isAdminRequest(req);
    console.log('GET /api/projects: Is admin request:', adminRequest);
    
    // Single project by ID
    const id = queryParams.get('id');
    if (id) {
      console.log('GET /api/projects: Fetching single project by ID:', id);
      
      const project = await payload.findByID({
        collection: 'projects',
        id: id,
        depth: Number(queryParams.get('depth') || 1),
      });

      if (!project) {
        if (adminRequest) {
          return formatAdminErrorResponse('Dự án không tồn tại', 404);
        }
        return formatApiErrorResponse('Dự án không tồn tại', null, 404);
      }

      if (adminRequest) {
        return formatAdminResponse(project);
      }
      return formatApiResponse(project, 'Lấy thông tin dự án thành công');
    }

    // Single project by slug
    const slug = queryParams.get('slug');
    if (slug) {
      console.log('GET /api/projects: Fetching single project by slug:', slug);
      
      const projects = await payload.find({
        collection: 'projects',
        where: {
          slug: {
            equals: slug,
          },
        },
        depth: Number(queryParams.get('depth') || 1),
        limit: 1,
      });

      if (!projects.docs || projects.docs.length === 0) {
        if (adminRequest) {
          return formatAdminErrorResponse('Dự án không tồn tại', 404);
        }
        return formatApiErrorResponse('Dự án không tồn tại', null, 404);
      }

      const project = projects.docs[0];
      if (adminRequest) {
        return formatAdminResponse(project);
      }
      return formatApiResponse(project, 'Lấy thông tin dự án thành công');
    }

    // List projects with filters and pagination
    console.log('GET /api/projects: Fetching projects list with filters');
    
    // Build where conditions
    const where: any = {};
    
    // Filter by category
    const category = queryParams.get('category');
    if (category) {
      where.categories = { in: [category] };
    }
    
    // Filter by featured
    const featured = queryParams.get('featured');
    if (featured === 'true') {
      where.featured = { equals: true };
    }
    
    // Filter by service
    const service = queryParams.get('service');
    if (service) {
      where.services = { in: [service] };
    }
    
    // Search functionality
    const search = queryParams.get('search');
    if (search) {
      where.or = [
        {
          title: {
            contains: search,
          },
        },
        {
          description: {
            contains: search,
          },
        },
      ];
    }

    // Pagination
    const page = Number(queryParams.get('page')) || 1;
    const limit = Number(queryParams.get('limit')) || 10;
    
    // Sorting
    const sort = queryParams.get('sort') || 'createdAt';
    const sortDirection = queryParams.get('sortDirection') || 'desc';
    const sortValue = sortDirection === 'asc' ? sort : `-${sort}`;

    // Additional query parameters for admin interface
    const depth = Number(queryParams.get('depth') || 1);
    
    console.log('GET /api/projects: Query conditions:', {
      where,
      page,
      limit,
      sort: sortValue,
      depth,
    });

    // Execute the query
    const projects = await payload.find({
      collection: 'projects',
      where,
      page,
      limit,
      sort: sortValue,
      depth,
    });

    console.log('GET /api/projects: Found projects:', {
      totalDocs: projects.totalDocs,
      totalPages: projects.totalPages,
      page: projects.page,
      limit: projects.limit,
      docsCount: projects.docs.length,
    });

    // Return admin format for admin requests
    if (adminRequest) {
      return formatAdminResponse({
        docs: projects.docs,
        totalDocs: projects.totalDocs,
        limit: projects.limit,
        totalPages: projects.totalPages,
        page: projects.page,
        pagingCounter: projects.pagingCounter,
        hasPrevPage: projects.hasPrevPage,
        hasNextPage: projects.hasNextPage,
        prevPage: projects.prevPage,
        nextPage: projects.nextPage
      });
    }

    // Return standard API format for direct API requests
    return formatApiResponse({
      projects: projects.docs,
      pagination: {
        total: projects.totalDocs,
        page: projects.page,
        pages: projects.totalPages,
        limit: projects.limit,
        hasNext: projects.hasNextPage,
        hasPrev: projects.hasPrevPage,
        nextPage: projects.nextPage,
        prevPage: projects.prevPage,
      }
    }, 'Lấy danh sách dự án thành công');

  } catch (error) {
    console.error('GET /api/projects: Error fetching projects:', error);
    return handleApiError(error, 'Lỗi khi lấy danh sách dự án');
  }
}

// Export for both direct calls and re-export
export { handleGET as GET };
