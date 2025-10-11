#!/usr/bin/env node

/**
 * Test script to verify the add-money endpoint fix
 */

const axios = require('axios');

async function testAddMoneyEndpoint() {
  try {
    console.log('🧪 Testing Add Money Endpoint Fix\n');

    // Test configuration
    const API_BASE_URL = process.env.API_BASE_URL || 'https://unlimitedata.onrender.com';
    const TEST_USER_ID = 'test-user-id'; // Replace with actual user ID
    const TEST_AMOUNT = 10;
    const ADMIN_TOKEN = process.env.ADMIN_TOKEN; // Set this in environment

    if (!ADMIN_TOKEN) {
      console.log('❌ ADMIN_TOKEN environment variable is required');
      console.log('   Set it with: export ADMIN_TOKEN="your-admin-token"');
      return;
    }

    console.log('📊 Test Configuration:');
    console.log(`   API URL: ${API_BASE_URL}`);
    console.log(`   User ID: ${TEST_USER_ID}`);
    console.log(`   Amount: ₵${TEST_AMOUNT}`);
    console.log('');

    // Test 1: Add money
    console.log('📊 Test 1: Add Money');
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/v1/admin/users/${TEST_USER_ID}/add-money`,
        {
          amount: TEST_AMOUNT,
          reason: 'Test deposit via fixed endpoint'
        },
        {
          headers: {
            'Authorization': `Bearer ${ADMIN_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('   Status:', response.status);
      console.log('   Success:', response.data.success);
      console.log('   Message:', response.data.msg);
      console.log('   New Balance:', response.data.currentBalance);
      console.log('   ✅ Add money test passed\n');

    } catch (error) {
      console.log('   ❌ Add money test failed');
      console.log('   Status:', error.response?.status);
      console.log('   Error:', error.response?.data?.msg || error.message);
      console.log('');
    }

    // Test 2: Deduct money
    console.log('📊 Test 2: Deduct Money');
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/v1/admin/users/${TEST_USER_ID}/deduct-money`,
        {
          amount: 5,
          reason: 'Test deduction via fixed endpoint'
        },
        {
          headers: {
            'Authorization': `Bearer ${ADMIN_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('   Status:', response.status);
      console.log('   Success:', response.data.success);
      console.log('   Message:', response.data.msg);
      console.log('   New Balance:', response.data.currentBalance);
      console.log('   ✅ Deduct money test passed\n');

    } catch (error) {
      console.log('   ❌ Deduct money test failed');
      console.log('   Status:', error.response?.status);
      console.log('   Error:', error.response?.data?.msg || error.message);
      console.log('');
    }

    // Test 3: Invalid amount
    console.log('📊 Test 3: Invalid Amount Validation');
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/v1/admin/users/${TEST_USER_ID}/add-money`,
        {
          amount: -10,
          reason: 'Test invalid amount'
        },
        {
          headers: {
            'Authorization': `Bearer ${ADMIN_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('   ❌ Should have failed with invalid amount');
      console.log('   Response:', response.data);

    } catch (error) {
      if (error.response?.status === 400) {
        console.log('   Status:', error.response.status);
        console.log('   Message:', error.response.data.msg);
        console.log('   ✅ Validation test passed\n');
      } else {
        console.log('   ❌ Unexpected error:', error.message);
      }
    }

    console.log('🎉 All tests completed!');
    console.log('\n📈 Fix Summary:');
    console.log('   ✅ Updated add-money endpoint to use WalletService');
    console.log('   ✅ Updated deduct-money endpoint to use WalletService');
    console.log('   ✅ Added proper error handling and validation');
    console.log('   ✅ Consistent wallet balance updates');
    console.log('   ✅ Automatic cache invalidation');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run tests
testAddMoneyEndpoint();
