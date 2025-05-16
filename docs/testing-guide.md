# VRC Testing Documentation

## Overview

This document provides comprehensive information about the testing infrastructure for the VRC project.

## Testing Structure

The VRC project testing is organized as follows:

### 1. Test Directory

Located at: `E:\Download\vrc\test`

This directory contains all test scripts and utilities for validating API endpoints and functionality. Key files include:

- `test-health.js`: Tests the health endpoint
- `test-header-info.js`: Tests the header information API
- `test-api-endpoint.js`: Tests the basic API test endpoint
- `test-all-endpoints.js`: Master script that can run all endpoint tests

### 2. API Test Endpoints

The VRC backend exposes several test-focused endpoints:

- `/api/health` - Located at `backend/src/app/api/health/route.ts`
  - Provides system health information
  - Supports GET and HEAD methods
  
- `/api/test` - Located at `backend/src/app/(payload)/api/test/route.ts`
  - Simple API endpoint for connectivity testing
  - Returns a basic JSON response

### 3. API Test HTML Page

A browser-based API testing tool is provided at `/api-test.html`, which can be accessed by:
- Opening http://localhost:3000/api-test.html when the backend is running
- Running the test script: `run-api-tests.bat` in the test directory

## Running Tests

### Automated CLI Tests

```bash
# Navigate to the test directory
cd E:\Download\vrc\test

# Run all tests
node test-all-endpoints.js

# Run a specific test
node test-health.js
node test-header-info.js
node test-api-endpoint.js

# Run a specific endpoint test
node test-all-endpoints.js --endpoint=health
```

### Using the Batch File

```bash
# Navigate to the test directory
cd E:\Download\vrc\test

# Run the batch file
run-api-tests.bat
```

This will:
1. Check if the backend server is running
2. Install test files to the backend public directory
3. Run all API endpoint tests
4. Open the API test page in your default browser

## Best Practices

1. **Keep Tests in the Test Directory**: All test scripts should be located in the `/test` directory.
2. **API Endpoints Stay in API Structure**: Actual API endpoints, even test-related ones, should remain in the backend API directory structure.
3. **Document New Endpoints**: When adding new endpoints, update both the test scripts and this documentation.
4. **Automated Testing**: Update `test-all-endpoints.js` when adding new endpoints to ensure they're included in automated testing.

## Related Documentation

- [Backend API Reference](./backend-api-reference.md)
- [Frontend Integration Guide](./frontend-integration-guide.md)
- [Common API Issues Guide](./common-api-issues-guide.md)
