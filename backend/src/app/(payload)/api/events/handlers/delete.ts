import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { createCORSHeaders, handleApiError, checkAuth } from "../../_shared/cors";

// Direct utility functions to avoid import issues
function isAdminRequest(req: NextRequest): boolean {
  const referer = req.headers.get('referer') || '';
  return referer.includes('/admin');
}

async function extractEventId(req: NextRequest): Promise<string | null> {
  const url = new URL(req.url);
  let eventId = url.searchParams.get('id');
  
  // Handle admin panel complex query format: where[id][in][0]=123456
  if (!eventId) {
    for (const [key, value] of url.searchParams.entries()) {
      console.log(`Checking param: ${key} = ${value}`);
      
      // Check for where[id][in][0] format
      if (key.includes('where') && key.includes('id') && key.includes('in')) {
        eventId = value;
        console.log(`Extracted event ID from admin query: ${eventId}`);
        break;
      }
      
      // Check for direct id patterns in key names
      if (key.includes('id') && key.includes('in')) {
        eventId = value;
        console.log(`Extracted event ID from pattern: ${eventId}`);
        break;
      }
    }
  }
  
  // Try to extract from request body for POST/PUT requests
  if (!eventId) {
    try {
      const contentType = req.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const body = await req.text();
        if (body) {
          const parsedBody = JSON.parse(body);
          if (parsedBody.id) {
            eventId = parsedBody.id;
            console.log(`Extracted event ID from request body: ${eventId}`);
          }
        }
      }
    } catch (e) {
      console.log('Could not extract ID from request body:', e);
    }
  }
  
  console.log(`Final extracted event ID: ${eventId}`);
  return eventId;
}

function extractEventIds(req: NextRequest): string[] | null {
  const url = new URL(req.url);
  const ids = url.searchParams.get('ids');
  
  if (!ids) {
    return null;
  }
  
  return ids.split(',').map(id => id.trim()).filter(id => id.length > 0);
}

function formatApiResponse(
  data: any, 
  message: string = 'Thành công', 
  status: number = 200,
  success: boolean = true
): NextResponse {
  const headers = createCORSHeaders();
  
  return NextResponse.json(
    {
      success,
      message,
      data,
    },
    {
      status,
      headers,
    }
  );
}

function formatApiErrorResponse(
  message: string,
  data: any = null,
  status: number = 400
): NextResponse {
  const headers = createCORSHeaders();
  
  return NextResponse.json(
    {
      success: false,
      message,
      data,
    },
    {
      status,
      headers,
    }
  );
}

function formatBulkResponse(results: any[], errors: any[], message: string): NextResponse {
  const headers = createCORSHeaders();
  
  return NextResponse.json(
    {
      success: errors.length === 0,
      message,
      data: {
        results,
        errors,
        total: results.length + errors.length,
        successful: results.length,
        failed: errors.length,
      },
    },
    {
      status: errors.length === 0 ? 200 : 207, // 207 = Multi-Status
      headers,
    }
  );
}

/**
 * Delete an event or multiple events
 * 
 * DELETE /api/events?id=123456
 * DELETE /api/events?ids=123456,789012
 * 
 * Requires authentication
 */
