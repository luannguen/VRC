import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import {
  createCORSHeaders,
  handleApiError,
  handleOptionsRequest,
  checkAuth,
  createCORSResponse
} from '../_shared/cors'

/**
 * Handle CORS preflight requests
 * Explicitly allow all the methods we use in this API
 */
export function OPTIONS(req: NextRequest) {
  console.log('OPTIONS /api/products: Handling preflight request')
  
  // Use the improved handleOptionsRequest that detects the specific headers needed
  return handleOptionsRequest(req, ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
}

/**
 * Delete a product or multiple products
 * 
 * DELETE /api/products?id=123456
 * DELETE /api/products?ids=123456,789012
 * 
 * Requires authentication
 */
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    // Require authentication
    const isAuthenticated = await checkAuth(req, true)
    if (!isAuthenticated) {
      const headers = createCORSHeaders()
      return NextResponse.json(
        {
          success: false,
          message: 'Xác thực thất bại. Vui lòng đăng nhập để thực hiện chức năng này.',
        },
        {
          status: 401,
          headers,
        }
      )
    }

    // Initialize Payload
    const payload = await getPayload({
      config,
    })

    const url = new URL(req.url)
    
    // Extract product ID from query parameters 
    let productId = url.searchParams.get('id')
    const productIds = url.searchParams.get('ids')
    
    // Handle complex query formats from admin UI
    if (!productId) {
      for (const [key, value] of url.searchParams.entries()) {
        if (key.includes('id') && key.includes('in')) {
          productId = value
          console.log(`Extracted product ID from complex query: ${productId}`)
          break
        }
      }
    }

    // Parse structured query with where[and][1][id][in][0] format
    if (!productId) {
      for (const [key, value] of url.searchParams.entries()) {
        if (key.startsWith('where')) {
          try {
            // Extract ID from complex structure
            const matches = key.match(/where\[.+\]\[id\]\[.+\]\[(\d+)\]/)
            if (matches && matches[1]) {
              productId = value
              console.log(`Extracted product ID from complex where clause: ${productId}`)
              break
            }
          } catch (e) {
            console.error('Error parsing where params:', e)
          }
        }
      }
    }
    
    // Check request body for ID
    if (!productId && !productIds) {
      try {
        const body = await req.json()
        
        if (body && body.id) {
          productId = body.id
        }
      } catch (e) {
        // No JSON body or error parsing body
      }
    }

    const headers = createCORSHeaders()

    // Handle bulk delete with comma-separated IDs
    if (productIds) {
      const idsArray = productIds.split(',').filter(Boolean)
      
      if (idsArray.length === 0) {
        return NextResponse.json(
          {
            success: false,
            message: 'Không có ID sản phẩm được cung cấp',
          },
          {
            status: 400,
            headers,
          }
        )
      }
      
      // Delete multiple products
      const results = []
      const errors = []
        for (const id of idsArray) {
        try {
          const result = await payload.delete({
            collection: 'products',
            id,
          })
          results.push({ id, success: true })
        } catch (err: any) {
          errors.push({ id, error: err.message || 'Lỗi không xác định' })
        }
      }
      
      return NextResponse.json(
        {
          success: errors.length === 0,
          message: `Đã xóa ${results.length}/${idsArray.length} sản phẩm`,
          results,
          errors: errors.length > 0 ? errors : undefined,
        },
        {
          status: errors.length === 0 ? 200 : 207, // Use 207 Multi-Status for partial success
          headers,
        }
      )
    }

    // Handle single delete
    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Không thể xác định ID sản phẩm từ yêu cầu',
        },
        {
          status: 400,
          headers,
        }
      )
    }

    try {
      // Find the product first (to log what's being deleted)
      const product = await payload.findByID({
        collection: 'products',
        id: productId,
      }).catch(() => null)      // Delete the product
      await payload.delete({
        collection: 'products',
        id: productId,
      })

      return NextResponse.json(
        {
          success: true,
          message: `Đã xóa sản phẩm thành công: ${product?.name || productId}`,
        },
        {
          status: 200,
          headers,
        }
      )
    } catch (err: any) {
      return NextResponse.json(
        {
          success: false,
          message: `Không thể xóa sản phẩm: ${err.message}`,
        },
        {
          status: 404,
          headers,
        }
      )
    }
  } catch (error) {
    console.error('Products API DELETE Error:', error)
    return handleApiError(error, 'Lỗi khi xóa sản phẩm')
  }
}

