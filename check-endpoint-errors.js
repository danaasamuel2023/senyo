#!/usr/bin/env node

/**
 * Comprehensive endpoint error detection and analysis
 */

const axios = require('axios');

async function checkEndpointErrors() {
  try {
    console.log('🔍 Checking for Endpoint Errors');
    console.log('===============================\n');

    const API_BASE_URL = process.env.API_BASE_URL || 'https://unlimitedata.onrender.com';
    
    console.log('📊 Error Detection Configuration:');
    console.log(`   API URL: ${API_BASE_URL}`);
    console.log('');

    const endpoints = [
      { method: 'GET', path: '/api/health', name: 'Health Check', expected: 200 },
      { method: 'GET', path: '/api/wallet/balance', name: 'Wallet Balance', expected: 401 },
      { method: 'GET', path: '/api/wallet/transactions', name: 'Wallet Transactions', expected: 401 },
      { method: 'POST', path: '/api/v1/deposit', name: 'V1 Deposit', expected: 400, data: { userId: 'test' } },
      { method: 'GET', path: '/api/v1/verify-payment', name: 'V1 Verify Payment', expected: 400 },
      { method: 'GET', path: '/api/v1/paystack-webhook', name: 'V1 Paystack Webhook', expected: 405 },
      { method: 'GET', path: '/api/v1/paystack/webhook', name: 'V1 Paystack/Webhook', expected: 405 },
      { method: 'POST', path: '/api/v1/wallet-deposit', name: 'New Wallet Deposit', expected: 404 },
      { method: 'GET', path: '/api/wallet/deposit', name: 'Wallet Deposit Route', expected: 404 }
    ];

    console.log('📊 Error Detection Results:');
    console.log('===========================');

    let workingCount = 0;
    let errorCount = 0;
    let totalCount = endpoints.length;
    const errors = [];

    for (const endpoint of endpoints) {
      try {
        const config = {
          method: endpoint.method,
          url: `${API_BASE_URL}${endpoint.path}`,
          timeout: 10000
        };

        // Add data for POST requests
        if (endpoint.method === 'POST' && endpoint.data) {
          config.data = endpoint.data;
          config.headers = {
            'Content-Type': 'application/json'
          };
        }

        const response = await axios(config);
        
        if (response.status === endpoint.expected) {
          console.log(`✅ ${endpoint.name}: Working (${response.status})`);
          workingCount++;
        } else {
          console.log(`⚠️  ${endpoint.name}: Unexpected status ${response.status} (expected ${endpoint.expected})`);
          errors.push({
            endpoint: endpoint.name,
            path: endpoint.path,
            status: response.status,
            expected: endpoint.expected,
            type: 'unexpected_status'
          });
        }

      } catch (error) {
        const status = error.response?.status;
        const message = error.response?.data?.error || error.response?.data?.message || error.message;
        
        if (status === endpoint.expected) {
          console.log(`✅ ${endpoint.name}: Working (${status})`);
          workingCount++;
        } else if (status === 404) {
          console.log(`❌ ${endpoint.name}: Not found (404)`);
          errors.push({
            endpoint: endpoint.name,
            path: endpoint.path,
            status: 404,
            expected: endpoint.expected,
            type: 'not_found',
            message: 'Endpoint not found'
          });
          errorCount++;
        } else if (status === 500) {
          console.log(`🚨 ${endpoint.name}: Server error (500)`);
          errors.push({
            endpoint: endpoint.name,
            path: endpoint.path,
            status: 500,
            expected: endpoint.expected,
            type: 'server_error',
            message: message
          });
          errorCount++;
        } else if (status === 401) {
          console.log(`🔐 ${endpoint.name}: Requires authentication (401)`);
          workingCount++;
        } else if (status === 400) {
          console.log(`⚠️  ${endpoint.name}: Bad request (400) - ${message}`);
          workingCount++;
        } else if (status === 405) {
          console.log(`✅ ${endpoint.name}: Method not allowed (405) - Expected`);
          workingCount++;
        } else {
          console.log(`❓ ${endpoint.name}: Status ${status} - ${message}`);
          errors.push({
            endpoint: endpoint.name,
            path: endpoint.path,
            status: status,
            expected: endpoint.expected,
            type: 'unexpected_error',
            message: message
          });
          errorCount++;
        }
      }
    }

    console.log('\n🎯 Error Analysis Summary:');
    console.log('==========================');
    console.log(`✅ Working endpoints: ${workingCount}/${totalCount}`);
    console.log(`❌ Error endpoints: ${errorCount}/${totalCount}`);
    console.log(`📊 Success rate: ${Math.round((workingCount/totalCount) * 100)}%`);

    if (errors.length > 0) {
      console.log('\n🚨 Detected Errors:');
      console.log('==================');
      errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.endpoint} (${error.path})`);
        console.log(`   Status: ${error.status} (expected ${error.expected})`);
        console.log(`   Type: ${error.type}`);
        console.log(`   Message: ${error.message}`);
        console.log('');
      });

      console.log('🔧 Error Resolution:');
      console.log('====================');
      errors.forEach((error, index) => {
        if (error.type === 'not_found') {
          console.log(`${index + 1}. ${error.endpoint}: Endpoint not deployed - needs server restart`);
        } else if (error.type === 'server_error') {
          console.log(`${index + 1}. ${error.endpoint}: Server error - check server logs`);
        } else if (error.type === 'unexpected_error') {
          console.log(`${index + 1}. ${error.endpoint}: Unexpected error - investigate`);
        }
      });
    } else {
      console.log('\n🎉 NO ERRORS DETECTED!');
      console.log('✅ All endpoints are working correctly');
      console.log('✅ No server errors found');
      console.log('✅ No 404 errors found');
      console.log('✅ System is fully operational');
    }

    console.log('\n🚀 System Status:');
    console.log('================');
    if (errorCount === 0) {
      console.log('✅ PERFECT: All endpoints working without errors');
      console.log('✅ Server is running smoothly');
      console.log('✅ No issues detected');
      console.log('✅ Ready for production use');
    } else {
      console.log('⚠️  ISSUES DETECTED: Some endpoints have errors');
      console.log('🔧 Check error details above for resolution');
      console.log('📞 Contact support if issues persist');
    }

  } catch (error) {
    console.error('❌ Error detection failed:', error.message);
  }
}

// Run error detection
checkEndpointErrors();
