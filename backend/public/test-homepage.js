/**
 * Test script for VRC Homepage API endpoint
 */

import fetch from 'node-fetch';

// API base URL - adjust as needed for your environment
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
const ENDPOINT = '/homepage';

// Formatting helpers
const success = msg => console.log('\x1b[32m✓\x1b[0m ' + msg);
const error = msg => console.log('\x1b[31m✗\x1b[0m ' + msg);
const info = msg => console.log('\x1b[34mℹ\x1b[0m ' + msg);
const title = msg => console.log('\x1b[36m\x1b[1m\n' + msg + '\n\x1b[0m');

/**
 * Test the homepage API endpoint
 */
async function testHomepageAPI() {
  title('TESTING HOMEPAGE API');
  
  try {
    info(`Fetching homepage data from ${API_BASE_URL}${ENDPOINT}`);
    
    const response = await fetch(`${API_BASE_URL}${ENDPOINT}`);
    
    if (!response.ok) {
      error(`Homepage API responded with status: ${response.status}`);
      return false;
    }
    
    const data = await response.json();
    
    if (!data.success) {
      error(`Homepage API returned success: false`);
      return false;
    }
    
    // Check for required sections
    const requiredSections = [
      'companyInfo', 
      'header', 
      'footer', 
      'navigation', 
      'featuredProducts',
      'featuredServices',
      'featuredProjects',
      'technologies'
    ];
    
    const missingSections = requiredSections.filter(section => !data[section]);
    
    if (missingSections.length > 0) {
      error(`Homepage API response missing sections: ${missingSections.join(', ')}`);
      return false;
    }
    
    // Check that arrays are actually arrays
    const arrayChecks = [
      'navigation.docs',
      'featuredProducts.docs',
      'featuredServices.docs', 
      'featuredProjects.docs',
      'technologies.docs'
    ];
    
    for (const path of arrayChecks) {
      const parts = path.split('.');
      let obj = data;
      for (const part of parts) {
        obj = obj[part];
        if (!obj) break;
      }
      
      if (!obj || !Array.isArray(obj)) {
        error(`Homepage API response section ${path} is not an array`);
        return false;
      }
    }
    
    success(`Homepage API test successful`);
      title('HOMEPAGE API TEST RESULTS');
    success(`All Homepage API tests passed!`);
    return true;
  } catch (err) {
    error(`Homepage API test error: ${err.message}`);
    return false;
  }
}

// Run the tests if this script is executed directly
testHomepageAPI()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('\x1b[31mTest execution error:\x1b[0m', err);
    process.exit(1);
  });

export { testHomepageAPI };
