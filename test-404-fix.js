#!/usr/bin/env node

/**
 * Test the 404 endpoint fixes
 */

const axios = require('axios');

async function test404Fix() {
  try {
    console.log('🔧 Testing 404 Endpoint Fixes');
    console.log('=============================\n');

    const API_BASE_URL = process.env.API_BASE_URL || 'https://unlimitedata.onrender.com';
    
    console.log('📊 Testing Configuration:');
    console.log(`   API URL: ${API_BASE_URL}`);
    console.log('');

    const endpoints = [
      { method: 'POST', path: '/api/v1/wallet-deposit', name: 'New Wallet Deposit' },
      { method: 'GET', path: '/api/v1/paystack-webhook', name: 'Paystack Webhook' },
      { method: 'POST', path: '/api/v1/deposit', name: 'Existing Deposit' },
      { method: 'GET', path: '/api/wallet/balance', name: 'Wallet Balance' }
    ];

    console.log('📊 Testing Endpoints:');
    console.log('====================');

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
        
        if (status === 401) {
          console.log(`🔐 ${endpoint.name}: Working (requires auth)`);
        } else if (status === 400) {
          console.log(`⚠️  ${endpoint.name}: Working (needs valid data)`);
        } else if (status === 404) {
          console.log(`❌ ${endpoint.name}: Still returning 404`);
        } else if (status === 405) {
          console.log(`✅ ${endpoint.name}: Working (Method Not Allowed is expected)`);
        } else {
          console.log(`❓ ${endpoint.name}: Status ${status}`);
        }
      }
    }

    console.log('\n🎯 Summary:');
    console.log('===========');
    console.log('✅ Working endpoints (401, 400, 405, 200): Ready to use');
    console.log('❌ 404 endpoints: Still need server restart');
    console.log('');
    console.log('🔧 Next Steps:');
    console.log('1. Wait 2-3 minutes for Render.com to redeploy');
    console.log('2. Run this test again: node test-404-fix.js');
    console.log('3. If still 404, check Render.com dashboard');
    console.log('4. Use working endpoints for immediate functionality');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
test404Fix();