/**
 * Fetch products with various filters, sorting, and pagination
 * 
 * GET /api/products - List all products with pagination and filters
 * GET /api/products?slug=example - Get single product by slug
 * GET /api/products?id=123456 - Get single product by ID
 * GET /api/products?category=abc - Filter products by category
 * GET /api/products?featured=true - Filter featured products
 * GET /api/products?search=query - Search products
 * GET /api/products?page=1&limit=10 - Pagination
 * GET /api/products?sort=createdAt&sortDirection=desc - Sorting
 */
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
    const limit = Number(url.searchParams.get('limit')) || 20
    const category = url.searchParams.get('category')
    const featured = url.searchParams.get('featured') === 'true'
    const search = url.searchParams.get('search')
    const sort = url.searchParams.get('sort') || 'createdAt'
    const sortDirection = url.searchParams.get('sortDirection') || 'desc'
    const status = url.searchParams.get('status') || 'published'

    const headers = createCORSHeaders()

    // If fetching a single product by ID
    if (id) {
      try {
        const product = await payload.findByID({
          collection: 'products',
          id,
          depth: 2, // Populate relationships 2 levels deep
        })

        return NextResponse.json(
          {
            success: true,
            data: product,
          },
          {
            status: 200,
            headers,
          }
        )      } catch (err: any) {
        return NextResponse.json(
          {
            success: false,
            message: 'Không tìm thấy sản phẩm',
            error: err.message || 'Lỗi không xác định',
          },
          {
            status: 404,
            headers,
          }
        )
      }
    }

    // If fetching a single product by slug
    if (slug) {
      const productResult = await payload.find({
        collection: 'products',
        where: {
          slug: { equals: slug },
          status: { equals: status },
        },
        depth: 2, // Populate relationships 2 levels deep
      })

      if (productResult.docs && productResult.docs.length > 0) {
        return NextResponse.json(
          {
            success: true,
            data: productResult.docs[0],
          },
          {
            status: 200,
            headers
          }
        )
      } else {
        return NextResponse.json(
          {
            success: false,
            message: 'Sản phẩm không tồn tại',
          },
          {
            status: 404,
            headers
          }
        )
      }
    }

    // Build the query conditionally for product listing
    const query: any = {}
    
    // Add status filter (default to published for public-facing API)
    if (status) {
      query.status = {
        equals: status,
      }
    }

    // Add filters if they exist
    if (category) {
      query.category = {
        equals: category,
      }
    }

    if (featured) {
      query.featured = {
        equals: true,
      }
    }

    if (search) {
      query.or = [
        {
          name: {
            like: search,
          },
        },
        {
          excerpt: {
            like: search,
          },
        },
        {
          description: {
            like: search,
          },
        },
        {
          productCode: {
            like: search,
          },
        },
      ]
    }    // Sort direction preparation
    let sortOptions = '-createdAt'
    if (sort) {
      sortOptions = sortDirection === 'asc' ? sort : `-${sort}`
    }

    // Fetch products with filters, sorting, and pagination
    const products = await payload.find({
      collection: 'products',
      where: query,
      sort: sortOptions,
      page,
      limit,
      depth: 2, // Populate relationships 2 levels deep
    })

    return NextResponse.json(
      {
        success: true,
        data: products.docs,
        meta: {
          totalDocs: products.totalDocs,
          totalPages: products.totalPages,
          page: products.page,
          limit: products.limit,
          pagingCounter: products.pagingCounter,
          hasPrevPage: products.hasPrevPage,
          hasNextPage: products.hasNextPage,
          prevPage: products.prevPage,
          nextPage: products.nextPage,
        },
      },
      {
        status: 200,
        headers,
      }
    )
  } catch (error) {
    console.error('Products API Error:', error)
    return handleApiError(error, 'Lỗi khi lấy dữ liệu sản phẩm')
  }
}

