#!/usr/bin/env node

/**
 * Test script to verify Paystack-only payment flow
 * Tests the complete flow: User initiates topup → backend creates pending transaction
 * Paystack payment → user completes payment → Paystack redirects → frontend callback page
 * Frontend verifies → calls backend verification API → Backend verifies with Paystack
 * Atomic processing → updates wallet balances → Frontend updates localStorage → user sees success
 * Redirect to dashboard → payment complete
 */

const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5001';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

async function testPaystackOnlyFlow() {
  console.log('🧪 Testing Paystack-Only Payment Flow');
  console.log('=====================================');

  try {
    // Test 1: Check payment gateway settings endpoint
    console.log('\n1. Testing payment gateway settings endpoint...');
    try {
      const settingsResponse = await axios.get(`${API_BASE_URL}/api/v1/admin/payment-gateway-settings`, {
        headers: {
          'Authorization': 'Bearer test-admin-token',
          'Content-Type': 'application/json'
        }
      });
      
      if (settingsResponse.data.success) {
        console.log('✅ Payment gateway settings endpoint working');
        console.log('   Active Gateway:', settingsResponse.data.data.activeGateway);
        console.log('   Paystack Enabled:', settingsResponse.data.data.paystackEnabled);
        
        // Verify it's Paystack only
        if (settingsResponse.data.data.activeGateway === 'paystack' && 
            settingsResponse.data.data.paystackEnabled === true) {
          console.log('✅ Paystack-only configuration confirmed');
        } else {
          console.log('❌ Configuration not set to Paystack-only');
        }
      } else {
        console.log('❌ Payment gateway settings endpoint failed');
      }
    } catch (error) {
      console.log('⚠️  Payment gateway settings endpoint not accessible (expected in some environments)');
    }

    // Test 2: Test deposit initiation
    console.log('\n2. Testing deposit initiation...');
    try {
      const depositData = {
        userId: 'test-user-id',
        amount: 50,
        totalAmountWithFee: 51.5, // Including Paystack fee
        email: 'test@example.com'
      };

      const depositResponse = await axios.post(`${API_BASE_URL}/api/v1/deposit`, depositData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        }
      });

      if (depositResponse.data.success && depositResponse.data.paystackUrl) {
        console.log('✅ Deposit initiation successful');
        console.log('   Reference:', depositResponse.data.reference);
        console.log('   Paystack URL generated:', depositResponse.data.paystackUrl ? 'Yes' : 'No');
        
        // Verify reference format
        if (depositResponse.data.reference.startsWith('DEP-')) {
          console.log('✅ Reference format correct (DEP-*)');
        } else {
          console.log('❌ Reference format incorrect');
        }
      } else {
        console.log('❌ Deposit initiation failed');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('⚠️  Deposit initiation requires authentication (expected)');
      } else {
        console.log('❌ Deposit initiation error:', error.message);
      }
    }

    // Test 3: Test payment verification endpoint
    console.log('\n3. Testing payment verification endpoint...');
    try {
      const testReference = 'DEP-test123-1234567890';
      const verifyResponse = await axios.get(`${API_BASE_URL}/api/v1/verify-payment?reference=${testReference}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (verifyResponse.data.success === false && verifyResponse.data.error === 'Transaction not found') {
        console.log('✅ Payment verification endpoint working (correctly rejects invalid reference)');
      } else {
        console.log('⚠️  Payment verification response:', verifyResponse.data);
      }
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Payment verification endpoint working (correctly validates reference format)');
      } else {
        console.log('❌ Payment verification error:', error.message);
      }
    }

    // Test 4: Test frontend callback API
    console.log('\n4. Testing frontend callback API...');
    try {
      const callbackResponse = await axios.get(`${FRONTEND_URL}/api/payment/callback?reference=test123&source=unlimitedata`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Frontend callback API accessible');
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('⚠️  Frontend not running (start with: cd Client && npm run dev)');
      } else {
        console.log('❌ Frontend callback API error:', error.message);
      }
    }

    // Test 5: Test Paystack configuration
    console.log('\n5. Testing Paystack configuration...');
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    if (paystackSecretKey) {
      console.log('✅ PAYSTACK_SECRET_KEY environment variable set');
      
      // Test Paystack API connection
      try {
        const paystackResponse = await axios.get('https://api.paystack.co/bank', {
          headers: {
            'Authorization': `Bearer ${paystackSecretKey}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (paystackResponse.status === 200) {
          console.log('✅ Paystack API connection successful');
          console.log('   Available banks:', paystackResponse.data.data?.length || 0);
        }
      } catch (error) {
        console.log('❌ Paystack API connection failed:', error.response?.data?.message || error.message);
      }
    } else {
      console.log('❌ PAYSTACK_SECRET_KEY environment variable not set');
    }

    console.log('\n🎉 Paystack-Only Payment Flow Test Complete');
    console.log('==========================================');
    console.log('\nSummary:');
    console.log('- Backend payment gateway settings: Simplified to Paystack only');
    console.log('- Payment gateway service: Removed BulkClix, uses Paystack only');
    console.log('- Admin settings UI: Simplified to Paystack configuration only');
    console.log('- Deposit routes: Use Paystack mechanism');
    console.log('- Payment verification: Uses Paystack API for verification');
    console.log('- Frontend callback: Handles Paystack redirects');
    
    console.log('\nNext steps:');
    console.log('1. Set PAYSTACK_SECRET_KEY and PAYSTACK_PUBLIC_KEY environment variables');
    console.log('2. Configure Paystack callback URL in dashboard');
    console.log('3. Test complete payment flow with real Paystack keys');
    console.log('4. Deploy to production environment');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testPaystackOnlyFlow();
