import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { createCORSHeaders, handleApiError } from '../../_shared/cors';
import { formatApiResponse, formatApiErrorResponse } from '../utils/responses';

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
export async function handleGET(req: NextRequest): Promise<NextResponse> {
  try {
    // Initialize Payload
    const payload = await getPayload({
      config,
    });

    const url = new URL(req.url);
    
    // Parse query parameters
    const id = url.searchParams.get("id");
    const slug = url.searchParams.get("slug");
    const page = Number(url.searchParams.get("page")) || 1;
    const limit = Number(url.searchParams.get("limit")) || 20;
    const category = url.searchParams.get("category");
    const featured = url.searchParams.get("featured") === "true";
    const search = url.searchParams.get("search");
    const sort = url.searchParams.get("sort") || "createdAt";
    const sortDirection = url.searchParams.get("sortDirection") || "desc";
    const status = url.searchParams.get("status") || "published";

    const headers = createCORSHeaders();

    // If fetching a single product by ID
    if (id) {
      try {
        const product = await payload.findByID({
          collection: "products",
          id,
          depth: 2, // Populate relationships 2 levels deep
        });

        return NextResponse.json(
          {
            success: true,
            data: product,
          },
          {
            status: 200,
            headers,
          }
        );
      } catch (err: any) {
        return formatApiErrorResponse("Không tìm thấy sản phẩm", err.message, 404);
      }
    }

    // If fetching a single product by slug
    if (slug) {
      const productResult = await payload.find({
        collection: "products",
        where: {
          slug: { equals: slug },
          status: { equals: status },
        },
        depth: 2, // Populate relationships 2 levels deep
      });

      if (productResult.docs && productResult.docs.length > 0) {
        return formatApiResponse(productResult.docs[0]);
      } else {
        return formatApiErrorResponse("Sản phẩm không tồn tại", null, 404);
      }
    }

    // Build the query conditionally for product listing
    const query: any = {};
    
    // Add status filter (default to published for public-facing API)
    if (status) {
      query.status = {
        equals: status,
      };
    }

    // Add filters if they exist
    if (category) {
      query.category = {
        equals: category,
      };
    }

    if (featured) {
      query.featured = {
        equals: true,
      };
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
      ];
    }
    
    // Sort direction preparation
    let sortOptions = "-createdAt";
    if (sort) {
      sortOptions = sortDirection === "asc" ? sort : `-${sort}`;
    }

    // Fetch products with filters, sorting, and pagination
    const products = await payload.find({
      collection: "products",
      where: query,
      sort: sortOptions,
      page,
      limit,
      depth: 2, // Populate relationships 2 levels deep
    });

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
    );
  } catch (error) {
    console.error("Products API Error:", error);
    return handleApiError(error, "Lỗi khi lấy dữ liệu sản phẩm");
  }
}
