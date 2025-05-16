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
    
    if (!response.ok) {      error(`Homepage API responded with status: ${response.status}`);
      
      try {
        // Try to parse error response to get more details
        const errorData = await response.json();
        console.error('Error details:', JSON.stringify(errorData, null, 2));
      } catch (err) {
        console.error('Failed to parse error response');
      }
      
      return false;
    }
      const data = await response.json();
    
    if (!data.success) {
      error(`Homepage API returned success: false`);
      return false;
    }
    
    // Check for required sections in the data property
    const requiredSections = [
      'companyInfo', 
      'header', 
      'footer', 
      'navigation', 
      'featuredProducts',
      'featuredServices',
      'featuredProjects',
      'technologies',
      'recentPosts',
      'upcomingEvents'
    ];
    
    const missingSections = requiredSections.filter(section => !data.data[section]);
    if (missingSections.length > 0) {
      error(`Homepage API response missing sections: ${missingSections.join(', ')}`);
      return false;
    }
      // Check that arrays are actually arrays
    const arrayChecks = [
      'navigation',
      'featuredProducts',
      'featuredServices', 
      'featuredProjects',
      'technologies',
      'recentPosts',
      'upcomingEvents'
    ];
      for (const path of arrayChecks) {
      const value = data.data[path];
      if (!value || !Array.isArray(value)) {
        error(`Homepage API response section ${path} is not an array`);
        return false;
      }
    }
    
    // Check upcomingEvents structure
    if (data.data.upcomingEvents.length > 0) {
      const event = data.data.upcomingEvents[0];
      const requiredEventFields = ['title', 'slug', 'summary', 'startDate', 'endDate', 'location', 'featuredImage'];
      const missingEventFields = requiredEventFields.filter(field => !event[field]);
      
      if (missingEventFields.length > 0) {
        error(`Event in upcomingEvents is missing required fields: ${missingEventFields.join(', ')}`);
        return false;
      }
      
      // Check if categories are included
      if (!event.categories || !Array.isArray(event.categories)) {
        info(`Note: Event doesn't have categories array. This is expected for older events.`);
      } else {
        success(`Event has categories structure.`);
      }
      
      success(`Event structure is valid`);
    } else {
      info(`No upcoming events to check structure`);
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
