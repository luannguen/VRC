import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import {
  handleOptionsRequest,
  createCORSResponse,
  handleApiError,
  createCORSHeaders
} from '../_shared/cors'

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
    const id = url.searchParams.get('id')
    const slug = url.searchParams.get('slug')
    const page = Number(url.searchParams.get('page')) || 1
    const limit = Number(url.searchParams.get('limit')) || 10
    const search = url.searchParams.get('search')
    
    // Extract post ID from path if present (e.g. /api/posts/123456)
    const path = url.pathname
    const pathSegments = path.split('/')
    const pathId = pathSegments[pathSegments.length - 1]
    const postId = id || (pathId && pathId !== 'posts' ? pathId : null)
    
    // If fetching a single post by ID
    if (postId) {
      try {
        const post = await payload.findByID({
          collection: 'posts',
          id: postId,
          depth: 1, // Populate references 1 level deep
        })
        
        return createCORSResponse({
          success: true,
          data: post,
        }, 200)
      } catch (error) {
        console.error(`Error fetching post with ID ${postId}:`, error)
        return handleApiError(error, `Không tìm thấy bài viết với ID: ${postId}`, 404)
      }
    }
    
    // If fetching a single post by slug
    if (slug) {
      try {
        const result = await payload.find({
          collection: 'posts',
          where: {
            slug: {
              equals: slug
            }
          },
          depth: 1,
        })
        
        if (result.docs.length > 0) {
          return createCORSResponse({
            success: true,
            data: result.docs[0],
          }, 200)
        } else {
          return createCORSResponse({
            success: false,
            message: `Không tìm thấy bài viết với slug: ${slug}`,
          }, 404)
        }
      } catch (error) {
        console.error(`Error fetching post with slug ${slug}:`, error)
        return handleApiError(error, `Không tìm thấy bài viết với slug: ${slug}`, 404)
      }
    }
    
    // Otherwise fetch a list of posts
    const query: any = {
      status: {
        equals: 'published'
      }
    }
    
    if (search) {
      query.title = {
        like: search
      }
    }
    
    const posts = await payload.find({
      collection: 'posts',
      where: query,
      page,
      limit,
      depth: 1,
    })
    
    return createCORSResponse({
      success: true,
      data: posts.docs,
      totalDocs: posts.totalDocs,
      totalPages: posts.totalPages,
      page: posts.page,
      hasNextPage: posts.hasNextPage,
      hasPrevPage: posts.hasPrevPage,
    }, 200)
  } catch (error) {
    console.error('Posts API Error:', error);
    return handleApiError(error, 'Có lỗi xảy ra khi tải dữ liệu bài viết', 500);
  }
}
