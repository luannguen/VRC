# VRC Testing Structure Documentation

## Overview

Testing in the VRC system is organized into two distinct categories:

1. **Test Scripts**: Located in `/test/` directory
2. **API Test Endpoints**: Located in the backend application routes

## Test Scripts

All test scripts should be placed in the main `/test` directory. These scripts are used to:
- Verify API endpoints are functioning correctly
- Run automated tests
- Provide diagnostic information

Key test files:
- `test-health.js` - Tests the health endpoint
- `test-header-info.js` - Tests header information API
- `test-api-endpoint.js` - Tests the basic API test endpoint
- `test-all-endpoints.js` - Master test script for all endpoints
- `test-navigation.js` - Tests navigation API
- `test-products.js` - Tests products API
- `test-homepage.js` - Tests homepage API
- `test-new-endpoints.js` - Combined test for all new endpoints
- `run-new-api-tests.bat` - Batch file to run all new API tests

## API Test Endpoints

The actual API endpoints that serve test-related responses are part of the backend application:

- `/api/health` - Located at `backend/src/app/api/health/route.ts`
- `/api/test` - Located at `backend/src/app/(payload)/api/test/route.ts`

**Important Note**: These endpoint files should remain in their appropriate locations within the backend source structure, as they are actual API endpoints, not test scripts.

## Running Tests

1. Use the `run-api-tests.bat` in the `/test` directory to run all tests
2. Individual tests can be run with Node.js, e.g., `node test-health.js`

## Maintaining Tests

When creating new API endpoints:
1. Create the endpoint in the appropriate location in the backend source
2. Create a corresponding test script in the `/test` directory
3. Update `test-all-endpoints.js` to include the new test
4. Update documentation as needed

## Avoiding Duplication

- Do not create test endpoints in multiple locations
- Always check existing endpoints before creating new ones
- Keep test scripts consolidated in the `/test` directory
