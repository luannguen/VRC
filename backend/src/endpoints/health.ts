// A simple health check endpoint that the frontend can use to check if the backend is running

import { Request, Response, NextFunction } from 'express';
import type { Endpoint } from 'payload';

export const healthEndpoint: Endpoint = {
  path: '/health',
  method: 'get',
  handler: (_req: Request, res: Response, next: NextFunction, options: any) => {
    try {
      // Set common headers for all responses
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('X-Health-Status', 'ok');
      res.setHeader('X-Backend-Available', 'true');
      res.setHeader('X-Health-Timestamp', new Date().toISOString());
      
      // For HEAD requests, just send headers with 200 status (no body)
      if (_req.method?.toLowerCase() === 'head') {
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
      
      // Set error headers
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('X-Health-Status', 'warning');
      res.setHeader('X-Backend-Available', 'true');
      res.setHeader('X-Health-Timestamp', new Date().toISOString());
      
      // For HEAD requests, just send headers
      if (_req.method?.toLowerCase() === 'head') {
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
