#!/usr/bin/env node

/**
 * Manual Payment Gateway Switching Test
 * 
 * Simple script to manually test payment gateway switching
 * Run this after updating settings in the admin panel
 */

const axios = require('axios');

// Configuration - UPDATE THESE VALUES
const API_BASE_URL = 'http://localhost:5001'; // Your server URL
const ADMIN_TOKEN = 'YOUR_ADMIN_TOKEN_HERE'; // Get this from browser localStorage after admin login

async function testGatewaySwitching() {
  console.log('🧪 Manual Payment Gateway Switching Test\n');
  
  if (ADMIN_TOKEN === 'YOUR_ADMIN_TOKEN_HERE') {
    console.log('❌ Please update ADMIN_TOKEN in this script');
    console.log('💡 Get your admin token from browser localStorage after logging into admin panel');
    return;
  }

  try {
    // Step 1: Get current settings
    console.log('📋 Step 1: Getting current payment gateway settings...');
    const currentResponse = await axios.get(
      `${API_BASE_URL}/api/v1/admin/payment-gateway-settings`,
      {
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Current Settings:', JSON.stringify(currentResponse.data.data, null, 2));
    console.log(`Active Gateway: ${currentResponse.data.data.activeGateway}\n`);

    // Step 2: Switch to Paystack
    console.log('🔄 Step 2: Switching to Paystack...');
    const paystackResponse = await axios.put(
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
        }
      }
    );
    
    if (paystackResponse.data.success) {
      console.log('✅ Successfully switched to Paystack');
      console.log('Updated Settings:', JSON.stringify(paystackResponse.data.data, null, 2));
    } else {
      console.log('❌ Failed to switch to Paystack:', paystackResponse.data.error);
    }

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 3: Switch to BulkClix
    console.log('\n🔄 Step 3: Switching to BulkClix...');
    const bulkclixResponse = await axios.put(
      `${API_BASE_URL}/api/v1/admin/payment-gateway-settings`,
      {
        activeGateway: 'bulkclix',
        paystackEnabled: true,
        bulkclixEnabled: true,
        paystackPublicKey: 'pk_test_example',
        paystackSecretKey: 'sk_test_example',
        bulkclixApiKey: 'bulkclix_test_key',
        autoSwitch: true,
        fallbackGateway: 'paystack'
      },
      {
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (bulkclixResponse.data.success) {
      console.log('✅ Successfully switched to BulkClix');
      console.log('Updated Settings:', JSON.stringify(bulkclixResponse.data.data, null, 2));
    } else {
      console.log('❌ Failed to switch to BulkClix:', bulkclixResponse.data.error);
    }

    // Step 4: Verify the active gateway
    console.log('\n🔍 Step 4: Verifying active gateway...');
    const verifyResponse = await axios.get(
      `${API_BASE_URL}/api/v1/admin/payment-gateway-settings/active`,
      {
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (verifyResponse.data.success) {
      console.log('✅ Active Gateway Verification:');
      console.log(JSON.stringify(verifyResponse.data.data, null, 2));
    } else {
      console.log('❌ Failed to verify active gateway:', verifyResponse.data.error);
    }

    console.log('\n🎉 Manual test completed!');
    console.log('💡 Next: Try making a test payment to see which gateway is used');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Run the test
testGatewaySwitching();