/**
 * Create a new product
 * 
 * POST /api/products
 * 
 * Requires authentication
 * Request body should contain product data
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  console.log('POST /api/products: Request received')
  try {
    // Log request details for debugging
    console.log('POST /api/products: Headers:', JSON.stringify(Object.fromEntries(req.headers.entries())))
    
    // Create CORS headers once - reuse throughout function
    const headers = createCORSHeaders()
    
    // Require authentication
    const isAuthenticated = await checkAuth(req, true)
    console.log('POST /api/products: Authentication check:', isAuthenticated)
    
    if (!isAuthenticated) {
      return NextResponse.json(
        {
          success: false,
          message: 'Xác thực thất bại. Vui lòng đăng nhập để thực hiện chức năng này.',
        },
        {
          status: 401,
          headers,
        }
      )
    }

    // Initialize Payload
    const payload = await getPayload({
      config,
    })
    console.log('POST /api/products: Payload initialized')    // Parse request body - handle multiple content types with improved debugging
    let body: any = {};
    try {
      // Clone the request to avoid consuming the body twice
      const clonedReq = req.clone();
      
      const contentType = req.headers.get('content-type') || '';
      console.log('POST /api/products: Content-Type:', contentType);
      
      // Check if we're dealing with a Payload CMS admin request
      const isPayloadAdmin = req.headers.get('referer')?.includes('/admin') || false;
      console.log('POST /api/products: Is Payload Admin request:', isPayloadAdmin);
      
      if (contentType.includes('application/json')) {
        // JSON content type
        try {
          body = await req.json();
          console.log('POST /api/products: JSON body parsed:', JSON.stringify(body));
        } catch (jsonError) {
          console.error('POST /api/products: JSON parse error:', jsonError);
          throw jsonError;
        }
      } else if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
        // Form data content type
        try {
          const formData = await req.formData();
          console.log('POST /api/products: Form data keys:', [...formData.keys()]);
          
          // Convert FormData to object while handling special cases
          body = {};
          for (const [key, value] of formData.entries()) {
            console.log(`POST /api/products: Form field ${key}:`, value);
            
            // Check if the field might be a nested object or array (serialized)
            if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
              try {
                body[key] = JSON.parse(value);
              } catch {
                body[key] = value;
              }
            } else {
              body[key] = value;
            }
          }
        } catch (formError) {
          console.error('POST /api/products: Form data parse error:', formError);
          throw formError;
        }
      } else if (isPayloadAdmin) {
        // Special case for Payload Admin - try JSON regardless of content type
        try {
          body = await clonedReq.json();
          console.log('POST /api/products: Payload Admin JSON body:', JSON.stringify(body));
        } catch (adminError) {
          console.error('POST /api/products: Admin body parse error:', adminError);
          throw new Error('Failed to parse Payload Admin request body');
        }
      } else {
        // Try JSON as fallback for all other cases
        try {
          body = await clonedReq.json();
          console.log('POST /api/products: Fallback JSON body:', JSON.stringify(body));
        } catch (fallbackError) {
          console.error('POST /api/products: Fallback parse error:', fallbackError);
          throw new Error(`Unsupported content type: ${contentType}`);
        }
      }
      
      console.log('POST /api/products: Final parsed body:', JSON.stringify(body));} catch (error) {
      const parseError = error as Error;
      console.error('POST /api/products: Error parsing request body:', parseError)
      return NextResponse.json(
        {
          success: false,
          message: 'Không thể đọc dữ liệu gửi lên. Vui lòng đảm bảo gửi dữ liệu JSON hợp lệ hoặc multipart form data.',
          error: parseError.message
        },
        {
          status: 400,
          headers,
        }
      )
    }    // Enhanced validation logic for required fields
    if (!body.name && !body.data?.name && !body._payload?.name) {
      // Check for name in all possible locations (direct, body.data, or body._payload)
      console.log('POST /api/products: Validation failed - missing name')
      return NextResponse.json(
        {
          success: false,
          message: 'Tên sản phẩm là bắt buộc',
        },
        {
          status: 400,
          headers,
        }
      )
    }    // Create the product - handle nested data structure
    console.log('POST /api/products: Creating product with payload.create')
    
    // Determine the actual data to use (Payload admin may send data in a nested property)
    const productData = body.data || body._payload || body;
    
    // Log actual data being used for creation
    console.log('POST /api/products: Final data for creation:', JSON.stringify(productData));
    
    const createdProduct = await payload.create({
      collection: 'products',
      data: productData,
    })
    console.log('POST /api/products: Product created successfully')

    return NextResponse.json(
      {
        success: true,
        message: 'Đã tạo sản phẩm thành công',
        data: createdProduct,
      },
      {
        status: 201,
        headers,
      }
    )  } catch (error: any) {
    console.error('Products API POST Error:', error)
    const headers = createCORSHeaders()
    
    // Log detailed error for debugging
    console.error('POST /api/products: Detailed error:', error.message, error.stack)
    
    // Handle validation errors
    if (error.errors) {
      console.log('POST /api/products: Validation errors:', JSON.stringify(error.errors))
      return NextResponse.json(
        {
          success: false,
          message: 'Dữ liệu không hợp lệ',
          errors: error.errors,
        },
        {
          status: 400,
          headers,
        }
      )
    }
    
    return NextResponse.json(
      {
        success: false,
        message: 'Lỗi khi tạo sản phẩm',
        error: error.message || 'Unknown error',
      },
      {
        status: 500,
        headers,
      }
    )
  }
}

/**
 * Update an existing product
 * 
 * PUT /api/products?id=123456
 * 
 * Requires authentication
 * Request body should contain product data to update
 */
