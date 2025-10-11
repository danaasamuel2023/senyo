#!/usr/bin/env node

/**
 * Complete end-to-end test of the payment flow
 * This script simulates the entire payment process
 */

const axios = require('axios');

async function testCompletePaymentFlow() {
  try {
    console.log('🧪 Testing Complete Payment Flow\n');

    // Test configuration
    const API_BASE_URL = process.env.API_BASE_URL || 'https://unlimitedata.onrender.com';
    const TEST_TOKEN = process.env.TEST_TOKEN;
    const TEST_AMOUNT = 10.30; // Match your test amount

    if (!TEST_TOKEN) {
      console.log('❌ TEST_TOKEN environment variable is required');
      console.log('   Set it with: export TEST_TOKEN="your-auth-token"');
      return;
    }

    console.log('📊 Test Configuration:');
    console.log(`   API URL: ${API_BASE_URL}`);
    console.log(`   Amount: ₵${TEST_AMOUNT}`);
    console.log('');

    // Step 1: Get initial balance
    console.log('📊 Step 1: Get Initial Balance');
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
        console.log('   ✅ Initial balance: ₵' + initialBalance.toFixed(2));
      }
    } catch (error) {
      console.log('   ❌ Failed to get initial balance:', error.response?.data?.message || error.message);
      return;
    }

    // Step 2: Create deposit
    console.log('\n📊 Step 2: Create Deposit');
    let depositReference = null;
    try {
      const depositData = {
        amount: TEST_AMOUNT,
        email: 'test@example.com',
        metadata: {
          source: 'complete_flow_test',
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
        depositReference = response.data.data.reference;
        console.log('   ✅ Deposit created successfully');
        console.log('   Reference:', depositReference);
        console.log('   Amount: ₵' + response.data.data.amount);
        console.log('   Paystack URL:', response.data.data.paystackUrl ? 'Generated' : 'Not generated');
      } else {
        throw new Error('Failed to create deposit');
      }
    } catch (error) {
      console.log('   ❌ Failed to create deposit:', error.response?.data?.message || error.message);
      return;
    }

    // Step 3: Check initial transaction status
    console.log('\n📊 Step 3: Check Initial Transaction Status');
    try {
      const verifyResponse = await axios.get(
        `${API_BASE_URL}/api/wallet/deposit/verify/${depositReference}`,
        {
          headers: {
            'Authorization': `Bearer ${TEST_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('   Status:', verifyResponse.data.success ? 'Success' : 'Failed');
      console.log('   Message:', verifyResponse.data.message);
      
      if (verifyResponse.data.data) {
        console.log('   Transaction Status:', verifyResponse.data.data.status);
        console.log('   Amount:', verifyResponse.data.data.amount);
      }
    } catch (error) {
      console.log('   ❌ Failed to verify transaction:', error.response?.data?.message || error.message);
    }

    // Step 4: Simulate webhook processing (for testing)
    console.log('\n📊 Step 4: Simulate Webhook Processing');
    console.log('   ℹ️  In production, this would be triggered automatically by Paystack');
    console.log('   ℹ️  For testing, we can manually trigger the verification');
    
    // Wait a moment to simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      const verifyResponse = await axios.get(
        `${API_BASE_URL}/api/wallet/deposit/verify/${depositReference}`,
        {
          headers: {
            'Authorization': `Bearer ${TEST_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('   Status:', verifyResponse.data.success ? 'Success' : 'Failed');
      console.log('   Message:', verifyResponse.data.message);
      
      if (verifyResponse.data.data) {
        console.log('   Transaction Status:', verifyResponse.data.data.status);
        console.log('   Amount:', verifyResponse.data.data.amount);
        
        if (verifyResponse.data.data.newBalance) {
          console.log('   New Balance: ₵' + verifyResponse.data.data.newBalance);
        }
      }
    } catch (error) {
      console.log('   ❌ Failed to verify after processing:', error.response?.data?.message || error.message);
    }

    // Step 5: Check final balance
    console.log('\n📊 Step 5: Check Final Balance');
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
        const balanceChange = finalBalance - initialBalance;
        
        console.log('   ✅ Final balance: ₵' + finalBalance.toFixed(2));
        console.log('   Balance change: ₵' + balanceChange.toFixed(2));
        
        if (balanceChange > 0) {
          console.log('   ✅ Balance increased - payment was processed!');
        } else {
          console.log('   ⚠️  Balance unchanged - payment may still be pending');
        }
      }
    } catch (error) {
      console.log('   ❌ Failed to get final balance:', error.response?.data?.message || error.message);
    }

    // Step 6: Check transaction history
    console.log('\n📊 Step 6: Check Transaction History');
    try {
      const transactionsResponse = await axios.get(
        `${API_BASE_URL}/api/wallet/transactions?limit=3`,
        {
          headers: {
            'Authorization': `Bearer ${TEST_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (transactionsResponse.data.success) {
        console.log('   ✅ Transaction history retrieved');
        console.log('   Recent transactions:');
        
        const recentTransactions = transactionsResponse.data.transactions || [];
        recentTransactions.forEach((tx, index) => {
          const statusIcon = tx.status === 'completed' ? '✅' : 
                           tx.status === 'pending' ? '⏳' : 
                           tx.status === 'failed' ? '❌' : '❓';
          console.log(`   ${index + 1}. ${statusIcon} ${tx.type} - ₵${Math.abs(tx.amount).toFixed(2)} - ${tx.status}`);
          console.log(`      Reference: ${tx.reference}`);
          console.log(`      Date: ${new Date(tx.createdAt).toLocaleString()}`);
        });
      }
    } catch (error) {
      console.log('   ❌ Failed to get transaction history:', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 Complete payment flow test finished!');
    console.log('\n📋 Summary:');
    console.log(`   - Deposit created with reference: ${depositReference}`);
    console.log(`   - Amount: ₵${TEST_AMOUNT}`);
    console.log(`   - Initial balance: ₵${initialBalance.toFixed(2)}`);
    
    // Get final balance for summary
    try {
      const summaryResponse = await axios.get(
        `${API_BASE_URL}/api/wallet/balance`,
        {
          headers: {
            'Authorization': `Bearer ${TEST_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (summaryResponse.data.success) {
        const finalBalance = summaryResponse.data.balance;
        console.log(`   - Final balance: ₵${finalBalance.toFixed(2)}`);
        console.log(`   - Balance change: ₵${(finalBalance - initialBalance).toFixed(2)}`);
      }
    } catch (error) {
      console.log('   - Final balance: Unable to retrieve');
    }

    console.log('\n🔧 Manual Verification Commands:');
    console.log(`   # Verify this specific transaction:`);
    console.log(`   node verify-payment.js ${depositReference} ${TEST_TOKEN}`);
    console.log(`   `);
    console.log(`   # Or use curl:`);
    console.log(`   curl -H "Authorization: Bearer ${TEST_TOKEN}" \\`);
    console.log(`        "${API_BASE_URL}/api/wallet/deposit/verify/${depositReference}"`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the complete test
testCompletePaymentFlow();