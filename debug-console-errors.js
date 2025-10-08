#!/usr/bin/env node

/**
 * Debug Console Errors Script
 * 
 * This script helps identify and fix console errors in the payment gateway system
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5001';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'test-token';

async function debugConsoleErrors() {
  console.log('🔍 Debugging Console Errors...\n');
  
  // Test 1: Check if server is running
  console.log('📡 Test 1: Checking server connectivity...');
  try {
    const healthResponse = await axios.get(`${API_BASE_URL}/`, { timeout: 5000 });
    console.log('✅ Server is running');
  } catch (error) {
    console.log('❌ Server is not running or not accessible');
    console.log('💡 Make sure your server is running on:', API_BASE_URL);
    return;
  }

  // Test 2: Check authentication
  console.log('\n🔐 Test 2: Checking authentication...');
  try {
    const authResponse = await axios.get(
      `${API_BASE_URL}/api/v1/admin/payment-gateway-settings`,
      {
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      }
    );
    console.log('✅ Authentication successful');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('❌ Authentication failed - Invalid or missing token');
      console.log('💡 Get a valid admin token from browser localStorage after logging in');
    } else if (error.response?.status === 403) {
      console.log('❌ Access denied - Admin privileges required');
    } else {
      console.log('❌ Authentication error:', error.message);
    }
    return;
  }

  // Test 3: Check payment gateway settings endpoint
  console.log('\n⚙️ Test 3: Testing payment gateway settings endpoint...');
  try {
    const settingsResponse = await axios.get(
      `${API_BASE_URL}/api/v1/admin/payment-gateway-settings`,
      {
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      }
    );
    
    if (settingsResponse.data.success) {
      console.log('✅ Payment gateway settings endpoint working');
      console.log('📊 Current settings:', JSON.stringify(settingsResponse.data.data, null, 2));
    } else {
      console.log('❌ Payment gateway settings endpoint returned error:', settingsResponse.data.error);
    }
  } catch (error) {
    console.log('❌ Payment gateway settings endpoint error:', error.message);
    if (error.response?.data) {
      console.log('📄 Response data:', error.response.data);
    }
  }

  // Test 4: Test settings update
  console.log('\n🔄 Test 4: Testing settings update...');
  try {
    const updateResponse = await axios.put(
      `${API_BASE_URL}/api/v1/admin/payment-gateway-settings`,
      {
        activeGateway: 'paystack',
        paystackEnabled: true,
        bulkclixEnabled: true,
        paystackPublicKey: 'pk_test_example',
        paystackSecretKey: 'sk_test_example',
        bulkclixApiKey: 'bulkclix_test_key',
        autoSwitch: true,
        fallbackGateway: 'bulkclix'
      },
      {
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );
    
    if (updateResponse.data.success) {
      console.log('✅ Settings update successful');
      console.log('📊 Updated settings:', JSON.stringify(updateResponse.data.data, null, 2));
    } else {
      console.log('❌ Settings update failed:', updateResponse.data.error);
    }
  } catch (error) {
    console.log('❌ Settings update error:', error.message);
    if (error.response?.data) {
      console.log('📄 Response data:', error.response.data);
    }
    if (error.response?.status) {
      console.log('📊 Status code:', error.response.status);
    }
  }

  // Test 5: Check active gateway endpoint
  console.log('\n🎯 Test 5: Testing active gateway endpoint...');
  try {
    const activeResponse = await axios.get(
      `${API_BASE_URL}/api/v1/admin/payment-gateway-settings/active`,
      {
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      }
    );
    
    if (activeResponse.data.success) {
      console.log('✅ Active gateway endpoint working');
      console.log('📊 Active gateway:', JSON.stringify(activeResponse.data.data, null, 2));
    } else {
      console.log('❌ Active gateway endpoint returned error:', activeResponse.data.error);
    }
  } catch (error) {
    console.log('❌ Active gateway endpoint error:', error.message);
    if (error.response?.data) {
      console.log('📄 Response data:', error.response.data);
    }
  }

  console.log('\n🎉 Debug completed!');
  console.log('💡 If you see any errors above, they need to be fixed before testing payment gateway switching.');
}

// Run the debug
debugConsoleErrors().catch(console.error);
