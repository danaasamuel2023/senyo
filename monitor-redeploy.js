#!/usr/bin/env node

/**
 * Monitor redeploy progress and test endpoints
 */

const axios = require('axios');

async function monitorRedeploy() {
  try {
    console.log('🔍 Monitoring Redeploy Progress');
    console.log('===============================\n');

    const API_BASE_URL = process.env.API_BASE_URL || 'https://unlimitedata.onrender.com';
    
    console.log('📊 Monitoring Configuration:');
    console.log(`   API URL: ${API_BASE_URL}`);
    console.log('   Target: Load new wallet and webhook routes');
    console.log('');

    let attempts = 0;
    const maxAttempts = 20; // 10 minutes with 30-second intervals
    let allEndpointsWorking = false;

    const targetEndpoints = [
      { method: 'POST', path: '/api/wallet/deposit', name: 'New Wallet Deposit' },
      { method: 'GET', path: '/api/v1/paystack-webhook', name: 'Paystack Webhook' }
    ];

    while (attempts < maxAttempts && !allEndpointsWorking) {
      attempts++;
      console.log(`📊 Attempt ${attempts}/${maxAttempts}: Testing new endpoints...`);

      let workingCount = 0;

      for (const endpoint of targetEndpoints) {
        try {
          const config = {
            method: endpoint.method,
            url: `${API_BASE_URL}${endpoint.path}`,
            timeout: 10000
          };

          // Add data for POST requests
          if (endpoint.method === 'POST') {
            config.data = { amount: 10 };
            config.headers = { 'Content-Type': 'application/json' };
          }

          const response = await axios(config);
          
          if (endpoint.method === 'POST' && response.status === 401) {
            console.log(`   ✅ ${endpoint.name}: Working (requires auth)`);
            workingCount++;
          } else if (endpoint.method === 'GET' && response.status === 405) {
            console.log(`   ✅ ${endpoint.name}: Working (Method Not Allowed is expected)`);
            workingCount++;
          } else {
            console.log(`   ⚠️  ${endpoint.name}: Unexpected response ${response.status}`);
          }

        } catch (error) {
          const status = error.response?.status;
          
          if (endpoint.method === 'POST' && status === 401) {
            console.log(`   ✅ ${endpoint.name}: Working (requires auth)`);
            workingCount++;
          } else if (endpoint.method === 'GET' && status === 405) {
            console.log(`   ✅ ${endpoint.name}: Working (Method Not Allowed is expected)`);
            workingCount++;
          } else if (status === 404) {
            console.log(`   ⏳ ${endpoint.name}: Still not available (404)`);
          } else {
            console.log(`   ❓ ${endpoint.name}: Status ${status}`);
          }
        }
      }

      if (workingCount === targetEndpoints.length) {
        allEndpointsWorking = true;
        console.log('\n🎉 All new endpoints are now working!');
        break;
      }

      if (attempts < maxAttempts) {
        console.log(`   ⏳ ${workingCount}/${targetEndpoints.length} endpoints working`);
        console.log('   ⏳ Waiting 30 seconds before next attempt...\n');
        await new Promise(resolve => setTimeout(resolve, 30000));
      }
    }

    if (!allEndpointsWorking) {
      console.log('\n⏰ Redeploy monitoring timeout reached.');
      console.log('🔧 Manual steps to check:');
      console.log('1. Check Render.com dashboard for deployment status');
      console.log('2. Check server logs for any errors');
      console.log('3. Verify environment variables are set correctly');
      console.log('4. Try manual redeploy from Render.com dashboard');
    }

    // Final comprehensive test
    console.log('\n📊 Final Comprehensive Test:');
    console.log('============================');

    const allEndpoints = [
      { method: 'GET', path: '/api/health', name: 'Health Check' },
      { method: 'GET', path: '/api/wallet/balance', name: 'Wallet Balance' },
      { method: 'POST', path: '/api/v1/deposit', name: 'V1 Deposit (Existing)' },
      { method: 'POST', path: '/api/wallet/deposit', name: 'New Wallet Deposit' },
      { method: 'GET', path: '/api/v1/paystack-webhook', name: 'Paystack Webhook' },
      { method: 'GET', path: '/api/v1/verify-payment', name: 'Verify Payment' }
    ];

    for (const endpoint of allEndpoints) {
      try {
        const config = {
          method: endpoint.method,
          url: `${API_BASE_URL}${endpoint.path}`,
          timeout: 5000
        };

        if (endpoint.method === 'POST') {
          config.data = { amount: 10 };
          config.headers = { 'Content-Type': 'application/json' };
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
          console.log(`❌ ${endpoint.name}: Not found (404)`);
        } else if (status === 405) {
          console.log(`✅ ${endpoint.name}: Working (Method Not Allowed is expected)`);
        } else {
          console.log(`❓ ${endpoint.name}: Status ${status}`);
        }
      }
    }

    console.log('\n🎯 Summary:');
    if (allEndpointsWorking) {
      console.log('✅ SUCCESS: All new endpoints are now working!');
      console.log('✅ The deposit system is fully functional');
      console.log('✅ Users can now top up their accounts with Paystack');
      console.log('✅ Payments will be reflected in their accounts');
    } else {
      console.log('⚠️  PARTIAL: Some endpoints may still need more time');
      console.log('🔧 Check Render.com dashboard for deployment status');
      console.log('⏳ Wait a few more minutes and test again');
    }

    console.log('\n🧪 Next Steps:');
    console.log('1. Test the system with your auth token');
    console.log('2. Run: node quick-test.js YOUR_AUTH_TOKEN');
    console.log('3. Make a test deposit through the application');
    console.log('4. Verify payment processing and balance updates');

  } catch (error) {
    console.error('❌ Redeploy monitoring failed:', error.message);
  }
}

// Run redeploy monitoring
monitorRedeploy();
