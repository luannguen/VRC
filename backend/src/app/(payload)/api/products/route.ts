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
    const headers = createCORSHeaders()    // Get referer to detect if this is an admin panel request
    const referer = req.headers.get('referer') || '';
    const isAdminRequest = referer.includes('/admin');
    console.log('POST /api/products: Is Payload Admin request:', isAdminRequest, 'Referer:', referer);
    
    // Check if this is a save operation from the admin panel
    // This is indicated by the URL containing depth=0 parameter which is used for saving
    const url = new URL(req.url);
    const isAdminSaveOperation = isAdminRequest && url.searchParams.has('depth');
    console.log('POST /api/products: Is admin save operation:', isAdminSaveOperation, 'URL:', req.url);
      // Initialize Payload
    const payload = await getPayload({
      config,
    })
    console.log('POST /api/products: Payload initialized')
    
    // Initialize contentType and other variables we'll need
    const contentType = req.headers.get('content-type') || '';
    console.log('POST /api/products: Content-Type:', contentType);
      // Xử lý request body một lần duy nhất ở đây, lưu vào biến để sử dụng lại
    let parsedBody: Record<string, any> = {};
    let formDataObj: FormData | null = null;
    
    // Đọc và xử lý body dựa vào content-type
    if (contentType.includes('application/json')) {
      try {
        // Clone request để đọc body
        const clonedReq = req.clone();
        parsedBody = await clonedReq.json();
        console.log('POST /api/products: JSON body parsed successfully');
      } catch (error) {
        console.log('POST /api/products: Error parsing JSON body:', error);
      }
    } else if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
      try {
        // Clone request để đọc form data
        const clonedReq = req.clone();
        formDataObj = await clonedReq.formData();
        
        // Convert FormData to object
        for (const [key, value] of formDataObj.entries()) {
          // Special handling for JSON fields
          if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
            try {
              parsedBody[key] = JSON.parse(value);
            } catch (e) {
              parsedBody[key] = value;
            }
          } else {
            parsedBody[key] = value;
          }
        }
        console.log('POST /api/products: Form data parsed successfully');
      } catch (error) {
        console.log('POST /api/products: Error parsing form data:', error);
      }
    }
    
    // Check if this is a query operation from the admin panel
    // This happens when admin needs to fetch related products or do other queries
    let isQueryOperation = false;
    
    // Determine operation type based on different signals
    // 1. Check if body has typical query parameters
    if (isAdminRequest && parsedBody && (
        parsedBody.limit !== undefined || 
        parsedBody.page !== undefined || 
        parsedBody.sort !== undefined ||
        parsedBody.where !== undefined
    )) {
      isQueryOperation = true;
      console.log('POST /api/products: Detected query operation from body structure');
    } 
    // 2. Check URL parameters for query indicators
    else if (isAdminRequest && (
        url.searchParams.has('limit') || 
        url.searchParams.has('page') || 
        url.searchParams.has('sort') ||
        url.searchParams.has('where')
    )) {
      isQueryOperation = true;
      console.log('POST /api/products: Detected query operation from URL parameters');
    }
    // 3. If there's no name field (required for create) but we have other data, it's likely a query
    else if (isAdminRequest && 
             parsedBody && 
             !parsedBody.name && 
             !parsedBody.data?.name && 
             !parsedBody._payload?.name && 
             Object.keys(parsedBody).length > 0) {
      isQueryOperation = true;
      console.log('POST /api/products: Detected likely query operation (no name field but has data)');
    }    // If this looks like an admin save operation (has depth parameter), 
    // let's forward to Payload's built-in API directly
    if (isAdminSaveOperation) {
      console.log('POST /api/products: Detected admin panel save operation, forwarding to Payload directly');
      try {
        // Đọc lại form data từ request gốc
        const originalFormData = await req.formData();
        
        // Log dữ liệu chi tiết để debug
        console.log('POST /api/products: Admin save URL:', req.url);
        console.log('POST /api/products: Admin save headers:', JSON.stringify(Object.fromEntries(req.headers.entries())));
        console.log('POST /api/products: Form data keys:', [...originalFormData.keys()]);
        
        // Chuẩn bị dữ liệu cho Payload
        const data: Record<string, any> = {};
        
        // Xử lý _payload field đặc biệt nếu có
        if (originalFormData.has('_payload')) {
          try {
            const payloadField = originalFormData.get('_payload');
            if (typeof payloadField === 'string') {
              const payloadData = JSON.parse(payloadField);
              console.log('POST /api/products: Parsed _payload data:', payloadData);
              
              // Sử dụng dữ liệu từ _payload
              Object.assign(data, payloadData);
            }
          } catch (err) {
            console.error('POST /api/products: Error parsing _payload field:', err);
          }
        }
        
        // Tạo cấu trúc phân cấp cho các trường nested như images[0][image]
        const nestedFields: Record<string, any[]> = {};
        
        // Xử lý từng field trong form data
        for (const [key, value] of originalFormData.entries()) {
          // Bỏ qua _payload vì đã xử lý ở trên
          if (key === '_payload') continue;
          
          // Xử lý các key có dạng images[0][image] thành nested structure
          if (key.includes('[') && key.includes(']')) {
            const matches = key.match(/([^\[]+)(?:\[([^\]]+)\])(?:\[([^\]]+)\])?/);
            if (matches && matches.length >= 4 && matches[1] && matches[2] && matches[3]) {
              const mainField = matches[1];  // 'images'
              const indexStr = matches[2];   // '0'
              const subField = matches[3];   // 'image'
              
              const index = parseInt(indexStr, 10); // Convert to number
              
              // Initialize nested structures if they don't exist
              if (!nestedFields[mainField]) {
                nestedFields[mainField] = [];
              }
              
              if (!nestedFields[mainField][index]) {
                nestedFields[mainField][index] = {};
              }
              
              // Set the value - handle files specially
              if (value instanceof File) {
                // Store file object as is
                (nestedFields[mainField][index] as Record<string, any>)[subField] = value;
              } else {
                // For non-file values, try to parse JSON if applicable
                if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
                  try {
                    (nestedFields[mainField][index] as Record<string, any>)[subField] = JSON.parse(value);
                  } catch (e) {
                    (nestedFields[mainField][index] as Record<string, any>)[subField] = value;
                  }
                } else {
                  (nestedFields[mainField][index] as Record<string, any>)[subField] = value;
                }
              }
            } else {
              // If it doesn't match our expected pattern, handle as a regular field
              if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
                try {
                  data[key] = JSON.parse(value);
                } catch (e) {
                  data[key] = value;
                }
              } else {
                data[key] = value;
              }
            }
          } else {
            // Regular fields
            if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
              try {
                data[key] = JSON.parse(value);
              } catch (e) {
                data[key] = value;
              }
            } else {
              data[key] = value;
            }
          }
        }
        
        // Merge nested fields into data
        for (const [key, value] of Object.entries(nestedFields)) {
          data[key] = value;
        }
        
        // For relatedProducts field, ensure it's properly formatted
        if (data.relatedProducts) {
          if (Array.isArray(data.relatedProducts)) {
            // Already an array, ensure each entry is properly formatted
            data.relatedProducts = data.relatedProducts.map(item => {
              // If it's already a string (ID), return as is
              if (typeof item === 'string') return item;
              // If it's an object with id property, return the id
              if (item && typeof item === 'object' && 'id' in item) return item.id;
              // Otherwise return the item as is
              return item;
            });
          } else if (typeof data.relatedProducts === 'string') {
            // If it's a string, check if it's JSON or a single ID
            if (data.relatedProducts.startsWith('[')) {
              try {
                data.relatedProducts = JSON.parse(data.relatedProducts);
              } catch (e) {
                data.relatedProducts = [data.relatedProducts];
              }
            } else if (data.relatedProducts.trim() !== '') {
              // Single ID
              data.relatedProducts = [data.relatedProducts];
            } else {
              // Empty string
              data.relatedProducts = [];
            }
          } else if (data.relatedProducts === null || data.relatedProducts === undefined) {
            // Null or undefined
            data.relatedProducts = [];
          }
        }
        
        // Log final data structure for debugging
        console.log('POST /api/products: Final data structure:', JSON.stringify(data, (key, value) => {
          // Don't log File objects as they can't be stringified
          if (value instanceof File) return `[File: ${value.name}, ${value.size} bytes]`;
          return value;
        }));
        
        // Send to Payload API
        const result = await payload.create({
          collection: 'products',
          data: data as any, // Type assertion to bypass TypeScript check since we've carefully prepared the data
          depth: parseInt(url.searchParams.get('depth') || '0'),
          draft: url.searchParams.get('draft') === 'true',
        });
        
        console.log('POST /api/products: Admin save operation successful, product ID:', result.id);
        
        // Return the result in the format expected by the admin panel
        return NextResponse.json(result, {
          status: 201,
          headers,
        });
      } catch (error: any) {
        console.error('POST /api/products: Admin save operation failed:', error);
        
        // Detailed error logging
        if (error.errors) {
          console.log('POST /api/products: Validation errors:', JSON.stringify(error.errors));
        }
        if (error.data) {
          console.log('POST /api/products: Error data:', JSON.stringify(error.data));  
        }
        console.log('POST /api/products: Error stack:', error.stack);
        
        // Format errors for admin panel compatibility
        if (error.errors) {
          // Admin panel expects a specific format for validation errors
          // Each error needs to have a message and field property
          const formattedErrors = Object.entries(error.errors).map(([field, value]: [string, any]) => {
            // Handle nested errors (e.g., images[0].altText)
            const errorMessage = typeof value === 'object' && value.message 
              ? value.message 
              : (typeof value === 'string' ? value : 'Validation error');
            
            return {
              message: errorMessage,
              field: field
            };
          });
          
          console.log('POST /api/products: Formatted errors for admin panel:', JSON.stringify(formattedErrors));
          
          return NextResponse.json({
            errors: formattedErrors
          }, { 
            status: 400, 
            headers 
          });
        }
        
        // Return a generic error if no specific errors found
        return NextResponse.json(
          {
            errors: [
              {
                message: error.message || 'Unknown error',
                data: error.data || {},
              },
            ],
          },
          {
            status: 400,
            headers,
          }
        );
      }
    }
      // Handle the request based on whether it's a query operation or a creation operation
    if (isAdminRequest && isQueryOperation) {
      console.log('POST /api/products: Handling as admin panel query request');
      
      // This is a request from the admin panel to fetch options for relationship fields
      // Forward to the /api/related-products endpoint if it's a related products query
      // or handle directly for other types of queries
      
      // For related products query, redirect to our dedicated endpoint
      if (referer.includes('/admin/collections/products/')) {
        try {
          // Get query parameters from the URL or body
          const url = new URL(req.url);
          const excludeId = url.searchParams.get('id') || '';
          
          // Find products but exclude the current one
          const productsQuery: any = {
            collection: 'products',
            depth: 0,
            limit: 50,
            sort: 'name',
            where: {}
          };
          
          // Exclude current product if we have an ID
          if (excludeId) {
            productsQuery.where.id = {
              not_equals: excludeId
            };
          }
          
          const products = await payload.find(productsQuery);
          
          return NextResponse.json(products, {
            status: 200,
            headers
          });
        } catch (error) {
          console.error('POST /api/products: Error handling related products query:', error);
          return handleApiError(error, 'Lỗi khi lấy danh sách sản phẩm liên quan');
        }
      } else {
        // General query operation, use Payload's find
        try {
          // Extract query parameters from parsed body or URL
          const queryParams: any = parsedBody || {};
          const url = new URL(req.url);
          
          // Default values for find operation
          const limit = queryParams.limit || Number(url.searchParams.get('limit')) || 10;
          const page = queryParams.page || Number(url.searchParams.get('page')) || 1;
          const sort = queryParams.sort || url.searchParams.get('sort') || 'createdAt';
          const depth = queryParams.depth !== undefined ? queryParams.depth : Number(url.searchParams.get('depth')) || 0;
          
          // Construct where clause from parameters
          const where: any = queryParams.where || {};
          
          console.log('POST /api/products: Query params:', JSON.stringify({
            limit, 
            page, 
            sort, 
            depth,
            where
          }));
          
          // Use Payload's find method
          const result = await payload.find({
            collection: 'products',
            where,
            limit,
            page,
            sort,
            depth
          });
          
          return NextResponse.json(result, {
            status: 200,
            headers
          });
        } catch (error) {
          console.error('POST /api/products: Error handling general query:', error);
          return handleApiError(error, 'Lỗi khi truy vấn danh sách sản phẩm');
        }
      }
    } else {
      // This is a product creation request
      console.log('POST /api/products: Handling as product creation request');
      
      // Require authentication for product creation
      const isAuthenticated = await checkAuth(req, true);
      console.log('POST /api/products: Authentication check:', isAuthenticated);
      
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
        );
      }      // Sử dụng parsedBody đã xử lý ở trên
      console.log('POST /api/products: Creation request body:', JSON.stringify(parsedBody));
      
      // Enhanced validation logic for required fields
      if (!parsedBody.name && !parsedBody.data?.name && !parsedBody._payload?.name) {
        console.log('POST /api/products: Validation failed - missing name');
        return NextResponse.json(
          {
            success: false,
            message: 'Tên sản phẩm là bắt buộc',
          },
          {
            status: 400,
            headers,
          }
        );
      }
      
      // Create the product - handle data preparation better
      console.log('POST /api/products: Creating product with payload.create');
      
      // Determine the actual data to use based on different possible structures
      let productData: Record<string, any> = {};
      
      if (parsedBody.data) {
        // Data might be nested under a data property
        productData = parsedBody.data;
      } else if (parsedBody._payload) {
        // Data might be under _payload property
        productData = parsedBody._payload;
      } else if (formDataObj) {
        // For multipart/form-data, build a structured object from form fields
        for (const [key, value] of formDataObj.entries()) {
          // Handle special case of nested fields with array notation
          if (key.includes('[') && key.includes(']')) {
            const matches = key.match(/([^\[]+)(?:\[([^\]]+)\])(?:\[([^\]]+)\])?/);
            if (matches && matches.length >= 4 && matches[1] && matches[2] && matches[3]) {
              const mainField = matches[1];  // e.g. 'images'
              const indexStr = matches[2];   // e.g. '0'
              const subField = matches[3];   // e.g. 'image'
              
              const index = parseInt(indexStr, 10);
              
              // Initialize if not exists
              if (!productData[mainField]) {
                productData[mainField] = [];
              }
              
              if (!productData[mainField][index]) {
                productData[mainField][index] = {};
              }
              
              // Set the value
              (productData[mainField][index] as Record<string, any>)[subField] = value;
            } else {
              // If pattern doesn't match exactly, just set as normal field
              productData[key] = value;
            }
          } else {
            // Regular fields
            productData[key] = value;
          }
        }
      } else {
        // Use parsedBody directly as a fallback
        productData = parsedBody;
      }
      
      // Handle relatedProducts field - ensure proper format
      if (productData.relatedProducts !== undefined) {
        if (productData.relatedProducts === null || 
            productData.relatedProducts === 0 || 
            productData.relatedProducts === '0' ||
            productData.relatedProducts === '') {
          // Set to empty array when empty/null
          productData.relatedProducts = [];
          console.log('POST /api/products: relatedProducts was null/empty, setting to empty array');
        } else if (!Array.isArray(productData.relatedProducts)) {
          // Convert to array if not already
          try {
            if (typeof productData.relatedProducts === 'string') {
              if (productData.relatedProducts.startsWith('[')) {
                // Parse JSON array
                productData.relatedProducts = JSON.parse(productData.relatedProducts);
              } else {
                // Single ID
                productData.relatedProducts = [productData.relatedProducts];
              }
            } else if (typeof productData.relatedProducts === 'object') {
              // Single object
              productData.relatedProducts = [productData.relatedProducts];
            } else {
              // Any other case
              productData.relatedProducts = [];
            }
          } catch (error) {
            console.error('POST /api/products: Error formatting relatedProducts:', error);
            productData.relatedProducts = [];
          }
        }
      }
      
      // Ensure categories is an array
      if (productData.categories !== undefined) {
        if (productData.categories === null || 
            productData.categories === '' || 
            productData.categories === 0) {
          productData.categories = [];
        } else if (!Array.isArray(productData.categories)) {
          try {
            if (typeof productData.categories === 'string') {
              if (productData.categories.startsWith('[')) {
                productData.categories = JSON.parse(productData.categories);
              } else {
                productData.categories = [productData.categories];
              }
            } else if (typeof productData.categories === 'object') {
              productData.categories = [productData.categories];
            } else {
              productData.categories = [];
            }
          } catch (error) {
            console.error('POST /api/products: Error formatting categories:', error);
            productData.categories = [];
          }
        }
      }
      
      // Log final product data before creation
      console.log('POST /api/products: Final product data for creation:', 
        JSON.stringify(productData, (key, value) => {
          // Don't log File objects as they can't be stringified
          if (value instanceof File) return `[File: ${value.name}, ${value.size} bytes]`;
          return value;
        })
      );
        try {
        console.log('POST /api/products: Calling payload.create with data:', JSON.stringify(productData));        const createdProduct = await payload.create({
          collection: 'products',
          data: productData as any, // Type assertion to bypass TypeScript check since we've carefully prepared the data
        });
        console.log('POST /api/products: Product created successfully with ID:', createdProduct.id);
        console.log('POST /api/products: Created product details:', JSON.stringify(createdProduct));

        // For admin panel requests, we need to return in the format expected by Payload admin
        if (isAdminRequest) {
          console.log('POST /api/products: Returning response formatted for admin panel');
          // Return the created product directly, not wrapped in a success object
          return NextResponse.json(createdProduct, {
            status: 201,
            headers,
          });
        } else {
          // For API clients, return in our standard format
          console.log('POST /api/products: Returning response formatted for API clients');
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
          );
        }      } catch (error: any) {
        console.error('POST /api/products: Error creating product:', error);
        
        // Handle validation errors
        if (error.errors) {
          console.log('POST /api/products: Validation errors:', JSON.stringify(error.errors));
          
          // Format errors differently for admin panel vs API clients
          if (isAdminRequest) {
            // Admin panel expects a specific format for validation errors
            // Each error needs to have a message and field property
            const formattedErrors = Object.entries(error.errors).map(([field, value]: [string, any]) => {
              // Handle nested errors (e.g., images[0].altText)
              const errorMessage = typeof value === 'object' && value.message 
                ? value.message 
                : (typeof value === 'string' ? value : 'Validation error');
              
              return {
                message: errorMessage,
                field: field
              };
            });
            
            console.log('POST /api/products: Formatted errors for admin panel:', JSON.stringify(formattedErrors));
            
            return NextResponse.json({
              errors: formattedErrors
            }, { 
              status: 400, 
              headers 
            });
          } else {
            // Format for API clients - more detailed
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
            );
          }
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
        );
      }
    }
  } catch (error: any) {
    console.error('Products API POST Error:', error);
    const headers = createCORSHeaders();
    
    // Log detailed error for debugging
    console.error('POST /api/products: Detailed error:', error.message, error.stack);
    
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
    );
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
      
      // Handle related products field - ensure it's properly formatted
      if (productData.relatedProducts !== undefined) {
        if (productData.relatedProducts === null || productData.relatedProducts === 0 || productData.relatedProducts === '0') {
          // If relatedProducts is null, 0 or '0', set it to an empty array
          productData.relatedProducts = [];
          console.log('PUT /api/products: relatedProducts was null/0, setting to empty array');
        } else if (!Array.isArray(productData.relatedProducts)) {
          // If it's not an array (but not null/undefined), try to format it properly
          try {
            if (typeof productData.relatedProducts === 'string') {
              // Try to parse JSON if it's a string
              if (productData.relatedProducts.trim() === '') {
                productData.relatedProducts = [];
              } else if (productData.relatedProducts.startsWith('[')) {
                productData.relatedProducts = JSON.parse(productData.relatedProducts);
              } else {
                // Single ID as string
                productData.relatedProducts = [productData.relatedProducts];
              }
            } else if (typeof productData.relatedProducts === 'object') {
              // Handle single object case
              productData.relatedProducts = [productData.relatedProducts];
            } else {
              // Any other case, set to empty
              productData.relatedProducts = [];
            }
            console.log('PUT /api/products: Formatted relatedProducts:', JSON.stringify(productData.relatedProducts));
          } catch (error) {
            console.error('PUT /api/products: Error formatting relatedProducts, setting to empty array:', error);
            productData.relatedProducts = [];
          }
        }
      }
      
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
      
      // Handle related products field - ensure it's properly formatted
      if (productData.relatedProducts !== undefined) {
        if (productData.relatedProducts === null || productData.relatedProducts === 0 || productData.relatedProducts === '0') {
          // If relatedProducts is null, 0 or '0', set it to an empty array
          productData.relatedProducts = [];
          console.log('PATCH /api/products: relatedProducts was null/0, setting to empty array');
        } else if (!Array.isArray(productData.relatedProducts)) {
          // If it's not an array (but not null/undefined), try to format it properly
          try {
            if (typeof productData.relatedProducts === 'string') {
              // Try to parse JSON if it's a string
              if (productData.relatedProducts.trim() === '') {
                productData.relatedProducts = [];
              } else if (productData.relatedProducts.startsWith('[')) {
                productData.relatedProducts = JSON.parse(productData.relatedProducts);
              } else {
                // Single ID as string
                productData.relatedProducts = [productData.relatedProducts];
              }
            } else if (typeof productData.relatedProducts === 'object') {
              // Handle single object case
              productData.relatedProducts = [productData.relatedProducts];
            } else {
              // Any other case, set to empty
              productData.relatedProducts = [];
            }
            console.log('PATCH /api/products: Formatted relatedProducts:', JSON.stringify(productData.relatedProducts));
          } catch (error) {
            console.error('PATCH /api/products: Error formatting relatedProducts, setting to empty array:', error);
            productData.relatedProducts = [];
          }
        }
      }
      
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
