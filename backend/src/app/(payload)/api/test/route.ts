import type { PayloadRequest } from 'payload';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // Return a simple success response
    return NextResponse.json(
      { 
        success: true, 
        message: 'API đang hoạt động' 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Đã xảy ra lỗi',
      },
      { status: 500 }
    );
  }
}
