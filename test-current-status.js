#!/usr/bin/env node

/**
 * Test current system status
 */

const axios = require('axios');

async function testCurrentStatus() {
  try {
    console.log('🔍 Testing Current System Status');
    console.log('================================\n');

    const API_BASE_URL = process.env.API_BASE_URL || 'https://unlimitedata.onrender.com';
    
    console.log('📊 Testing Configuration:');
    console.log(`   API URL: ${API_BASE_URL}`);
    console.log('');

    const endpoints = [
      { method: 'GET', path: '/api/health', name: 'Health Check' },
      { method: 'GET', path: '/api/wallet/balance', name: 'Wallet Balance' },
      { method: 'POST', path: '/api/v1/deposit', name: 'Existing Deposit' },
      { method: 'GET', path: '/api/v1/paystack-webhook', name: 'Paystack Webhook' },
      { method: 'POST', path: '/api/v1/wallet-deposit', name: 'New Wallet Deposit' }
    ];

    console.log('📊 Endpoint Test Results:');
    console.log('========================');

    for (const endpoint of endpoints) {
      try {
        const config = {
          method: endpoint.method,
          url: `${API_BASE_URL}${endpoint.path}`,
          timeout: 5000
        };

        // Add data for POST requests
        if (endpoint.method === 'POST') {
          config.data = {
            userId: 'test',
            amount: 10,
            email: 'test@example.com'
          };
          config.headers = {
            'Content-Type': 'application/json'
          };
        }

        const response = await axios(config);
        
        if (response.status === 200) {
          console.log(`✅ ${endpoint.name}: Working (200)`);
        } else {
          console.log(`⚠️  ${endpoint.name}: Status ${response.status}`);
        }

      } catch (error) {
        const status = error.response?.status;
        const message = error.response?.data?.error || error.response?.data?.message || error.message;
        
        if (status === 401) {
          console.log(`🔐 ${endpoint.name}: Working (requires auth)`);
        } else if (status === 400) {
          console.log(`⚠️  ${endpoint.name}: Working (needs valid data)`);
        } else if (status === 404) {
          console.log(`❌ ${endpoint.name}: Not found (404)`);
        } else if (status === 405) {
          console.log(`✅ ${endpoint.name}: Working (Method Not Allowed is expected)`);
        } else if (status === 500) {
          console.log(`🚨 ${endpoint.name}: Server error (500) - ${message}`);
        } else {
          console.log(`❓ ${endpoint.name}: Status ${status} - ${message}`);
        }
      }
    }

    console.log('\n🎯 Summary:');
    console.log('===========');
    console.log('✅ Working endpoints: Ready to use');
    console.log('❌ 404 endpoints: Not deployed yet');
    console.log('🚨 500 endpoints: Server error - needs investigation');
    console.log('');
    console.log('🔧 Recommendations:');
    console.log('1. Use working endpoints for immediate functionality');
    console.log('2. Check server logs for 500 errors');
    console.log('3. Wait for deployment to complete for 404 endpoints');
    console.log('4. Test with valid authentication tokens');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testCurrentStatus();
