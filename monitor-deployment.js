#!/usr/bin/env node

/**
 * Monitor deployment status and test endpoints
 */

const axios = require('axios');

async function monitorDeployment() {
  try {
    console.log('🔍 Monitoring Deployment Status\n');

    const API_BASE_URL = process.env.API_BASE_URL || 'https://unlimitedata.onrender.com';
    
    console.log('📊 Monitoring Configuration:');
    console.log(`   API URL: ${API_BASE_URL}`);
    console.log('');

    let attempts = 0;
    const maxAttempts = 30; // 5 minutes with 10-second intervals
    let endpointsWorking = false;

    while (attempts < maxAttempts && !endpointsWorking) {
      attempts++;
      console.log(`📊 Attempt ${attempts}/${maxAttempts}: Testing endpoints...`);

      try {
        // Test 1: Server health
        const healthResponse = await axios.get(`${API_BASE_URL}/api/health`, { timeout: 5000 });
        console.log('   ✅ Server is running');

        // Test 2: Deposit endpoint (should return 401 for auth, not 404)
        try {
          const depositResponse = await axios.post(`${API_BASE_URL}/api/wallet/deposit`, {
            amount: 10
          }, { timeout: 5000 });
          console.log('   ⚠️  Deposit endpoint should require authentication');
        } catch (error) {
          if (error.response?.status === 401) {
            console.log('   ✅ Deposit endpoint is working (requires auth)');
            endpointsWorking = true;
          } else if (error.response?.status === 404) {
            console.log('   ⏳ Deposit endpoint still not available (404)');
          } else {
            console.log('   ⚠️  Deposit endpoint status:', error.response?.status);
          }
        }

        // Test 3: Webhook endpoint
        try {
          const webhookResponse = await axios.get(`${API_BASE_URL}/api/v1/paystack-webhook`, { timeout: 5000 });
          console.log('   ⚠️  Webhook endpoint unexpected response');
        } catch (error) {
          if (error.response?.status === 405) {
            console.log('   ✅ Webhook endpoint is working (Method Not Allowed is expected)');
          } else if (error.response?.status === 404) {
            console.log('   ⏳ Webhook endpoint still not available (404)');
          } else {
            console.log('   ⚠️  Webhook endpoint status:', error.response?.status);
          }
        }

        if (endpointsWorking) {
          console.log('\n🎉 Deployment successful! Endpoints are now available.');
          break;
        }

      } catch (error) {
        console.log('   ❌ Server not responding:', error.message);
      }

      if (attempts < maxAttempts) {
        console.log('   ⏳ Waiting 10 seconds before next attempt...\n');
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }

    if (!endpointsWorking) {
      console.log('\n⏰ Deployment monitoring timeout reached.');
      console.log('🔧 Manual steps to check:');
      console.log('1. Check Render.com dashboard for deployment status');
      console.log('2. Check server logs for any errors');
      console.log('3. Verify environment variables are set correctly');
      console.log('4. Try manual redeploy from Render.com dashboard');
    }

    // Final test
    console.log('\n📊 Final Endpoint Test:');
    console.log('=====================');

    // Test deposit endpoint
    try {
      const response = await axios.post(`${API_BASE_URL}/api/wallet/deposit`, {
        amount: 10
      }, { timeout: 5000 });
      console.log('❌ Deposit endpoint should require authentication');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Deposit endpoint: Working (requires authentication)');
      } else if (error.response?.status === 404) {
        console.log('❌ Deposit endpoint: Still returning 404');
      } else {
        console.log('⚠️  Deposit endpoint: Status', error.response?.status);
      }
    }

    // Test webhook endpoint
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/paystack-webhook`, { timeout: 5000 });
      console.log('❌ Webhook endpoint unexpected response');
    } catch (error) {
      if (error.response?.status === 405) {
        console.log('✅ Webhook endpoint: Working (Method Not Allowed is expected)');
      } else if (error.response?.status === 404) {
        console.log('❌ Webhook endpoint: Still returning 404');
      } else {
        console.log('⚠️  Webhook endpoint: Status', error.response?.status);
      }
    }

    console.log('\n🎯 Next Steps:');
    if (endpointsWorking) {
      console.log('✅ Endpoints are working! You can now:');
      console.log('1. Test the payment system with your auth token');
      console.log('2. Run: node quick-test.js YOUR_AUTH_TOKEN');
      console.log('3. Make a test deposit through the application');
    } else {
      console.log('⚠️  Endpoints still not working. Try:');
      console.log('1. Check Render.com dashboard for deployment errors');
      console.log('2. Manually trigger redeploy from Render.com');
      console.log('3. Check server logs for detailed error messages');
      console.log('4. Verify all environment variables are set correctly');
    }

  } catch (error) {
    console.error('❌ Deployment monitoring failed:', error.message);
  }
}

// Run deployment monitoring
monitorDeployment();
