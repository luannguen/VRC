// filepath: e:\Download\vrc\backend\src\app\(payload)\api\header-info\route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

// Helper function to create CORS headers
function createCorsHeaders() {
  const headers = new Headers()
  headers.append('Access-Control-Allow-Origin', '*') // Allow all origins during development
  headers.append('Access-Control-Allow-Methods', 'GET, OPTIONS')
  headers.append('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return headers
}

// Type definition for header info
interface HeaderInfo {
  companyName: string;
  companyShortName?: string;
  contactSection: {
    phone?: string;
    hotline?: string;
    email?: string;
    address?: string;
    workingHours?: string;
  };
  socialMedia: {
    facebook?: string;
    zalo?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
    linkedin?: string;
    telegram?: string;
  };
  logo?: {
    id: string;
    url: string;
    alt?: string;
  };
  navigation?: {
    mainLinks: Array<{title: string, routeKey: string}>;
    moreLinks: Array<{title: string, routeKey: string}>;
  };
}

/**
 * GET handler for header information endpoint
 * Returns only the necessary information for the website header
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // Initialize Payload
    const payload = await getPayload({
      config,
    })

    // Fetch company information
    const companyInfo = await payload.findGlobal({
      slug: 'company-info',
      depth: 1, // Only need depth 1 for header information
    })

    // Fetch header navigation information
    const headerData = await payload.findGlobal({
      slug: 'header',
      depth: 1,
    })
    
    // Extract only the information needed for the header
    const headerInfo = {
      companyName: companyInfo.companyName,
      companyShortName: companyInfo.companyShortName,
      contactSection: {
        phone: companyInfo.contactSection?.phone,
        hotline: companyInfo.contactSection?.hotline,
        email: companyInfo.contactSection?.email,
        address: companyInfo.contactSection?.address,
        workingHours: companyInfo.contactSection?.workingHours,
      },
      socialMedia: {
        facebook: companyInfo.socialMedia?.facebook,
        zalo: companyInfo.socialMedia?.zalo,
        twitter: companyInfo.socialMedia?.twitter,
        instagram: companyInfo.socialMedia?.instagram,
        youtube: companyInfo.socialMedia?.youtube,
        linkedin: companyInfo.socialMedia?.linkedin,
        telegram: companyInfo.socialMedia?.telegram,
      },
      logo: companyInfo.logo,
      navigation: {
        // Chuyển đổi từ định dạng navItems của header sang định dạng mainLinks/moreLinks
        mainLinks: headerData?.navItems?.map(item => ({
          title: item.link?.label,
          routeKey: item.link?.url?.replace(/^\//, '').toUpperCase() || 'HOME',
        })) || [],
        moreLinks: [] // Có thể thêm logic xác định moreLinks nếu cần
      }
    }

    // Return success response
    const headers = createCorsHeaders()
    return NextResponse.json(headerInfo, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error('Error fetching header information:', error)
    
    const headers = createCorsHeaders()
    return NextResponse.json(
      {
        success: false,
        message: 'Đã xảy ra lỗi khi lấy thông tin header. Vui lòng thử lại sau.',
      },
      {
        status: 500,
        headers,
      }
    )
  }
}

// Handle CORS preflight requests
export function OPTIONS() {
  const headers = createCorsHeaders()
  return new NextResponse(null, {
    status: 204,
    headers,
  })
}
