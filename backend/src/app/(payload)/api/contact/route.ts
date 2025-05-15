import type { PayloadRequest } from 'payload';
import { NextRequest, NextResponse } from 'next/server';
import payload from 'payload';
import { headersWithCors } from 'payload';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Parse the request body
    const body = await req.json();
    const { name, email, phone, subject, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        {
          success: false,
          message: 'Vui lòng cung cấp đầy đủ thông tin: Họ tên, Email và Nội dung',
        },
        {
          status: 400,
          headers: headersWithCors({
            headers: new Headers(),
            req: req as unknown as PayloadRequest,
          }),
        }
      );
    }

    // Create a new contact submission
    const submission = await payload.create({
      collection: 'contact-submissions',
      data: {
        name,
        email,
        phone: phone || '',
        subject: subject || 'general',
        message,
        status: 'new',
      },
    });

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Yêu cầu liên hệ đã được gửi thành công',
        submission: {
          id: submission.id,
          createdAt: submission.createdAt,
        },
      },
      {
        status: 200,
        headers: headersWithCors({
          headers: new Headers(),
          req: req as unknown as PayloadRequest,
        }),
      }
    );
  } catch (error) {
    console.error('Error submitting contact form:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Đã xảy ra lỗi khi gửi yêu cầu liên hệ. Vui lòng thử lại sau.',
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
