// A simple health check endpoint that the frontend can use to check if the backend is running

import { Request, Response } from 'express';
import type { Endpoint } from 'payload';
import { getServerSideURL } from '../utilities/getURL';

// In Payload 3.x, endpoints have a simple handler function
export const healthEndpoint: Endpoint = {
  path: '/health',
  method: 'get', // We register as GET, but handle other methods internally
  handler: async (req: any, res: Response): Promise<Response> => {
    try {
      // Get the origin from request headers
      const origin = req.headers.origin;
      
      // Define allowed origins based on environment
      const corsOrigins = process.env.NODE_ENV === 'production'
        ? [getServerSideURL(), process.env.FRONTEND_URL].filter(Boolean) as string[]
        : [getServerSideURL(), process.env.FRONTEND_URL || 'http://localhost:5173', 
           'http://localhost:8080', 'http://localhost:8081', '*'].filter(Boolean) as string[];
      
      // Determine if the origin is allowed
      let allowOrigin = '*';
      if (process.env.NODE_ENV === 'production') {
        allowOrigin = origin && corsOrigins.includes(origin) ? origin : '';
      }
      
      // Set CORS headers for all responses
      res.setHeader('Access-Control-Allow-Origin', allowOrigin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-custom-header, cache-control, x-requested-with, accept');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
      
      // Handle OPTIONS requests (preflight)
      if (req.method?.toLowerCase() === 'options') {
        return res.status(204).end();
      }
      
      // Set common headers for all responses
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('X-Health-Status', 'ok');
      res.setHeader('X-Backend-Available', 'true');
      res.setHeader('X-Health-Timestamp', new Date().toISOString());
      
      // For HEAD requests, just send headers with 200 status (no body)
      if (req.method?.toLowerCase() === 'head') {
        return res.status(200).end();
      }
      
      // Prepare health data
      const healthData = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        server: 'VRC Backend API',
        environment: process.env.NODE_ENV || 'development',
        apiVersion: '1.0.0',
      };
      
      // For GET requests, send the full health data
      return res.status(200).json(healthData);
    } catch (error) {
      console.error('Health check error:', error);
      
      // Handle CORS headers for error response too
      const origin = req.headers.origin;
      const corsOrigins = process.env.NODE_ENV === 'production'
        ? [getServerSideURL(), process.env.FRONTEND_URL].filter(Boolean) as string[]
        : [getServerSideURL(), process.env.FRONTEND_URL || 'http://localhost:5173', 
           'http://localhost:8080', 'http://localhost:8081', '*'].filter(Boolean) as string[];
      
      // Determine if the origin is allowed
      let allowOrigin = '*';
      if (process.env.NODE_ENV === 'production') {
        allowOrigin = origin && corsOrigins.includes(origin) ? origin : '';
      }
      
      // Set CORS headers for all responses
      res.setHeader('Access-Control-Allow-Origin', allowOrigin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-custom-header, cache-control, x-requested-with, accept');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
      
      // Set error headers
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('X-Health-Status', 'warning');
      res.setHeader('X-Backend-Available', 'true');
      res.setHeader('X-Health-Timestamp', new Date().toISOString());
      
      // For HEAD requests, just send headers
      if (req.method?.toLowerCase() === 'head') {
        return res.status(200).end();
      }
      
      // For GET requests, send error info
      return res.status(200).json({
        status: 'warning',
        message: 'Health check experienced an error but the server is still running',
        timestamp: new Date().toISOString(),
      });
    }
  },
};