export async function PUT(req: NextRequest): Promise<NextResponse> {
  try {
    // Require authentication
    const isAuthenticated = await checkAuth(req, true)
    if (!isAuthenticated) {
      const headers = createCORSHeaders()
      return NextResponse.json(
        {
          success: false,
          message: 'Xác thực thất bại. Vui lòng đăng nhập để thực hiện chức năng này.',
        },
        {
          status: 401,
          headers,
        }
      )
    }

    // Initialize Payload
    const payload = await getPayload({
      config,
    })

    // Get product ID from query params
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    
    if (!id) {
      const headers = createCORSHeaders()
      return NextResponse.json(
        {
          success: false,
          message: 'ID sản phẩm là bắt buộc',
        },
        {
          status: 400,
          headers,
        }
      )
    }

    // Parse request body with improved handling
    let body;
    try {
      body = await req.json();
      console.log('PUT /api/products: Body parsed:', JSON.stringify(body));
    } catch (parseError) {
      console.error('PUT /api/products: Parse error:', parseError);
      const headers = createCORSHeaders();
      return NextResponse.json(
        {
          success: false,
          message: 'Không thể đọc dữ liệu gửi lên. Vui lòng đảm bảo gửi dữ liệu JSON hợp lệ.',
          error: (parseError as Error).message
        },
        {
          status: 400,
          headers,
        }
      );
    }

    try {
      // Determine the actual data to use (handle both direct data and nested structure)
      const productData = body.data || body;
      
      console.log('PUT /api/products: Using data:', JSON.stringify(productData));
      
      // Update the product
      const updatedProduct = await payload.update({
        collection: 'products',
        id,
        data: productData,
      })

      const headers = createCORSHeaders()
      return NextResponse.json(
        {
          success: true,
          message: 'Đã cập nhật sản phẩm thành công',
          data: updatedProduct,
        },
        {
          status: 200,
          headers,
        }
      )
    } catch (err: any) {
      // Handle if product doesn't exist
      const headers = createCORSHeaders()
      return NextResponse.json(
        {
          success: false,
          message: 'Không tìm thấy sản phẩm',
          error: err.message,
        },
        {
          status: 404,
          headers,
        }
      )
    }
  } catch (error: any) {
    console.error('Products API PUT Error:', error)
    
    // Handle validation errors
    if (error.errors) {
      const headers = createCORSHeaders()
      return NextResponse.json(
        {
          success: false,
          message: 'Dữ liệu không hợp lệ',
          errors: error.errors,
        },
        {
          status: 400,
          headers,
        }
      )
    }
    
    return handleApiError(error, 'Lỗi khi cập nhật sản phẩm')
  }
}

/**
 * Handle PATCH requests for partial updates
 * 
 * PATCH /api/products?id=123456
 * 
 * Requires authentication
 * Request body should contain partial product data to update
 */
export async function PATCH(req: NextRequest): Promise<NextResponse> {
  try {
    // Require authentication
    const isAuthenticated = await checkAuth(req, true)
    if (!isAuthenticated) {
      const headers = createCORSHeaders()
      return NextResponse.json(
        {
          success: false,
          message: 'Xác thực thất bại. Vui lòng đăng nhập để thực hiện chức năng này.',
        },
        {
          status: 401,
          headers,
        }
      )
    }

    // Initialize Payload
    const payload = await getPayload({
      config,
    })

    // Get product ID from query params
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    
    if (!id) {
      const headers = createCORSHeaders()
      return NextResponse.json(
        {
          success: false,
          message: 'ID sản phẩm là bắt buộc',
        },
        {
          status: 400,
          headers,
        }
      )
    }

    // Parse request body with improved handling
    let body;
    try {
      body = await req.json();
      console.log('PATCH /api/products: Body parsed:', JSON.stringify(body));
    } catch (parseError) {
      console.error('PATCH /api/products: Parse error:', parseError);
      const headers = createCORSHeaders();
      return NextResponse.json(
        {
          success: false,
          message: 'Không thể đọc dữ liệu gửi lên. Vui lòng đảm bảo gửi dữ liệu JSON hợp lệ.',
          error: (parseError as Error).message
        },
        {
          status: 400,
          headers,
        }
      );
    }

    try {
      // Determine the actual data to use (handle both direct data and nested structure)
      const productData = body.data || body;
      
      console.log('PATCH /api/products: Using data:', JSON.stringify(productData));
      
      // Update the product
      const updatedProduct = await payload.update({
        collection: 'products',
        id,
        data: productData,
      })

      const headers = createCORSHeaders()
      return NextResponse.json(
        {
          success: true,
          message: 'Đã cập nhật sản phẩm thành công',
          data: updatedProduct,
        },
        {
          status: 200,
          headers,
        }
      )
    } catch (err: any) {
      // Handle if product doesn't exist
      const headers = createCORSHeaders()
      return NextResponse.json(
        {
          success: false,
          message: 'Không tìm thấy sản phẩm',
          error: err.message,
        },
        {
          status: 404,
          headers,
        }
      )
    }
  } catch (error: any) {
    console.error('Products API PATCH Error:', error)
    return handleApiError(error, 'Lỗi khi cập nhật sản phẩm')
  }
}
