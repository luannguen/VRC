/**
 * Test script for newly created VRC API endpoints
 * Tests navigation, products, projects, services, technologies, and homepage endpoints
 */

import fetch from 'node-fetch';

// API base URL - adjust as needed for your environment
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';

// Formatting helpers
const success = msg => console.log('\x1b[32m✓\x1b[0m ' + msg);
const error = msg => console.log('\x1b[31m✗\x1b[0m ' + msg);
const info = msg => console.log('\x1b[34mℹ\x1b[0m ' + msg);
const title = msg => console.log('\x1b[36m\x1b[1m\n' + msg + '\n\x1b[0m');

/**
 * Test a GET endpoint and validate its response structure
 */
async function testEndpoint(endpoint, name, validateFn = null) {
  try {
    info(`Testing ${name} (${endpoint})...`);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    
    if (!response.ok) {
      error(`${name} responded with status: ${response.status}`);
      return false;
    }
    
    const data = await response.json();
    
    if (!data.success) {
      error(`${name} returned success: false`);
      return false;
    }
    
    if (validateFn && !validateFn(data)) {
      error(`${name} data validation failed`);
      return false;
    }
    
    success(`${name} test successful`);
    return true;
  } catch (err) {
    error(`${name} test error: ${err.message}`);
    return false;
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  title('TESTING NEW VRC API ENDPOINTS');
  
  let passed = 0;
  let failed = 0;
  
  // Test Navigation API
  const navResult = await testEndpoint('/navigation', 'Navigation API', (data) => {
    return Array.isArray(data.data) && 'totalDocs' in data;
  });
  navResult ? passed++ : failed++;
  
  // Test Products API - List
  const productsResult = await testEndpoint('/products', 'Products API (List)', (data) => {
    return Array.isArray(data.data) && 'totalDocs' in data;
  });
  productsResult ? passed++ : failed++;
  
  // Test Products API - Featured
  const featuredProductsResult = await testEndpoint('/products?featured=true', 'Products API (Featured)', (data) => {
    return Array.isArray(data.data);
  });
  featuredProductsResult ? passed++ : failed++;
  
  // Test Projects API
  const projectsResult = await testEndpoint('/projects', 'Projects API', (data) => {
    return Array.isArray(data.data) && 'totalPages' in data;
  });
  projectsResult ? passed++ : failed++;
  
  // Test Services API
  const servicesResult = await testEndpoint('/services', 'Services API', (data) => {
    return Array.isArray(data.data) && 'totalDocs' in data;
  });
  servicesResult ? passed++ : failed++;
  
  // Test Technologies API
  const technologiesResult = await testEndpoint('/technologies', 'Technologies API', (data) => {
    return Array.isArray(data.data) && 'totalDocs' in data;
  });
  technologiesResult ? passed++ : failed++;
    // Test Homepage API
  const homepageResult = await testEndpoint('/homepage', 'Homepage API', (data) => {
    return data.data && 
           data.data.companyInfo && 
           Array.isArray(data.data.featuredProducts) && 
           Array.isArray(data.data.featuredServices);
  });
  homepageResult ? passed++ : failed++;
  
  // Summary
  title('TEST RESULTS');
  console.log(`Tests Passed: \x1b[32m${passed}\x1b[0m`);
  console.log(`Tests Failed: \x1b[31m${failed}\x1b[0m`);
  console.log(`Total Tests: ${passed + failed}`);
  
  return failed === 0;
}

// Run the tests
runAllTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('\x1b[31mTest execution error:\x1b[0m', err);
    process.exit(1);
  });

export { runAllTests };
