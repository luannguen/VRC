import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

// Helper function to create CORS headers
function createCorsHeaders() {
  const headers = new Headers()
  headers.append('Access-Control-Allow-Origin', '*')
  headers.append('Access-Control-Allow-Methods', 'GET, OPTIONS')
  headers.append('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return headers
}

// Pre-flight request handler for CORS
export async function OPTIONS() {
  const headers = createCorsHeaders()
  return new Response(null, { 
    status: 204, 
    headers 
  })
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // Initialize Payload
    const payload = await getPayload({
      config,
    })

    // Fetch company info for header/footer
    const companyInfo = await payload.findGlobal({
      slug: 'company-info',
      depth: 1,
    })

    // Fetch header/footer globals
    const header = await payload.findGlobal({
      slug: 'header',
      depth: 1,
    })

    const footer = await payload.findGlobal({
      slug: 'footer',
      depth: 1,
    })    // Fetch navigation for main menu
    const navigation = await payload.find({
      collection: 'navigation' as 'pages',
      where: {
        type: { equals: 'main' },
        status: { equals: 'published' },
      },
      sort: 'order',
      depth: 1,
    })    // Fetch featured products
    const featuredProducts = await payload.find({
      collection: 'products' as 'pages',
      where: {
        featured: { equals: true },
        status: { equals: 'published' },
      },
      limit: 6,
      depth: 1,
    })    // Fetch featured services
    const featuredServices = await payload.find({
      collection: 'services' as 'pages',
      where: {
        featured: { equals: true },
        status: { equals: 'published' },
      },
      limit: 6,
      depth: 1,
    })    // Fetch featured projects
    const featuredProjects = await payload.find({
      collection: 'projects' as 'pages',
      where: {
        featured: { equals: true },
        status: { equals: 'published' },
      },
      limit: 4,
      depth: 1,
    })    // Fetch technologies/partners
    const technologies = await payload.find({
      collection: 'technologies' as 'pages',
      where: {
        featured: { equals: true },
        status: { equals: 'published' },
      },
      limit: 10,
      depth: 1,
    })

    // Fetch recent posts/news
    const recentPosts = await payload.find({
      collection: 'posts',
      where: {
        status: { equals: 'published' },
      },
      sort: '-createdAt',
      limit: 3,
      depth: 1,
    })

    const headers = createCorsHeaders()
    return NextResponse.json(
      {
        success: true,
        data: {
          companyInfo,
          header,
          footer,
          navigation: navigation.docs,
          featuredProducts: featuredProducts.docs,
          featuredServices: featuredServices.docs,
          featuredProjects: featuredProjects.docs,
          technologies: technologies.docs,
          recentPosts: recentPosts.docs,
        },
      },
      {
        status: 200,
        headers,
      }
    )
  } catch (error) {
    console.error('Homepage API Error:', error)
    const headers = createCorsHeaders()
    return NextResponse.json(
      {
        success: false,
        message: 'Có lỗi xảy ra khi lấy dữ liệu trang chủ.',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 500,
        headers,
      }
    )
  }
}
