# VRC Test Directory

This directory contains various test tools and utilities for the VRC project.

## Test Files

- **api-test.html**: A comprehensive API testing tool for the VRC backend. 
  - Tests the Company Info API
  - Tests the Contact Form API
  - Provides authentication diagnostics
  - Includes API documentation

- **test-health.js**: Tests the health endpoint of the backend API.
  - Verifies the server is running and responding
  - Checks for proper CORS headers
  - Tests both GET and HEAD methods

- **test-header-info.js**: Tests the header information endpoint.
  - Validates the response format for website headers
  - Verifies the correct company and contact information is returned
  - Tests CORS functionality

- **test-api-endpoint.js**: Tests the basic API test endpoint.
  - Verifies the /api/test endpoint is working correctly
  - Confirms the endpoint returns proper success responses

- **test-all-endpoints.js**: Runs all API endpoint tests.
  - Executes each individual test file
  - Provides a comprehensive summary of all tests

## API Endpoints vs Test Files

The VRC project follows these conventions:
- **Test Files**: Located in this directory (`/test/`), these are scripts that verify functionality
- **API Endpoints**: Located in `backend/src/app/api/` or `backend/src/app/(payload)/api/`, these are actual server endpoints

Some endpoints, like `/api/test`, are specifically designed to help with testing, but they are actual API endpoints and should remain in the appropriate API directory in the backend source.

## Utility Scripts

- **run-api-tests.bat**: Comprehensive test runner that:
  - Installs test files to the backend public directory
  - Runs all individual test scripts in sequence
  - Opens the API test page in your default browser
  - Provides detailed output for all tests

- **run-api-test.bat**: Opens the API test file in your default browser
- **install-to-public.bat**: Copies the API test file to the backend's public directory so it can be accessed via the server

## How to Use

### Method 1: Using the Backend Server (Recommended)

1. Run `install-to-public.bat` to copy the test file to the backend's public directory
2. Make sure your backend server is running (typically on http://localhost:3000)
3. Access the test file via: http://localhost:3000/api-test.html

### Method 2: Direct File Access (Limited)

1. Open the HTML file directly in your browser
   - Note: API calls will fail due to CORS restrictions when using the file:// protocol
   - The test file will show a warning and explain how to fix this

## Tips for API Testing

- Use the relative API paths (/api/...) to avoid CORS issues
- For protected endpoints, make sure you're authenticated or provide a valid token
- Check the Network tab in browser DevTools for additional debugging information

## Troubleshooting Common Issues

### CORS Errors
If you see CORS errors in the console:
- Make sure you're using relative paths for API endpoints
- Verify that the API has proper CORS headers set up
- Test by opening the HTML from the backend server itself

### Authentication Issues
If you get 401 Unauthorized errors:
- Check if you're logged into the admin panel in another tab
- Try providing a valid Bearer token
- Verify that the global or collection has the correct access control settings
