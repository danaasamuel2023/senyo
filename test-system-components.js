#!/usr/bin/env node

/**
 * Test system components without authentication
 * This tests the basic infrastructure and endpoints
 */

const axios = require('axios');

async function testSystemComponents() {
  try {
    console.log('🧪 Testing System Components\n');

    // Test configuration
    const API_BASE_URL = process.env.API_BASE_URL || 'https://unlimitedata.onrender.com';
    
    console.log('📊 Test Configuration:');
    console.log(`   API URL: ${API_BASE_URL}`);
    console.log('');

    // Test 1: Check if server is running
    console.log('📊 Test 1: Server Health Check');
    try {
      const response = await axios.get(`${API_BASE_URL}/api/health`, {
        timeout: 10000
      });
      console.log('   ✅ Server is running');
      console.log('   Status:', response.status);
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('   ❌ Server is not running or not accessible');
      } else {
        console.log('   ⚠️  Server response:', error.response?.status || error.message);
      }
    }
    console.log('');

    // Test 2: Check webhook endpoint
    console.log('📊 Test 2: Webhook Endpoint Check');
    try {
      const response = await axios.get(`${API_BASE_URL}/api/paystack-webhook`, {
        timeout: 10000
      });
      console.log('   ⚠️  Unexpected response from webhook endpoint');
    } catch (error) {
      if (error.response?.status === 405) {
        console.log('   ✅ Webhook endpoint is accessible (Method Not Allowed is expected for GET)');
      } else {
        console.log('   ⚠️  Webhook endpoint status:', error.response?.status);
        console.log('   Error:', error.response?.data?.error || error.message);
      }
    }
    console.log('');

    // Test 3: Check wallet endpoints (should require auth)
    console.log('📊 Test 3: Wallet Endpoints Authentication Check');
    try {
      const response = await axios.get(`${API_BASE_URL}/api/wallet/balance`, {
        timeout: 10000
      });
      console.log('   ⚠️  Wallet endpoint should require authentication');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('   ✅ Wallet endpoint properly requires authentication');
      } else {
        console.log('   ⚠️  Unexpected response:', error.response?.status);
        console.log('   Error:', error.response?.data?.message || error.message);
      }
    }
    console.log('');

    // Test 4: Check deposit endpoint (should require auth)
    console.log('📊 Test 4: Deposit Endpoint Authentication Check');
    try {
      const response = await axios.post(`${API_BASE_URL}/api/wallet/deposit`, {
        amount: 10
      }, {
        timeout: 10000
      });
      console.log('   ⚠️  Deposit endpoint should require authentication');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('   ✅ Deposit endpoint properly requires authentication');
      } else {
        console.log('   ⚠️  Unexpected response:', error.response?.status);
        console.log('   Error:', error.response?.data?.message || error.message);
      }
    }
    console.log('');

    // Test 5: Check if Paystack integration is configured
    console.log('📊 Test 5: Paystack Configuration Check');
    try {
      // This will fail without proper Paystack config, but we can check the error
      const response = await axios.post(`${API_BASE_URL}/api/wallet/deposit`, {
        amount: 10,
        email: 'test@example.com'
      }, {
        headers: {
          'Authorization': 'Bearer invalid-token'
        },
        timeout: 10000
      });
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('   ✅ Authentication is working');
      } else if (error.response?.status === 400) {
        console.log('   ✅ Endpoint is accessible and validating input');
      } else {
        console.log('   ⚠️  Response:', error.response?.status);
        console.log('   Error:', error.response?.data?.message || error.message);
      }
    }
    console.log('');

    // Test 6: Check database connectivity (indirectly)
    console.log('📊 Test 6: Database Connectivity Check');
    console.log('   ℹ️  This test requires authentication to verify database connectivity');
    console.log('   ℹ️  Run with a valid token to test database operations');
    console.log('');

    console.log('🎉 System component tests completed!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Get a valid auth token from your application');
    console.log('   2. Set it as environment variable: export TEST_TOKEN="your-token"');
    console.log('   3. Run: node test-complete-payment-flow.js');
    console.log('   4. Or test specific transaction: node verify-payment.js REFERENCE TOKEN');
    console.log('\n🔧 Manual Testing:');
    console.log('   1. Login to your application');
    console.log('   2. Go to deposit page');
    console.log('   3. Make a test deposit');
    console.log('   4. Complete payment on Paystack');
    console.log('   5. Check wallet balance and transaction history');

  } catch (error) {
    console.error('❌ System test failed:', error.message);
  }
}

// Run system component tests
testSystemComponents();
