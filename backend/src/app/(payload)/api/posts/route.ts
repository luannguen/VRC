import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { SanitizedConfig } from 'payload/config'
// Using a direct import to avoid TypeScript path resolution issues
// At runtime, Next.js will resolve @payload-config correctly
import config from '@payload-config'

// Use imported config directly in the code
// This way we avoid TypeScript errors but the code will still work at runtime
import {
  handleOptionsRequest,
  createCORSResponse,
<<<<<<< HEAD
  handleApiError,
  createCORSHeaders,
  checkAuth
=======
  handleApiError
>>>>>>> parent of f7e78cb (fix preview post)
} from '../_shared/cors'

// Pre-flight request handler for CORS
export function OPTIONS(req: NextRequest) {
  return handleOptionsRequest(req);
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // Initialize Payload
    const config = await getConfig()
    const payload = await getPayload({
      config,
    })
    
<<<<<<< HEAD
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
      _status: {
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
    
=======
    // Implementation depends on the specific API
    // For now, just return a simple response
>>>>>>> parent of f7e78cb (fix preview post)
    return createCORSResponse({
      success: true,
      message: 'posts API endpoint is working!',
    }, 200);
  } catch (error) {
    console.error('API Error:', error);
    return handleApiError(error, 'An error occurred', 500);
  }
}

// Handle DELETE requests to unpublish or permanently delete posts
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    // Check for authentication
    const isAuthenticated = await checkAuth(req, true);
    if (!isAuthenticated) {
      return createCORSResponse({
        success: false,
        message: 'Unauthorized. You must be logged in to perform this action.',
      }, 401);
    }
    
    // Initialize Payload
    const config = await getConfig()
    const payload = await getPayload({
      config,
    });
    
    const url = new URL(req.url);
    
    // Extract post ID from path (e.g. /api/posts/123456)
    const path = url.pathname;
    const pathSegments = path.split('/');
    const postId = pathSegments[pathSegments.length - 1];
    
    if (!postId || postId === 'posts') {
      return createCORSResponse({
        success: false,
        message: 'No post ID provided for deletion.',
      }, 400);
    }
    
    // Check if we should perform a soft delete (unpublish) or hard delete
    const hardDelete = url.searchParams.get('hardDelete') === 'true';
    
    if (hardDelete) {
      // Perform permanent deletion
      await payload.delete({
        collection: 'posts',
        id: postId,
      });
      
      return createCORSResponse({
        success: true,
        message: 'Post permanently deleted successfully.',
      }, 200);
    } else {
      // Soft delete - just unpublish by setting _status to 'draft'
      await payload.update({
        collection: 'posts',
        id: postId,
        data: {
          _status: 'draft',
        },
      });
      
      return createCORSResponse({
        success: true,
        message: 'Post unpublished successfully.',
      }, 200);
    }
  } catch (error) {
    console.error('Delete Post API Error:', error);
    return handleApiError(error, 'Có lỗi xảy ra khi xóa bài viết', 500);
  }
}

// Handle PATCH requests to update posts (including unpublishing)
export async function PATCH(req: NextRequest): Promise<NextResponse> {
  try {
    // Check for authentication
    const isAuthenticated = await checkAuth(req, true);
    if (!isAuthenticated) {
      return createCORSResponse({
        success: false,
        message: 'Unauthorized. You must be logged in to perform this action.',
      }, 401);
    }
    
    // Initialize Payload
    const config = await getConfig()
    const payload = await getPayload({
      config,
    });
    
    const url = new URL(req.url);
    
    // Extract post ID from path (e.g. /api/posts/123456)
    const path = url.pathname;
    const pathSegments = path.split('/');
    const postId = pathSegments[pathSegments.length - 1];
    
    if (!postId || postId === 'posts') {
      return createCORSResponse({
        success: false,
        message: 'No post ID provided for update.',
      }, 400);
    }
    
    // Parse the request body
    let body: any = {};
    try {
      body = await req.json();
    } catch (e) {
      console.error('Error parsing request body:', e);
      return createCORSResponse({
        success: false,
        message: 'Invalid request body.',
      }, 400);
    }
    
    // Perform the update
    const updatedPost = await payload.update({
      collection: 'posts',
      id: postId,
      data: body,
    });
    
    return createCORSResponse({
      success: true,
      message: 'Post updated successfully.',
      data: updatedPost,
    }, 200);
  } catch (error) {
    console.error('Update Post API Error:', error);
    return handleApiError(error, 'Có lỗi xảy ra khi cập nhật bài viết', 500);
  }
}
