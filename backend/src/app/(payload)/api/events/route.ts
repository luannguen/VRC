// filepath: e:\Download\vrc\backend\src\app\(payload)\api\events\route.ts
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
    });    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status'); // upcoming, ongoing, past
    const eventType = searchParams.get('type'); // Để tương thích với mã cũ
    const category = searchParams.get('category'); // Lọc theo danh mục mới
    const featured = searchParams.get('featured') === 'true';
    const sort = searchParams.get('sort') || 'startDate'; // Default sort by closest event first
    const tag = searchParams.get('tag'); // Thêm hỗ trợ lọc theo tag

    // Build where query
    const where: any = {
      publishStatus: { equals: 'published' },
    };

    // Add status filter if provided
    if (status) {
      where.status = {
        equals: status,
      };
    }

    // Add event type filter if provided (tương thích với mã cũ)
    if (eventType) {
      where.eventType = {
        equals: eventType,
      };
    }

    // Add category filter if provided (sử dụng quan hệ mới)
    if (category) {
      where.categories = {
        relationTo: 'event-categories',
        in: [category],
      };
    }
    
    // Add tag filter if provided
    if (tag) {
      where.tags = {
        contains: tag,
      };
    }

    // Add featured filter if provided
    if (featured) {
      where.featured = {
        equals: true,
      };
    }

    // Fetch events with pagination
    const events = await payload.find({
      collection: 'events',
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
        data: events.docs,
        totalDocs: events.totalDocs,
        totalPages: events.totalPages,
        page: events.page,
        hasNextPage: events.hasNextPage,
        hasPrevPage: events.hasPrevPage,
      },
      {
        status: 200,
        headers,
      }
    );
  } catch (error) {
    console.error('Events API Error:', error);
    const headers = createCorsHeaders();
    return NextResponse.json(
      {
        success: false,
        message: 'Có lỗi xảy ra khi lấy dữ liệu sự kiện.',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 500,
        headers,
      }
    );
  }
}
