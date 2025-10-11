#!/usr/bin/env node

/**
 * Test script to verify payment processing and account balance updates
 */

const axios = require('axios');

async function testPaymentVerification() {
  try {
    console.log('🧪 Testing Payment Verification and Account Balance Updates\n');

    // Test configuration
    const API_BASE_URL = process.env.API_BASE_URL || 'https://unlimitedata.onrender.com';
    const TEST_TOKEN = process.env.TEST_TOKEN; // Set this in environment
    const TEST_REFERENCE = process.env.TEST_REFERENCE; // Set this to test a specific transaction

    if (!TEST_TOKEN) {
      console.log('❌ TEST_TOKEN environment variable is required');
      console.log('   Set it with: export TEST_TOKEN="your-auth-token"');
      return;
    }

    console.log('📊 Test Configuration:');
    console.log(`   API URL: ${API_BASE_URL}`);
    console.log(`   Test Reference: ${TEST_REFERENCE || 'Will test with new deposit'}`);
    console.log('');

    let testReference = TEST_REFERENCE;

    // If no specific reference provided, create a new deposit to test
    if (!testReference) {
      console.log('📊 Step 1: Creating Test Deposit');
      try {
        const depositData = {
          amount: 10.30, // Match the amount from your test
          email: 'test@example.com',
          metadata: {
            source: 'verification_test',
            testRun: true
          }
        };

        const response = await axios.post(
          `${API_BASE_URL}/api/wallet/deposit`,
          depositData,
          {
            headers: {
              'Authorization': `Bearer ${TEST_TOKEN}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.success) {
          testReference = response.data.data.reference;
          console.log('   ✅ Test deposit created');
          console.log('   Reference:', testReference);
          console.log('   Amount: ₵10.30');
          console.log('   Paystack URL:', response.data.data.paystackUrl ? 'Generated' : 'Not generated');
          console.log('');
        } else {
          throw new Error('Failed to create test deposit');
        }
      } catch (error) {
        console.log('   ❌ Failed to create test deposit');
        console.log('   Error:', error.response?.data?.message || error.message);
        return;
      }
    }

    // Test 1: Get initial wallet balance
    console.log('📊 Step 2: Get Initial Wallet Balance');
    let initialBalance = 0;
    try {
      const balanceResponse = await axios.get(
        `${API_BASE_URL}/api/wallet/balance`,
        {
          headers: {
            'Authorization': `Bearer ${TEST_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (balanceResponse.data.success) {
        initialBalance = balanceResponse.data.balance;
        console.log('   ✅ Initial balance retrieved');
        console.log('   Balance: ₵' + initialBalance.toFixed(2));
        console.log('');
      }
    } catch (error) {
      console.log('   ❌ Failed to get initial balance');
      console.log('   Error:', error.response?.data?.message || error.message);
    }

    // Test 2: Verify payment status (should be pending initially)
    console.log('📊 Step 3: Check Payment Status (Initial)');
    try {
      const verifyResponse = await axios.get(
        `${API_BASE_URL}/api/wallet/deposit/verify/${testReference}`,
        {
          headers: {
            'Authorization': `Bearer ${TEST_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('   Status:', verifyResponse.status);
      console.log('   Success:', verifyResponse.data.success);
      console.log('   Message:', verifyResponse.data.message);
      
      if (verifyResponse.data.data) {
        console.log('   Transaction Status:', verifyResponse.data.data.status);
        console.log('   Amount:', verifyResponse.data.data.amount);
        console.log('   Reference:', verifyResponse.data.data.reference);
      }
      console.log('');
    } catch (error) {
      console.log('   ❌ Failed to verify payment status');
      console.log('   Error:', error.response?.data?.message || error.message);
      console.log('');
    }

    // Test 3: Simulate successful payment (for testing purposes)
    console.log('📊 Step 4: Simulate Payment Completion');
    console.log('   ℹ️  In a real scenario, this would happen automatically via Paystack webhook');
    console.log('   ℹ️  For testing, you would complete the payment on Paystack and then verify');
    console.log('');

    // Test 4: Check if webhook endpoint is accessible
    console.log('📊 Step 5: Test Webhook Endpoint Accessibility');
    try {
      const webhookResponse = await axios.get(
        `${API_BASE_URL}/api/paystack-webhook`,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('   Webhook endpoint status:', webhookResponse.status);
    } catch (error) {
      if (error.response?.status === 405) {
        console.log('   ✅ Webhook endpoint accessible (Method Not Allowed is expected for GET)');
      } else {
        console.log('   ⚠️  Webhook endpoint status:', error.response?.status);
        console.log('   Error:', error.response?.data?.error || error.message);
      }
    }
    console.log('');

    // Test 5: Get final wallet balance
    console.log('📊 Step 6: Get Final Wallet Balance');
    try {
      const finalBalanceResponse = await axios.get(
        `${API_BASE_URL}/api/wallet/balance`,
        {
          headers: {
            'Authorization': `Bearer ${TEST_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (finalBalanceResponse.data.success) {
        const finalBalance = finalBalanceResponse.data.balance;
        console.log('   ✅ Final balance retrieved');
        console.log('   Balance: ₵' + finalBalance.toFixed(2));
        console.log('   Balance Change: ₵' + (finalBalance - initialBalance).toFixed(2));
        
        if (finalBalance > initialBalance) {
          console.log('   ✅ Balance increased - payment was processed!');
        } else {
          console.log('   ⚠️  Balance unchanged - payment may still be pending');
        }
        console.log('');
      }
    } catch (error) {
      console.log('   ❌ Failed to get final balance');
      console.log('   Error:', error.response?.data?.message || error.message);
    }

    // Test 6: Get transaction history
    console.log('📊 Step 7: Check Transaction History');
    try {
      const transactionsResponse = await axios.get(
        `${API_BASE_URL}/api/wallet/transactions?limit=5`,
        {
          headers: {
            'Authorization': `Bearer ${TEST_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (transactionsResponse.data.success) {
        console.log('   ✅ Transaction history retrieved');
        console.log('   Total transactions:', transactionsResponse.data.total);
        console.log('   Recent transactions:');
        
        const recentTransactions = transactionsResponse.data.transactions || [];
        recentTransactions.forEach((tx, index) => {
          console.log(`   ${index + 1}. ${tx.type} - ₵${Math.abs(tx.amount).toFixed(2)} - ${tx.status} - ${tx.reference}`);
        });
        console.log('');
      }
    } catch (error) {
      console.log('   ❌ Failed to get transaction history');
      console.log('   Error:', error.response?.data?.message || error.message);
    }

    console.log('🎉 Payment verification test completed!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Complete the payment on Paystack (if not already done)');
    console.log('   2. Wait for webhook notification (or manually verify)');
    console.log('   3. Check that balance has increased by ₵10.30');
    console.log('   4. Verify transaction appears in history as "completed"');
    console.log('\n🔧 Manual Verification:');
    console.log(`   curl -H "Authorization: Bearer ${TEST_TOKEN}" \\`);
    console.log(`        "${API_BASE_URL}/api/wallet/deposit/verify/${testReference}"`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run tests
testPaymentVerification();
