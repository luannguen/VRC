import type { PayloadRequest } from 'payload';
import { NextRequest, NextResponse } from 'next/server';
import payload from 'payload';
import { headersWithCors } from 'payload';

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // Fetch the company information from the global
    const companyInfo = await payload.findGlobal({
      slug: 'company-info',
    });

    // Return success response
    return NextResponse.json(
      companyInfo,
      {
        status: 200,
        headers: headersWithCors({
          headers: new Headers(),
          req: req as unknown as PayloadRequest,
        }),
      }
    );
  } catch (error) {
    console.error('Error fetching company information:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Đã xảy ra lỗi khi lấy thông tin công ty. Vui lòng thử lại sau.',
      },
      {
        status: 500,
        headers: headersWithCors({
          headers: new Headers(),
          req: req as unknown as PayloadRequest,
        }),
      }
    );
  }
}
