#!/usr/bin/env node

/**
 * Quick script to verify a specific payment transaction
 * Usage: node verify-payment.js <reference> [token]
 */

const axios = require('axios');

async function verifyPayment() {
  try {
    const reference = process.argv[2];
    const token = process.argv[3] || process.env.TEST_TOKEN;
    const API_BASE_URL = process.env.API_BASE_URL || 'https://unlimitedata.onrender.com';

    if (!reference) {
      console.log('❌ Please provide a payment reference');
      console.log('Usage: node verify-payment.js <reference> [token]');
      console.log('Example: node verify-payment.js DEPOSIT-1234567890-abc123');
      return;
    }

    if (!token) {
      console.log('❌ Please provide an auth token');
      console.log('Usage: node verify-payment.js <reference> <token>');
      console.log('Or set TEST_TOKEN environment variable');
      return;
    }

    console.log('🔍 Verifying Payment Transaction');
    console.log('Reference:', reference);
    console.log('API URL:', API_BASE_URL);
    console.log('');

    // Verify the payment
    const response = await axios.get(
      `${API_BASE_URL}/api/wallet/deposit/verify/${reference}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('📊 Verification Result:');
    console.log('Status:', response.status);
    console.log('Success:', response.data.success);
    console.log('Message:', response.data.message);
    
    if (response.data.data) {
      console.log('');
      console.log('📋 Transaction Details:');
      console.log('Reference:', response.data.data.reference);
      console.log('Amount: ₵' + response.data.data.amount);
      console.log('Status:', response.data.data.status);
      
      if (response.data.data.newBalance) {
        console.log('New Balance: ₵' + response.data.data.newBalance);
      }
      
      if (response.data.data.completedAt) {
        console.log('Completed At:', new Date(response.data.data.completedAt).toLocaleString());
      }
      
      if (response.data.data.error) {
        console.log('Error:', response.data.data.error);
      }
    }

    // Also check current wallet balance
    console.log('');
    console.log('💰 Current Wallet Balance:');
    try {
      const balanceResponse = await axios.get(
        `${API_BASE_URL}/api/wallet/balance`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (balanceResponse.data.success) {
        console.log('Balance: ₵' + balanceResponse.data.balance);
        console.log('Currency:', balanceResponse.data.currency);
      }
    } catch (error) {
      console.log('Failed to get balance:', error.response?.data?.message || error.message);
    }

  } catch (error) {
    console.error('❌ Verification failed:');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data?.message || error.message);
    
    if (error.response?.status === 404) {
      console.log('');
      console.log('💡 Possible reasons:');
      console.log('   - Transaction reference not found');
      console.log('   - Transaction belongs to different user');
      console.log('   - Reference format is incorrect');
    }
  }
}

// Run verification
verifyPayment();
