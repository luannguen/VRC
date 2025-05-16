/**
 * Comprehensive API Testing Script for VRC Backend
 * 
 * This script tests all available API endpoints in the VRC backend.
 * 
 * Usage:
 *   node test-all-endpoints.js [--endpoint=<name>]
 * 
 * Example:
 *   node test-all-endpoints.js             # Test all endpoints
 *   node test-all-endpoints.js --endpoint=health    # Test only health endpoint
 *   node test-all-endpoints.js --endpoint=header-info   # Test only header-info endpoint
 */

// Configuration
const config = {
  baseUrl: process.env.API_URL || 'http://localhost:3000',
  verbose: process.env.VERBOSE === 'true',
  showHeaders: process.env.SHOW_HEADERS === 'true',
};

// Available endpoints to test
const endpoints = {
  health: {
    path: '/api/health',
    methods: ['GET', 'HEAD', 'OPTIONS'],
    description: 'Health check endpoint that provides server status',
  },  'header-info': {
    path: '/api/header-info',
    methods: ['GET', 'OPTIONS'],
    description: 'Provides company information for website header',
    validation: (data) => {
      // Check required top-level fields
      const requiredFields = ['companyName', 'contactSection', 'socialMedia', 'navigation'];
      const missingFields = requiredFields.filter(field => !data[field]);
      
      if (missingFields.length > 0) {
        return { valid: false, message: `Missing required fields: ${missingFields.join(', ')}` };
      }
      
      // Check contact section fields
      const requiredContactFields = ['phone', 'email', 'address'];
      const missingContactFields = requiredContactFields.filter(field => 
        !data.contactSection[field] || data.contactSection[field].trim() === ''
      );
      
      if (missingContactFields.length > 0) {
        return { valid: false, message: `Missing required contact fields: ${missingContactFields.join(', ')}` };
      }
      
      // Check navigation structure
      if (!data.navigation?.mainLinks || !Array.isArray(data.navigation.mainLinks) || data.navigation.mainLinks.length === 0) {
        return { valid: false, message: 'Navigation missing mainLinks or mainLinks is empty' };
      }
      
      if (!data.navigation?.moreLinks || !Array.isArray(data.navigation.moreLinks)) {
        return { valid: false, message: 'Navigation missing moreLinks' };
      }
      
      // Check that all navigation links have title and routeKey
      const allLinks = [...data.navigation.mainLinks, ...data.navigation.moreLinks];
      const invalidLinks = allLinks.filter(link => !link.title || !link.routeKey);
      
      if (invalidLinks.length > 0) {
        return { valid: false, message: `${invalidLinks.length} navigation links are missing title or routeKey` };
      }
      
      return { valid: true };
    }
  }
};

// Parse command line arguments
const args = process.argv.slice(2);
let endpointFilter = null;

// Process command line arguments
args.forEach(arg => {
  if (arg.startsWith('--endpoint=')) {
    endpointFilter = arg.split('=')[1];
  }
  if (arg.startsWith('--verbose')) {
    config.verbose = true;
  }
  if (arg.startsWith('--show-headers')) {
    config.showHeaders = true;
  }
});

// Utility function to format output
function formatJson(obj) {
  return JSON.stringify(obj, null, 2);
}

// Test a specific endpoint with specific method
async function testEndpoint(name, endpoint, method) {
  console.log(`\n[${method}] Testing ${name} endpoint (${endpoint.path})`);
  console.log('-'.repeat(60));
  
  const headers = {
    'Accept': 'application/json',
  };
  
  // Add CORS headers for OPTIONS requests
  if (method === 'OPTIONS') {
    headers['Origin'] = 'http://localhost:5173';
    headers['Access-Control-Request-Method'] = 'GET';
  }
  
  try {
    const response = await fetch(`${config.baseUrl}${endpoint.path}`, {
      method: method,
      headers,
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    // Log headers if requested
    if (config.showHeaders) {
      console.log('\nResponse Headers:');
      response.headers.forEach((value, name) => {
        console.log(`  ${name}: ${value}`);
      });
    }
    
    let data;
    let validationResult = { valid: true };
    
    // For GET requests, log the response body and validate if needed
    if (method === 'GET' && response.headers.get('content-type')?.includes('application/json')) {
      try {
        data = await response.json();
        console.log('\nResponse Body:');
        console.log(formatJson(data));
        
        // Validate the response if a validation function exists
        if (endpoint.validation && typeof endpoint.validation === 'function') {
          validationResult = endpoint.validation(data);
          if (!validationResult.valid) {
            console.log(`\nValidation failed: ${validationResult.message}`);
          } else {
            console.log('\nValidation passed!');
          }
        }
      } catch (error) {
        console.log('\nError parsing JSON response:', error.message);
      }
    }
    
    // Determine if the test passed
    const success = response.ok && (
      (method === 'OPTIONS' && response.status === 204) ||
      (method !== 'OPTIONS')
    );
    
    console.log(`\nTest Result: ${success ? '✅ SUCCESS' : '❌ FAILED'}`);
    
    return { success, endpoint: name, method };
  } catch (error) {
    console.log(`\nError: ${error.message}`);
    console.log(`Test Result: ❌ FAILED`);
    return { success: false, endpoint: name, method, error: error.message };
  }
}

// Main function to run all tests
async function runTests() {
  console.log('==============================================');
  console.log('VRC Backend API Testing Tool');
  console.log(`Base URL: ${config.baseUrl}`);
  console.log('==============================================\n');
  
  const results = [];
  
  // Filter endpoints if specified
  const endpointsToTest = endpointFilter 
    ? { [endpointFilter]: endpoints[endpointFilter] } 
    : endpoints;
  
  if (endpointFilter && !endpoints[endpointFilter]) {
    console.error(`Error: Endpoint "${endpointFilter}" not found!`);
    console.log('Available endpoints:', Object.keys(endpoints).join(', '));
    process.exit(1);
  }
  
  // Test each endpoint with all its methods
  for (const [name, endpoint] of Object.entries(endpointsToTest)) {
    console.log(`\n## Testing ${name} (${endpoint.description})`);
    
    for (const method of endpoint.methods) {
      const result = await testEndpoint(name, endpoint, method);
      results.push(result);
    }
  }
  
  // Print summary
  console.log('\n==============================================');
  console.log('Test Results Summary');
  console.log('==============================================');
  
  const totalTests = results.length;
  const passed = results.filter(r => r.success).length;
  const failed = totalTests - passed;
  
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  
  if (failed > 0) {
    console.log('\nFailed Tests:');
    results.filter(r => !r.success).forEach(result => {
      console.log(`- [${result.method}] ${result.endpoint}${result.error ? `: ${result.error}` : ''}`);
    });
  }
  
  console.log('\n==============================================');
  console.log(failed === 0 ? '✅ ALL TESTS PASSED!' : '❌ SOME TESTS FAILED');
  console.log('==============================================');
  
  return failed === 0 ? 0 : 1;
}

// Run the tests
runTests()
  .then(exitCode => process.exit(exitCode))
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
