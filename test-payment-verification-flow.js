#!/usr/bin/env node

/**
 * Payment Verification Flow Test Script
 * Tests the complete payment verification and wallet crediting flow
 */

const axios = require('axios');

// Configuration
const BACKEND_URL = 'https://unlimitedata.onrender.com';
const FRONTEND_URL = 'https://unlimiteddatagh.com';

// Test reference (you can replace this with a real reference from a test payment)
const TEST_REFERENCE = 'DEP-test123456789';

console.log('🧪 Payment Verification Flow Test');
console.log('=====================================');
console.log(`Backend URL: ${BACKEND_URL}`);
console.log(`Frontend URL: ${FRONTEND_URL}`);
console.log(`Test Reference: ${TEST_REFERENCE}`);
console.log('');

async function testBackendVerification() {
  console.log('1️⃣ Testing Backend Verification Endpoint...');
  try {
    const response = await axios.get(`${BACKEND_URL}/api/v1/verify-payment?reference=${TEST_REFERENCE}`, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Senyo-Payment-Test/1.0'
      },
      timeout: 30000
    });

    console.log('✅ Backend verification response:', response.status);
    console.log('📊 Response data:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.log('❌ Backend verification failed:', error.response?.status || error.message);
    if (error.response?.data) {
      console.log('📊 Error data:', JSON.stringify(error.response.data, null, 2));
    }
    return null;
  }
}

async function testFrontendCallbackAPI() {
  console.log('\n2️⃣ Testing Frontend Callback API...');
  try {
    const response = await axios.get(`${FRONTEND_URL}/api/payment/callback?reference=${TEST_REFERENCE}&source=unlimitedata`, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Senyo-Payment-Test/1.0'
      },
      timeout: 30000
    });

    console.log('✅ Frontend callback API response:', response.status);
    console.log('📊 Response data:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.log('❌ Frontend callback API failed:', error.response?.status || error.message);
    if (error.response?.data) {
      console.log('📊 Error data:', JSON.stringify(error.response.data, null, 2));
    }
    return null;
  }
}

async function testFrontendCallbackPage() {
  console.log('\n3️⃣ Testing Frontend Callback Page...');
  try {
    const response = await axios.get(`${FRONTEND_URL}/payment/callback?reference=${TEST_REFERENCE}&source=unlimitedata`, {
      headers: {
        'User-Agent': 'Senyo-Payment-Test/1.0'
      },
      timeout: 30000
    });

    console.log('✅ Frontend callback page response:', response.status);
    console.log('📄 Page loads successfully');
    return true;
  } catch (error) {
    console.log('❌ Frontend callback page failed:', error.response?.status || error.message);
    return false;
  }
}

async function testBackendHealth() {
  console.log('\n4️⃣ Testing Backend Health...');
  try {
    const response = await axios.get(`${BACKEND_URL}/api/health`, {
      timeout: 10000
    });

    console.log('✅ Backend health check:', response.status);
    console.log('📊 Health data:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.log('❌ Backend health check failed:', error.response?.status || error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting Payment Verification Flow Tests...\n');

  // Test backend health first
  const backendHealthy = await testBackendHealth();
  if (!backendHealthy) {
    console.log('\n❌ Backend is not healthy. Stopping tests.');
    return;
  }

  // Test backend verification
  const backendResult = await testBackendVerification();

  // Test frontend callback API
  const frontendApiResult = await testFrontendCallbackAPI();

  // Test frontend callback page
  const frontendPageResult = await testFrontendCallbackPage();

  // Summary
  console.log('\n📋 Test Summary');
  console.log('================');
  console.log(`Backend Health: ${backendHealthy ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Backend Verification: ${backendResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Frontend Callback API: ${frontendApiResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Frontend Callback Page: ${frontendPageResult ? '✅ PASS' : '❌ FAIL'}`);

  // Analysis
  console.log('\n🔍 Analysis');
  console.log('============');
  
  if (backendResult && frontendApiResult) {
    console.log('✅ Payment verification flow is working correctly!');
    console.log('✅ Wallet crediting should work properly.');
  } else {
    console.log('❌ Payment verification flow has issues.');
    console.log('❌ Wallet crediting may not work properly.');
    
    if (!backendResult) {
      console.log('   - Backend verification endpoint is not working');
    }
    if (!frontendApiResult) {
      console.log('   - Frontend callback API is not working');
    }
  }

  console.log('\n💡 Next Steps:');
  console.log('1. Deploy the updated frontend callback API');
  console.log('2. Test with a real payment reference');
  console.log('3. Verify wallet balance updates in the database');
  console.log('4. Check Paystack webhook configuration');
}

// Run the tests
runTests().catch(console.error);
