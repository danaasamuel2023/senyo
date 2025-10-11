#!/usr/bin/env node

/**
 * Quick test script for payment system
 * Usage: node quick-test.js YOUR_AUTH_TOKEN
 */

const axios = require('axios');

async function quickTest() {
  try {
    const token = process.argv[2];
    const API_BASE_URL = process.env.API_BASE_URL || 'https://unlimitedata.onrender.com';

    if (!token) {
      console.log('❌ Please provide your auth token');
      console.log('Usage: node quick-test.js YOUR_AUTH_TOKEN');
      console.log('Example: node quick-test.js eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
      return;
    }

    console.log('🧪 Quick Payment System Test\n');

    // Test 1: Get current balance
    console.log('📊 Step 1: Get Current Balance');
    try {
      const response = await axios.get(`${API_BASE_URL}/api/wallet/balance`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        console.log('   ✅ Current balance: ₵' + response.data.balance);
        console.log('   Currency:', response.data.currency);
      } else {
        console.log('   ❌ Failed to get balance:', response.data.message);
      }
    } catch (error) {
      console.log('   ❌ Error:', error.response?.data?.message || error.message);
    }
    console.log('');

    // Test 2: Try to create a deposit (this will test if the endpoint is available)
    console.log('📊 Step 2: Test Deposit Endpoint');
    try {
      const response = await axios.post(`${API_BASE_URL}/api/wallet/deposit`, {
        amount: 10.30,
        email: 'test@example.com'
      }, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        console.log('   ✅ Deposit endpoint is working!');
        console.log('   Reference:', response.data.data.reference);
        console.log('   Amount: ₵' + response.data.data.amount);
        console.log('   Paystack URL:', response.data.data.paystackUrl ? 'Generated' : 'Not generated');
      } else {
        console.log('   ❌ Deposit failed:', response.data.message);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('   ⚠️  Deposit endpoint not found - server may need restart');
      } else {
        console.log('   ❌ Error:', error.response?.data?.message || error.message);
      }
    }
    console.log('');

    // Test 3: Get transaction history
    console.log('📊 Step 3: Get Transaction History');
    try {
      const response = await axios.get(`${API_BASE_URL}/api/wallet/transactions?limit=3`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        console.log('   ✅ Transaction history retrieved');
        console.log('   Total transactions:', response.data.total);
        
        const transactions = response.data.transactions || [];
        if (transactions.length > 0) {
          console.log('   Recent transactions:');
          transactions.forEach((tx, index) => {
            const statusIcon = tx.status === 'completed' ? '✅' : 
                             tx.status === 'pending' ? '⏳' : 
                             tx.status === 'failed' ? '❌' : '❓';
            console.log(`   ${index + 1}. ${statusIcon} ${tx.type} - ₵${Math.abs(tx.amount).toFixed(2)} - ${tx.status}`);
          });
        } else {
          console.log('   No transactions found');
        }
      } else {
        console.log('   ❌ Failed to get transactions:', response.data.message);
      }
    } catch (error) {
      console.log('   ❌ Error:', error.response?.data?.message || error.message);
    }
    console.log('');

    console.log('🎉 Quick test completed!');
    console.log('\n📋 Next Steps:');
    console.log('   1. If deposit endpoint is working, try making a real deposit');
    console.log('   2. Complete the payment on Paystack');
    console.log('   3. Check that your balance increases');
    console.log('   4. Verify the transaction appears in history');
    
    console.log('\n🔧 Manual Testing:');
    console.log('   1. Go to your application');
    console.log('   2. Navigate to deposit page');
    console.log('   3. Make a test deposit');
    console.log('   4. Complete payment on Paystack');
    console.log('   5. Check wallet balance and transaction history');

  } catch (error) {
    console.error('❌ Quick test failed:', error.message);
  }
}

// Run quick test
quickTest();
