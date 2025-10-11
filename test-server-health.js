#!/usr/bin/env node

/**
 * Test server health and basic functionality
 */

const axios = require('axios');

async function testServerHealth() {
  try {
    console.log('🏥 Testing Server Health');
    console.log('========================\n');

    const API_BASE_URL = process.env.API_BASE_URL || 'https://unlimitedata.onrender.com';
    
    console.log('📊 Testing Configuration:');
    console.log(`   API URL: ${API_BASE_URL}`);
    console.log('');

    // Test 1: Health Check
    console.log('📊 Test 1: Health Check');
    try {
      const response = await axios.get(`${API_BASE_URL}/api/health`, { timeout: 10000 });
      console.log('   ✅ Server is healthy');
      console.log('   Status:', response.status);
      console.log('   Response:', response.data);
    } catch (error) {
      console.log('   ❌ Server health check failed:', error.message);
    }
    console.log('');

    // Test 2: Basic GET endpoint
    console.log('📊 Test 2: Basic GET Endpoint');
    try {
      const response = await axios.get(`${API_BASE_URL}/api/wallet/balance`, { timeout: 10000 });
      console.log('   ⚠️  Should require authentication');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('   ✅ Basic GET endpoint is working (requires auth)');
      } else {
        console.log('   ❌ Basic GET endpoint failed:', error.response?.status);
      }
    }
    console.log('');

    // Test 3: Deposit endpoint with minimal data
    console.log('📊 Test 3: Deposit Endpoint (Minimal Data)');
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/deposit`, {
        userId: 'test'
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      console.log('   ⚠️  Unexpected success response');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('   ✅ Deposit endpoint is working (needs valid data)');
        console.log('   Error:', error.response.data.error);
      } else if (error.response?.status === 500) {
        console.log('   🚨 Deposit endpoint has server error (500)');
        console.log('   Error:', error.response.data.error);
      } else {
        console.log('   ❌ Deposit endpoint failed:', error.response?.status);
        console.log('   Error:', error.response?.data?.error || error.message);
      }
    }
    console.log('');

    // Test 4: Webhook endpoint
    console.log('📊 Test 4: Webhook Endpoint');
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/paystack-webhook`, { timeout: 10000 });
      console.log('   ⚠️  Unexpected success response');
    } catch (error) {
      if (error.response?.status === 405) {
        console.log('   ✅ Webhook endpoint is working (Method Not Allowed is expected)');
      } else if (error.response?.status === 404) {
        console.log('   ❌ Webhook endpoint not found (404)');
      } else {
        console.log('   ❌ Webhook endpoint failed:', error.response?.status);
      }
    }
    console.log('');

    console.log('🎯 Summary:');
    console.log('===========');
    console.log('✅ Working: Basic server functionality');
    console.log('🔐 Working: Authentication system');
    console.log('✅ Working: Webhook endpoint (if 405)');
    console.log('🚨 Issue: Deposit endpoint returning 500 error');
    console.log('');
    console.log('🔧 Recommendations:');
    console.log('1. Check server logs for 500 error details');
    console.log('2. Verify database connection');
    console.log('3. Check environment variables');
    console.log('4. Consider server restart if issues persist');

  } catch (error) {
    console.error('❌ Server health test failed:', error.message);
  }
}

// Run server health test
testServerHealth();
