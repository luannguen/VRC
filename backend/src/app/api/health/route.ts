// API route for health checks to support frontend connectivity testing

import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Common health data to return
const getHealthData = () => ({
  status: 'ok',
  timestamp: new Date().toISOString(),
  server: 'VRC Backend API',
  environment: process.env.NODE_ENV || 'development',
  apiVersion: '1.0.0',
});

// Common headers for all responses
const getCommonHeaders = () => {
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  headers.set('X-Health-Status', 'ok');
  headers.set('X-Backend-Available', 'true');
  headers.set('X-Health-Timestamp', new Date().toISOString());
  return headers;
};

export async function GET(req: NextRequest) {
  console.log(`[API] Health GET request from ${req.headers.get('user-agent') || 'unknown'}`);
  
  try {
    // Return the health data with headers
    return new Response(JSON.stringify(getHealthData()), {
      status: 200,
      headers: getCommonHeaders(),
    });
  } catch (error) {
    console.error('[API] Health GET error:', error);
    
    // Return a fallback response in case of error
    return new Response(JSON.stringify({
      status: 'error',
      message: 'Health check error',
      timestamp: new Date().toISOString(),
    }), {
      status: 200, // Still return 200 to indicate the server is running
      headers: getCommonHeaders(),
    });
  }
}

// Support HEAD requests
export async function HEAD(req: NextRequest) {
  console.log(`[API] Health HEAD request from ${req.headers.get('user-agent') || 'unknown'}`);
  
  try {
    // Return just headers for HEAD requests
    return new Response(null, {
      status: 200,
      headers: getCommonHeaders(),
    });
  } catch (error) {
    console.error('[API] Health HEAD error:', error);
    
    // Return a fallback response in case of error
    const headers = getCommonHeaders();
    headers.set('X-Health-Status', 'warning');
    
    return new Response(null, {
      status: 200, // Still return 200 to indicate the server is running
      headers: headers,
    });
  }
}
