// Test script for the health endpoint
import fetch from 'node-fetch';

// Configuration
const baseUrl = process.env.API_URL || 'http://localhost:3000/api';

async function testHealthEndpoint() {
  console.log('Testing Health Endpoint...\n');
  
  try {
    // Test GET request
    console.log('Testing GET request to /health endpoint...');
    const getResponse = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    console.log(`GET Status: ${getResponse.status}`);
    
    // Log headers
    console.log('GET Response Headers:');
    getResponse.headers.forEach((value, name) => {
      console.log(`  ${name}: ${value}`);
    });
    
    // Log response body for GET
    if (getResponse.headers.get('content-type')?.includes('application/json')) {
      const data = await getResponse.json();
      console.log('GET Response Body:');
      console.log(JSON.stringify(data, null, 2));
    }
    
    console.log('\n---------------------------------------\n');
    
    // Test HEAD request
    console.log('Testing HEAD request to /health endpoint...');
    const headResponse = await fetch(`${baseUrl}/health`, {
      method: 'HEAD',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    console.log(`HEAD Status: ${headResponse.status}`);
    
    // Log headers
    console.log('HEAD Response Headers:');
    headResponse.headers.forEach((value, name) => {
      console.log(`  ${name}: ${value}`);
    });
    
    console.log('\n---------------------------------------\n');
    
    // Overall test result
    console.log('Health Endpoint Test Results:');
    console.log(`GET Request: ${getResponse.ok ? 'SUCCESS ✅' : 'FAILED ❌'}`);
    console.log(`HEAD Request: ${headResponse.ok ? 'SUCCESS ✅' : 'FAILED ❌'}`);
    
    if (getResponse.ok && headResponse.ok) {
      console.log('\nAll tests PASSED! The health endpoint is working correctly.');
    } else {
      console.log('\nSome tests FAILED. Please check the issues above.');
    }
    
  } catch (error) {
    console.error('Error testing health endpoint:', error.message);
    console.error('Make sure the backend server is running.');
  }
}

// Run the test
testHealthEndpoint();
