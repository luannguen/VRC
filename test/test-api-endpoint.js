// Test file for the /api/test endpoint
const fetch = require('node-fetch');

const API_URL = process.env.API_URL || 'http://localhost:3000';

async function testApiTest() {
  console.log('Testing /api/test endpoint...');
  
  try {
    const response = await fetch(`${API_URL}/api/test`);
    const data = await response.json();
    
    if (response.status === 200 && data.success === true) {
      console.log('✓ API test endpoint working correctly');
      console.log('Response:', data);
      return true;
    } else {
      console.error('✗ API test endpoint returned unexpected response');
      console.error('Status:', response.status);
      console.error('Response:', data);
      return false;
    }
  } catch (error) {
    console.error('✗ Error testing API test endpoint:', error.message);
    return false;
  }
}

// If this file is being run directly
if (require.main === module) {
  testApiTest()
    .then(success => {
      if (!success) {
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Unhandled error:', error);
      process.exit(1);
    });
}

module.exports = testApiTest;
