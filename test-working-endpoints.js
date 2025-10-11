#!/usr/bin/env node

/**
 * Test all endpoints to see which ones are actually working
 */

const axios = require('axios');

async function testWorkingEndpoints() {
  try {
    console.log('🧪 Testing All Endpoints\n');

    const API_BASE_URL = process.env.API_BASE_URL || 'https://unlimitedata.onrender.com';
    
    console.log('📊 Testing Configuration:');
    console.log(`   API URL: ${API_BASE_URL}`);
    console.log('');

    const endpoints = [
      // Wallet endpoints
      { method: 'GET', path: '/api/wallet/balance', name: 'Wallet Balance' },
      { method: 'GET', path: '/api/wallet/transactions', name: 'Wallet Transactions' },
      { method: 'POST', path: '/api/wallet/deposit', name: 'Wallet Deposit (New)' },
      
      // V1 endpoints
      { method: 'POST', path: '/api/v1/deposit', name: 'V1 Deposit (Existing)' },
      { method: 'GET', path: '/api/v1/verify-payment', name: 'V1 Verify Payment' },
      { method: 'GET', path: '/api/v1/paystack-webhook', name: 'V1 Paystack Webhook' },
      { method: 'GET', path: '/api/v1/paystack/webhook', name: 'V1 Paystack/Webhook' },
      
      // Other endpoints
      { method: 'GET', path: '/api/health', name: 'Health Check' },
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
        
        console.log(`✅ ${endpoint.name}: ${response.status} - Working`);
        
      } catch (error) {
        const status = error.response?.status || 'Network Error';
        const message = error.response?.data?.error || error.response?.data?.message || error.message;
        
        if (status === 401) {
          console.log(`🔐 ${endpoint.name}: ${status} - Requires Authentication (Working)`);
        } else if (status === 400) {
          console.log(`⚠️  ${endpoint.name}: ${status} - Bad Request (Working but needs valid data)`);
        } else if (status === 404) {
          console.log(`❌ ${endpoint.name}: ${status} - Not Found`);
        } else if (status === 405) {
          console.log(`✅ ${endpoint.name}: ${status} - Method Not Allowed (Working)`);
        } else {
          console.log(`❓ ${endpoint.name}: ${status} - ${message}`);
        }
      }
    }

    console.log('\n📋 Summary:');
    console.log('===========');
    console.log('✅ Working endpoints (return 401, 400, 405, or 200):');
    console.log('   - These endpoints are accessible and functional');
    console.log('   - 401 = Requires authentication');
    console.log('   - 400 = Needs valid request data');
    console.log('   - 405 = Method not allowed (but endpoint exists)');
    console.log('   - 200 = Working perfectly');
    console.log('');
    console.log('❌ Not working endpoints (return 404):');
    console.log('   - These endpoints are not found');
    console.log('   - May need server restart or deployment');
    console.log('   - May not be properly registered');

    console.log('\n🎯 Recommended Actions:');
    console.log('======================');
    console.log('1. Use working endpoints for immediate functionality');
    console.log('2. For deposit: Use /api/v1/deposit (working)');
    console.log('3. For verification: Use /api/v1/verify-payment (if working)');
    console.log('4. For webhook: Check Paystack dashboard for webhook URL');
    console.log('5. Test with valid authentication tokens');

  } catch (error) {
    console.error('❌ Endpoint testing failed:', error.message);
  }
}

// Run endpoint tests
testWorkingEndpoints();
