/**
 * Test script for VRC Products API endpoint
 */

const fetch = require('node-fetch');
const chalk = require('chalk');

// API base URL - adjust as needed for your environment
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
const ENDPOINT = '/products';

// Formatting helpers
const success = msg => console.log(chalk.green('✓ ') + msg);
const error = msg => console.log(chalk.red('✗ ') + msg);
const info = msg => console.log(chalk.blue('ℹ ') + msg);
const title = msg => console.log(chalk.bold.cyan('\n' + msg + '\n'));

/**
 * Test the products API endpoint
 */
async function testProductsAPI() {
  title('TESTING PRODUCTS API');
  
  try {
    info(`Fetching products from ${API_BASE_URL}${ENDPOINT}`);
    
    // Test basic products list
    const response = await fetch(`${API_BASE_URL}${ENDPOINT}`);
    
    if (!response.ok) {
      error(`Products API responded with status: ${response.status}`);
      return false;
    }
    
    const data = await response.json();
    
    if (!data.success) {
      error(`Products API returned success: false`);
      return false;
    }
    
    if (!Array.isArray(data.data)) {
      error(`Products API response doesn't contain data array`);
      return false;
    }
    
    success(`Products API basic test successful`);
    
    // Test with featured filter
    const featuredResponse = await fetch(`${API_BASE_URL}${ENDPOINT}?featured=true`);
    
    if (!featuredResponse.ok) {
      error(`Products API (featured) responded with status: ${featuredResponse.status}`);
      return false;
    }
    
    const featuredData = await featuredResponse.json();
    
    if (!featuredData.success) {
      error(`Products API (featured) returned success: false`);
      return false;
    }
    
    success(`Products API with featured filter successful`);
    
    // Test with category filter
    const categoryResponse = await fetch(`${API_BASE_URL}${ENDPOINT}?category=software`);
    
    if (!categoryResponse.ok) {
      error(`Products API (category) responded with status: ${categoryResponse.status}`);
      return false;
    }
    
    const categoryData = await categoryResponse.json();
    
    if (!categoryData.success) {
      error(`Products API (category) returned success: false`);
      return false;
    }
    
    success(`Products API with category filter successful`);
    
    // Test with pagination
    const paginationResponse = await fetch(`${API_BASE_URL}${ENDPOINT}?page=1&limit=5`);
    
    if (!paginationResponse.ok) {
      error(`Products API (pagination) responded with status: ${paginationResponse.status}`);
      return false;
    }
    
    const paginationData = await paginationResponse.json();
    
    if (!paginationData.success || !('page' in paginationData) || !('totalPages' in paginationData)) {
      error(`Products API (pagination) response doesn't contain pagination information`);
      return false;
    }
    
    success(`Products API with pagination successful`);
    
    title('PRODUCTS API TEST RESULTS');
    success(`All Products API tests passed!`);
    return true;
  } catch (err) {
    error(`Products API test error: ${err.message}`);
    return false;
  }
}

// Run the tests if this script is executed directly
if (require.main === module) {
  testProductsAPI()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(err => {
      console.error(chalk.red('Test execution error:'), err);
      process.exit(1);
    });
}

module.exports = { testProductsAPI };
