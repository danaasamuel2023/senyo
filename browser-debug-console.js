/**
 * Browser Console Debug Script
 * 
 * Copy and paste this into your browser console to debug payment gateway errors
 * Run this while on the admin settings page
 */

async function debugBrowserConsoleErrors() {
  console.log('🔍 Debugging Browser Console Errors...\n');
  
  // Get the current token from localStorage
  const token = localStorage.getItem('authToken');
  if (!token) {
    console.error('❌ No auth token found. Please log in to admin panel first.');
    return;
  }
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
  console.log('🔗 API Base URL:', API_BASE_URL);
  console.log('🔑 Token found:', token ? 'Yes' : 'No');
  
  // Test 1: Check server connectivity
  console.log('\n📡 Test 1: Checking server connectivity...');
  try {
    const healthResponse = await fetch(`${API_BASE_URL}/`, { 
      method: 'GET',
      timeout: 5000 
    });
    console.log('✅ Server is running (Status:', healthResponse.status, ')');
  } catch (error) {
    console.error('❌ Server connectivity error:', error.message);
    console.log('💡 Make sure your server is running on:', API_BASE_URL);
    return;
  }

  // Test 2: Check authentication
  console.log('\n🔐 Test 2: Checking authentication...');
  try {
    const authResponse = await fetch(`${API_BASE_URL}/api/v1/admin/payment-gateway-settings`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (authResponse.ok) {
      console.log('✅ Authentication successful');
    } else if (authResponse.status === 401) {
      console.error('❌ Authentication failed - Invalid or expired token');
      console.log('💡 Try logging out and logging back in to get a fresh token');
      return;
    } else if (authResponse.status === 403) {
      console.error('❌ Access denied - Admin privileges required');
      console.log('💡 Make sure you are logged in as an admin user');
      return;
    } else {
      console.error('❌ Authentication error - Status:', authResponse.status);
      const errorText = await authResponse.text();
      console.log('📄 Error details:', errorText);
      return;
    }
  } catch (error) {
    console.error('❌ Authentication test failed:', error.message);
    return;
  }

  // Test 3: Get current settings
  console.log('\n⚙️ Test 3: Getting current payment gateway settings...');
  try {
    const settingsResponse = await fetch(`${API_BASE_URL}/api/v1/admin/payment-gateway-settings`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (settingsResponse.ok) {
      const settingsData = await settingsResponse.json();
      if (settingsData.success) {
        console.log('✅ Payment gateway settings retrieved successfully');
        console.log('📊 Current settings:', settingsData.data);
      } else {
        console.error('❌ Settings endpoint returned error:', settingsData.error);
      }
    } else {
      console.error('❌ Settings request failed - Status:', settingsResponse.status);
      const errorText = await settingsResponse.text();
      console.log('📄 Error details:', errorText);
    }
  } catch (error) {
    console.error('❌ Settings retrieval error:', error.message);
  }

  // Test 4: Test settings update
  console.log('\n🔄 Test 4: Testing settings update...');
  try {
    const updateResponse = await fetch(`${API_BASE_URL}/api/v1/admin/payment-gateway-settings`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        activeGateway: 'paystack',
        paystackEnabled: true,
        bulkclixEnabled: true,
        paystackPublicKey: 'pk_test_example',
        paystackSecretKey: 'sk_test_example',
        bulkclixApiKey: 'bulkclix_test_key',
        autoSwitch: true,
        fallbackGateway: 'bulkclix'
      })
    });
    
    if (updateResponse.ok) {
      const updateData = await updateResponse.json();
      if (updateData.success) {
        console.log('✅ Settings update successful');
        console.log('📊 Updated settings:', updateData.data);
      } else {
        console.error('❌ Settings update failed:', updateData.error);
      }
    } else {
      console.error('❌ Settings update request failed - Status:', updateResponse.status);
      const errorText = await updateResponse.text();
      console.log('📄 Error details:', errorText);
    }
  } catch (error) {
    console.error('❌ Settings update error:', error.message);
  }

  // Test 5: Check active gateway
  console.log('\n🎯 Test 5: Checking active gateway...');
  try {
    const activeResponse = await fetch(`${API_BASE_URL}/api/v1/admin/payment-gateway-settings/active`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (activeResponse.ok) {
      const activeData = await activeResponse.json();
      if (activeData.success) {
        console.log('✅ Active gateway endpoint working');
        console.log('📊 Active gateway:', activeData.data);
      } else {
        console.error('❌ Active gateway endpoint returned error:', activeData.error);
      }
    } else {
      console.error('❌ Active gateway request failed - Status:', activeResponse.status);
      const errorText = await activeResponse.text();
      console.log('📄 Error details:', errorText);
    }
  } catch (error) {
    console.error('❌ Active gateway error:', error.message);
  }

  // Test 6: Check for CORS issues
  console.log('\n🌐 Test 6: Checking for CORS issues...');
  try {
    const corsResponse = await fetch(`${API_BASE_URL}/api/v1/admin/payment-gateway-settings`, {
      method: 'OPTIONS',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ CORS preflight successful (Status:', corsResponse.status, ')');
  } catch (error) {
    console.error('❌ CORS error detected:', error.message);
    console.log('💡 This might be a CORS configuration issue on the server');
  }

  console.log('\n🎉 Browser debug completed!');
  console.log('💡 Check the results above to identify any issues.');
  console.log('📝 Common issues and solutions:');
  console.log('   - 401/403 errors: Re-login to get fresh token');
  console.log('   - 500 errors: Check server logs for backend issues');
  console.log('   - CORS errors: Check server CORS configuration');
  console.log('   - Network errors: Verify server is running and accessible');
}

// Run the debug
console.log('🚀 Browser Console Debug Ready!');
console.log('📋 Instructions:');
console.log('   1. Make sure you are logged into the admin panel');
console.log('   2. Open browser console (F12)');
console.log('   3. Run: debugBrowserConsoleErrors()');
console.log('   4. Check the console output for any errors');
console.log('\n🔧 To run the debug, execute: debugBrowserConsoleErrors()');
