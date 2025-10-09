// Debug script to test admin users API endpoint
const https = require('https');
const http = require('http');

// Configuration
const config = {
  frontend: 'https://www.unlimiteddatagh.com',
  backend: 'https://unlimitedata.onrender.com',
  endpoints: {
    users: '/api/v1/admin/users',
    statistics: '/api/v1/admin/statistics',
    login: '/api/v1/login'
  }
};

// Test function
async function testEndpoint(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    
    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data,
          url: url
        });
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Main test function
async function runTests() {
  console.log('🔍 ADMIN USERS API DEBUG TEST');
  console.log('================================');
  console.log(`Frontend: ${config.frontend}`);
  console.log(`Backend: ${config.backend}`);
  console.log('');

  // Test 1: Check if backend is accessible
  console.log('1. Testing backend accessibility...');
  try {
    const result = await testEndpoint(`${config.backend}/`);
    console.log(`✅ Backend accessible: ${result.status}`);
  } catch (error) {
    console.log(`❌ Backend not accessible: ${error.message}`);
    return;
  }

  // Test 2: Check admin users endpoint without auth
  console.log('\n2. Testing admin users endpoint (no auth)...');
  try {
    const result = await testEndpoint(`${config.backend}${config.endpoints.users}`);
    console.log(`Status: ${result.status}`);
    console.log(`Response: ${result.data.substring(0, 200)}...`);
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }

  // Test 3: Check admin statistics endpoint without auth
  console.log('\n3. Testing admin statistics endpoint (no auth)...');
  try {
    const result = await testEndpoint(`${config.backend}${config.endpoints.statistics}`);
    console.log(`Status: ${result.status}`);
    console.log(`Response: ${result.data.substring(0, 200)}...`);
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }

  // Test 4: Test with mock auth token
  console.log('\n4. Testing with mock auth token...');
  const mockToken = 'mock-token-for-testing';
  try {
    const result = await testEndpoint(`${config.backend}${config.endpoints.users}`, {
      method: 'GET',
      headers: {
        'x-auth-token': mockToken,
        'Content-Type': 'application/json'
      }
    });
    console.log(`Status: ${result.status}`);
    console.log(`Response: ${result.data.substring(0, 200)}...`);
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }

  // Test 5: Check CORS headers
  console.log('\n5. Testing CORS headers...');
  try {
    const result = await testEndpoint(`${config.backend}${config.endpoints.users}`, {
      method: 'OPTIONS',
      headers: {
        'Origin': config.frontend,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'x-auth-token,content-type'
      }
    });
    console.log(`Status: ${result.status}`);
    console.log('CORS Headers:');
    Object.entries(result.headers).forEach(([key, value]) => {
      if (key.toLowerCase().startsWith('access-control')) {
        console.log(`  ${key}: ${value}`);
      }
    });
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }

  console.log('\n================================');
  console.log('✅ Debug test completed');
}

// Run the tests
runTests().catch(console.error);
