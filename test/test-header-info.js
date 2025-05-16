/**
 * Test script for the /api/header-info endpoint
 * Run with: node test/test-header-info.js
 */

const apiUrl = process.env.API_URL || 'http://localhost:3000';
const headerInfoEndpoint = `${apiUrl}/api/header-info`;

async function testHeaderInfoEndpoint() {
  console.log(`Testing header info endpoint: ${headerInfoEndpoint}`);
  console.log('----------------------------------------');

  try {
    // Test GET request
    console.log('Testing GET request...');
    const getResponse = await fetch(headerInfoEndpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    const getStatus = getResponse.status;
    const getHeaders = Object.fromEntries(getResponse.headers.entries());
    const getBody = await getResponse.json();
    
    console.log(`Status: ${getStatus}`);
    console.log('Headers:', JSON.stringify(getHeaders, null, 2));
    
    // Validate the response structure
    console.log('\nValidating response structure:');
    
    // Check for required fields
    const requiredFields = ['companyName', 'contactSection', 'socialMedia', 'navigation'];
    const missingFields = requiredFields.filter(field => !getBody[field]);
    
    if (missingFields.length === 0) {
      console.log('✅ All required top-level fields are present');
    } else {
      console.log(`❌ Missing fields: ${missingFields.join(', ')}`);
    }
    
    // Check contact section fields
    const requiredContactFields = ['phone', 'email', 'address'];
    if (getBody.contactSection) {
      const missingContactFields = requiredContactFields.filter(field => 
        !getBody.contactSection[field] || getBody.contactSection[field].trim() === ''
      );
      
      if (missingContactFields.length === 0) {
        console.log('✅ All required contact fields are present');
      } else {
        console.log(`❌ Missing contact fields: ${missingContactFields.join(', ')}`);
      }
    }
    
    // Check navigation structure
    if (getBody.navigation) {
      const navCheck = checkNavigation(getBody.navigation);
      if (navCheck.valid) {
        console.log('✅ Navigation structure is valid');
        console.log(`   Main links: ${getBody.navigation.mainLinks.length}`);
        console.log(`   More links: ${getBody.navigation.moreLinks.length}`);
      } else {
        console.log(`❌ Navigation structure issues: ${navCheck.message}`);
      }
    }
    
    // Print body in a readable format
    console.log('\nResponse Body:');
    console.log(formatResponseForDisplay(getBody));
    console.log('----------------------------------------');    
    // Test OPTIONS request (CORS)
    console.log('Testing OPTIONS request (CORS)...');
    const optionsResponse = await fetch(headerInfoEndpoint, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:5173',
        'Access-Control-Request-Method': 'GET',
      }
    });
    
    const optionsStatus = optionsResponse.status;
    const optionsHeaders = Object.fromEntries(optionsResponse.headers.entries());
    
    console.log(`Status: ${optionsStatus}`);
    console.log('Headers:', JSON.stringify(optionsHeaders, null, 2));
    console.log('----------------------------------------');
    
    // Test result summary
    const success = (
      getStatus === 200 && 
      optionsStatus === 204 && 
      getBody && 
      getBody.companyName &&
      getBody.navigation
    );
    
    if (success) {
      console.log('✅ Header info endpoint is working correctly!');
    } else {
      console.log('❌ Header info endpoint test failed. Check responses above for details.');
    }
    
  } catch (error) {
    console.error('❌ Error testing header info endpoint:', error);
  }
}

// Helper function to check navigation structure
function checkNavigation(navigation) {
  if (!navigation.mainLinks || !Array.isArray(navigation.mainLinks)) {
    return { valid: false, message: 'mainLinks is missing or not an array' };
  }
  
  if (!navigation.moreLinks || !Array.isArray(navigation.moreLinks)) {
    return { valid: false, message: 'moreLinks is missing or not an array' };
  }
  
  // Check if links have required properties
  const checkLinks = (links) => {
    for (const link of links) {
      if (!link.title || !link.routeKey) {
        return false;
      }
    }
    return true;
  };
  
  if (navigation.mainLinks.length === 0) {
    return { valid: false, message: 'mainLinks array is empty' };
  }
  
  if (!checkLinks(navigation.mainLinks)) {
    return { valid: false, message: 'Some mainLinks items are missing title or routeKey' };
  }
  
  if (!checkLinks(navigation.moreLinks)) {
    return { valid: false, message: 'Some moreLinks items are missing title or routeKey' };
  }
  
  return { valid: true };
}

// Helper function to format the response in a readable way
function formatResponseForDisplay(data) {
  // Create a simplified version for display
  const display = {
    companyName: data.companyName,
    companyShortName: data.companyShortName,
    contactSection: data.contactSection,
    socialMedia: Object.entries(data.socialMedia || {})
      .filter(([_, value]) => value) // Only include non-empty values
      .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {}),
    logo: data.logo ? {
      url: data.logo.url,
      alt: data.logo.alt
    } : undefined,
    navigation: {
      mainLinks: data.navigation?.mainLinks?.map(link => `${link.title} (${link.routeKey})`) || [],
      moreLinks: data.navigation?.moreLinks?.map(link => `${link.title} (${link.routeKey})`) || []
    }
  };
  
  return JSON.stringify(display, null, 2);
}

testHeaderInfoEndpoint();
