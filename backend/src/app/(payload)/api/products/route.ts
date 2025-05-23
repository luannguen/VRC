import { NextRequest, NextResponse } from 'next/server';
import { handleGET } from './handlers/get';
import { handlePOST } from './handlers/post';
import { handleUpdate } from './handlers/update';
import { handleDELETE } from './handlers/delete';
import { handleOPTIONS } from './handlers/options';

/**
 * Handle CORS preflight requests
 */
export function OPTIONS(req: NextRequest) {
  return handleOPTIONS(req);
}

/**
 * Get products with filtering, sorting and pagination
 */
export function GET(req: NextRequest): Promise<NextResponse> {
  return handleGET(req);
}

/**
 * Create a new product
 */
export function POST(req: NextRequest): Promise<NextResponse> {
  return handlePOST(req);
}

/**
 * Update an existing product (full update)
 */
export function PUT(req: NextRequest): Promise<NextResponse> {
  return handleUpdate(req);
}

/**
 * Update an existing product (partial update)
 */
export function PATCH(req: NextRequest): Promise<NextResponse> {
  return handleUpdate(req);
}

/**
 * Delete a product
 */
export function DELETE(req: NextRequest): Promise<NextResponse> {
  return handleDELETE(req);
}
