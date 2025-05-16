// filepath: e:\Download\vrc\backend\src\app\(payload)\api\posts\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { createCorsHeaders } from '../_utils';

// Pre-flight request handler for CORS
export async function OPTIONS() {
  const headers = createCorsHeaders();
  return new Response(null, { 
    status: 204, 
    headers 
  });
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // Initialize Payload
    const payload = await getPayload({
      config,
    });

    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const featured = searchParams.get('featured') === 'true';
    const sort = searchParams.get('sort') || '-publishedAt'; // Default sort by newest first

    // Build where query
    const where: any = {
      status: { equals: 'published' },
    };

    // Add category filter if provided
    if (category) {
      where.categories = {
        in: category,
      };
    }

    // Add featured filter if provided
    if (featured) {
      where.featured = {
        equals: true,
      };
    }

    // Fetch posts with pagination
    const posts = await payload.find({
      collection: 'posts',
      where,
      page,
      limit,
      sort,
      depth: 1, // Get referenced data with depth 1
    });

    const headers = createCorsHeaders();
    return NextResponse.json(
      {
        success: true,
        data: posts.docs,
        totalDocs: posts.totalDocs,
        totalPages: posts.totalPages,
        page: posts.page,
        hasNextPage: posts.hasNextPage,
        hasPrevPage: posts.hasPrevPage,
      },
      {
        status: 200,
        headers,
      }
    );
  } catch (error) {
    console.error('Posts API Error:', error);
    const headers = createCorsHeaders();
    return NextResponse.json(
      {
        success: false,
        message: 'Có lỗi xảy ra khi lấy dữ liệu bài viết.',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 500,
        headers,
      }
    );
  }
}