export async function handleDELETE(req: NextRequest): Promise<NextResponse> {
  try {
    // Check if this is an admin panel request
    const adminReq = isAdminRequest(req);
    console.log("DELETE /api/events: Is admin request:", adminReq);

    // Require authentication
    const isAuthenticated = await checkAuth(req, true);
    if (!isAuthenticated) {
      return formatApiErrorResponse(
        "Xác thực thất bại. Vui lòng đăng nhập để thực hiện chức năng này.",
        null,
        401
      );
    }

    // Initialize Payload
    const payload = await getPayload({
      config,
    });

    // Extract event IDs
    const eventId = await extractEventId(req);
    const eventIds = extractEventIds(req);
    
    const _headers = createCORSHeaders();
    
    // Handle bulk delete with comma-separated IDs
    if (eventIds) {
      if (eventIds.length === 0) {
        return formatApiErrorResponse("Không có ID sự kiện được cung cấp", null, 400);
      }
      
      // Delete multiple events
      const results = [];
      const errors = [];
      
      for (const id of eventIds) {
        try {
          const event = await payload.delete({
            collection: 'events',
            id: id,
          });
          results.push(event);
        } catch (err: any) {
          errors.push({
            id,
            error: err.message
          });
        }
      }
      
      return formatBulkResponse(results, errors, `Đã xóa ${results.length}/${eventIds.length} sự kiện`);
    }
    
    // Handle single delete
    if (!eventId) {
      return formatApiErrorResponse("ID sự kiện không hợp lệ", null, 400);
    }

    try {
      // Delete the event
      const event = await payload.delete({
        collection: 'events',
        id: eventId,
      });
      
      console.log(`Successfully deleted event: ${eventId}`);

      // Check if this is from admin panel
      if (adminReq) {
        // Payload CMS Admin Panel format
        const headers = createCORSHeaders();
        headers.append('X-Payload-Admin', 'true');
        headers.append('Cache-Control', 'no-cache, no-store, must-revalidate');
        headers.append('Pragma', 'no-cache');
        headers.append('Expires', '0');
        
        // Header đặc biệt để kích hoạt việc làm mới danh sách
        headers.append('X-Payload-Refresh', 'events');
        
        // Trả về CHÍNH XÁC định dạng Payload CMS mong đợi
        // Phát hiện referer để xem request đến từ list view hay edit view
        const referer = req.headers.get('referer') || '';
        const isFromListView = referer.includes('/admin/collections/events') && !referer.includes('/edit');
        
        console.log('Request referer:', referer);
        console.log('Is request from list view:', isFromListView);
        
        if (isFromListView) {
          // Format dành riêng cho list view (khác với edit view)
          const listResponse = {
            docs: [{ id: eventId }],
            errors: [],
            message: null,
          };
          console.log('Response for list view:', listResponse);
          return NextResponse.json(listResponse, { 
            status: 200,
            headers: headers
          });
        } else {
          // Format dành cho edit view (chi tiết sự kiện)
          const detailResponse = {
            message: null,
            doc: {
              id: eventId,
              status: 'deleted'
            },
            errors: [],
          };
          console.log('Response for detail view:', detailResponse);
          return NextResponse.json(detailResponse, { 
            status: 200,
            headers: headers
          });
        }
      }

      // For API clients
      return formatApiResponse(
        null,
        `Đã xóa sự kiện thành công: ${event?.title || eventId}`
      );
    } catch (err: any) {
      console.error("Delete event error:", err);
      
      if (adminReq) {
        // Trả về lỗi cho admin UI đúng định dạng
        const headers = createCORSHeaders();
        headers.append('X-Payload-Admin', 'true');
        
        return NextResponse.json({
          message: `Không thể xóa sự kiện: ${err.message || 'Lỗi không xác định'}`,
          errors: [{
            message: err.message || 'Lỗi không xác định',
            field: 'id'
          }]
        }, {
          status: 404,
          headers
        });
      }
      
      return formatApiErrorResponse(`Không thể xóa sự kiện: ${err.message || 'Lỗi không xác định'}`, null, 404);
    }
  } catch (error) {
    console.error("Events API DELETE Error:", error);
    
    // Kiểm tra nếu là admin request
    const adminReq = isAdminRequest(req);
    if (adminReq) {
      // Định dạng lỗi cho admin UI
      const headers = createCORSHeaders();
      headers.append('X-Payload-Admin', 'true');
      
      return NextResponse.json({
        message: `Lỗi khi xóa sự kiện: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`,
        errors: [{
          message: error instanceof Error ? error.message : 'Lỗi không xác định',
          field: 'general'
        }]
      }, {
        status: 500,
        headers
      });
    }
    
    return handleApiError(error, "Lỗi khi xóa sự kiện");
  }
}
