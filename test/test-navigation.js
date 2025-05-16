/**
 * Test script for VRC Navigation API endpoint
 */

const fetch = require('node-fetch');
const chalk = require('chalk');

// API base URL - adjust as needed for your environment
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
const ENDPOINT = '/navigation';

// Formatting helpers
const success = msg => console.log(chalk.green('✓ ') + msg);
const error = msg => console.log(chalk.red('✗ ') + msg);
const info = msg => console.log(chalk.blue('ℹ ') + msg);
const title = msg => console.log(chalk.bold.cyan('\n' + msg + '\n'));

/**
 * Test the navigation API endpoint
 */
async function testNavigationAPI() {
  title('TESTING NAVIGATION API');
  
  try {
    info(`Fetching navigation from ${API_BASE_URL}${ENDPOINT}`);
    
    // Test default (main) navigation
    const response = await fetch(`${API_BASE_URL}${ENDPOINT}`);
    
    if (!response.ok) {
      error(`Navigation API responded with status: ${response.status}`);
      return false;
    }
    
    const data = await response.json();
    
    if (!data.success) {
      error(`Navigation API returned success: false`);
      return false;
    }
    
    if (!Array.isArray(data.data)) {
      error(`Navigation API response doesn't contain data array`);
      return false;
    }
    
    success(`Navigation API basic test successful`);
    
    // Test with type parameter
    const footerResponse = await fetch(`${API_BASE_URL}${ENDPOINT}?type=footer`);
    
    if (!footerResponse.ok) {
      error(`Navigation API (footer) responded with status: ${footerResponse.status}`);
      return false;
    }
    
    const footerData = await footerResponse.json();
    
    if (!footerData.success) {
      error(`Navigation API (footer) returned success: false`);
      return false;
    }
    
    success(`Navigation API with type parameter successful`);
    
    title('NAVIGATION API TEST RESULTS');
    success(`All Navigation API tests passed!`);
    return true;
  } catch (err) {
    error(`Navigation API test error: ${err.message}`);
    return false;
  }
}

// Run the tests if this script is executed directly
if (require.main === module) {
  testNavigationAPI()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(err => {
      console.error(chalk.red('Test execution error:'), err);
      process.exit(1);
    });
}

module.exports = { testNavigationAPI };
