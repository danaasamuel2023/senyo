/**
 * Debug Live Site Login Issues
 * 
 * This script helps diagnose login connectivity issues on the live site
 */

async function debugLiveSiteLogin() {
  console.log('🔍 Debugging Live Site Login Issues...\n');
  
  // Get current environment info
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'server-side';
  const currentProtocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';
  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'server-side';
  
  console.log('📊 Current Environment:');
  console.log('Host:', currentHost);
  console.log('Protocol:', currentProtocol);
  console.log('Full URL:', currentUrl);
  console.log('Is Localhost:', currentHost === 'localhost');
  
  // Test API URL detection
  console.log('\n🔗 API URL Detection:');
  
  // Simulate the API URL detection logic
  const getApiUrl = () => {
    // Check for environment variable first
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL;
    }
    
    // Environment detection
    const isLocalhost = currentHost === 'localhost';
    return isLocalhost ? 'http://localhost:5001' : 'https://unlimitedata.onrender.com';
  };
  
  const detectedApiUrl = getApiUrl();
  console.log('Detected API URL:', detectedApiUrl);
  console.log('Environment Variable:', process.env.NEXT_PUBLIC_API_URL || 'Not set');
  
  // Test login endpoint
  const loginEndpoint = `${detectedApiUrl}/api/v1/login`;
  console.log('Login Endpoint:', loginEndpoint);
  
  // Test connectivity
  console.log('\n🌐 Connectivity Tests:');
  
  try {
    // Test 1: Basic connectivity to API server
    console.log('Test 1: Basic API server connectivity...');
    const healthResponse = await fetch(`${detectedApiUrl}/`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Health Check Status:', healthResponse.status);
    console.log('Health Check OK:', healthResponse.ok);
    
    if (healthResponse.ok) {
      const healthText = await healthResponse.text();
      console.log('Health Check Response:', healthText);
    }
  } catch (error) {
    console.error('❌ Health Check Failed:', error.message);
    console.log('💡 This indicates the API server is not accessible');
  }
  
  try {
    // Test 2: Login endpoint accessibility
    console.log('\nTest 2: Login endpoint accessibility...');
    const loginResponse = await fetch(loginEndpoint, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword'
      })
    });
    
    console.log('Login Test Status:', loginResponse.status);
    console.log('Login Test OK:', loginResponse.ok);
    
    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.log('Login Error Response:', errorText);
    }
  } catch (error) {
    console.error('❌ Login Endpoint Test Failed:', error.message);
    console.log('💡 This indicates CORS or connectivity issues');
  }
  
  try {
    // Test 3: CORS preflight
    console.log('\nTest 3: CORS preflight test...');
    const corsResponse = await fetch(loginEndpoint, {
      method: 'OPTIONS',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    console.log('CORS Preflight Status:', corsResponse.status);
    console.log('CORS Headers:', {
      'Access-Control-Allow-Origin': corsResponse.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': corsResponse.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': corsResponse.headers.get('Access-Control-Allow-Headers')
    });
  } catch (error) {
    console.error('❌ CORS Preflight Failed:', error.message);
    console.log('💡 This indicates CORS configuration issues');
  }
  
  // Recommendations
  console.log('\n💡 Recommendations:');
  
  if (currentHost !== 'localhost') {
    console.log('1. ✅ You are on the live site (not localhost)');
    console.log('2. 🔧 Check if NEXT_PUBLIC_API_URL environment variable is set correctly');
    console.log('3. 🔧 Verify the backend server is running and accessible');
    console.log('4. 🔧 Check CORS configuration on the backend server');
    console.log('5. 🔧 Ensure the API URL matches your actual backend deployment');
  } else {
    console.log('1. ℹ️  You are on localhost (development)');
    console.log('2. 🔧 Make sure the backend server is running on localhost:5001');
  }
  
  console.log('\n🔧 Quick Fixes to Try:');
  console.log('1. Set NEXT_PUBLIC_API_URL environment variable in your deployment platform');
  console.log('2. Check backend server logs for errors');
  console.log('3. Verify CORS origins include your frontend domain');
  console.log('4. Test API endpoints directly in browser/Postman');
}

// Run the debug
if (typeof window !== 'undefined') {
  // Browser environment
  console.log('🚀 Live Site Login Debug Ready!');
  console.log('📋 Run: debugLiveSiteLogin()');
} else {
  // Node.js environment
  debugLiveSiteLogin().catch(console.error);
}
