#!/usr/bin/env node

/**
 * Real Payment Flow Test Script
 * Tests the complete end-to-end payment flow with Paystack
 */

const axios = require('axios');
const crypto = require('crypto');

// Configuration
const CONFIG = {
  backendUrl: 'http://localhost:5001',
  frontendUrl: 'http://localhost:3000',
  testAmount: 10, // GHS 10 test amount
  testEmail: 'test@unlimiteddata.gh',
  testPhone: '0246783840'
};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logHeader(message) {
  log(`\n${colors.bold}${colors.blue}=== ${message} ===${colors.reset}\n`);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.cyan);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

// Test cases
const TEST_CASES = [
  {
    name: 'Test Deposit Creation',
    description: 'Create a test deposit and get Paystack authorization URL',
    test: testDepositCreation
  },
  {
    name: 'Test Payment Verification',
    description: 'Verify payment status with Paystack API',
    test: testPaymentVerification
  },
  {
    name: 'Test Callback URL',
    description: 'Test frontend callback URL accessibility',
    test: testCallbackUrl
  },
  {
    name: 'Test Webhook Endpoint',
    description: 'Test backend webhook endpoint',
    test: testWebhookEndpoint
  }
];

// Test 1: Deposit Creation
async function testDepositCreation() {
  try {
    logInfo('Creating test deposit...');
    
    const depositData = {
      userId: 'test-user-123',
      amount: CONFIG.testAmount,
      totalAmountWithFee: CONFIG.testAmount,
      email: CONFIG.testEmail
    };
    
    const response = await axios.post(`${CONFIG.backendUrl}/api/v1/deposit`, depositData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      timeout: 10000
    });
    
    if (response.data.success && response.data.paystackUrl) {
      logSuccess('Deposit created successfully');
      logInfo(`Paystack URL: ${response.data.paystackUrl}`);
      logInfo(`Reference: ${response.data.reference || 'N/A'}`);
      return {
        success: true,
        paystackUrl: response.data.paystackUrl,
        reference: response.data.reference
      };
    } else {
      logError('Deposit creation failed');
      logError(`Response: ${JSON.stringify(response.data)}`);
      return { success: false };
    }
  } catch (error) {
    logError(`Deposit creation error: ${error.message}`);
    if (error.response) {
      logError(`Status: ${error.response.status}`);
      logError(`Data: ${JSON.stringify(error.response.data)}`);
    }
    return { success: false };
  }
}

// Test 2: Payment Verification
async function testPaymentVerification(reference = 'test-ref-123') {
  try {
    logInfo(`Verifying payment with reference: ${reference}`);
    
    const response = await axios.get(`${CONFIG.backendUrl}/api/v1/verify-payment`, {
      params: { reference },
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    if (response.data.success) {
      logSuccess('Payment verification successful');
      logInfo(`Status: ${response.data.data?.status || 'N/A'}`);
      logInfo(`Amount: ${response.data.data?.amount || 'N/A'}`);
      return { success: true, data: response.data.data };
    } else {
      logWarning('Payment verification returned failure (expected for test reference)');
      return { success: false, data: response.data };
    }
  } catch (error) {
    logError(`Payment verification error: ${error.message}`);
    if (error.response) {
      logError(`Status: ${error.response.status}`);
      logError(`Data: ${JSON.stringify(error.response.data)}`);
    }
    return { success: false };
  }
}

// Test 3: Callback URL
async function testCallbackUrl() {
  try {
    logInfo('Testing frontend callback URL...');
    
    const testReference = 'test-callback-123';
    const callbackUrl = `${CONFIG.frontendUrl}/payment/callback?reference=${testReference}&source=unlimitedata`;
    
    const response = await axios.get(callbackUrl, {
      timeout: 10000,
      validateStatus: (status) => status < 500 // Accept redirects
    });
    
    if (response.status === 200) {
      logSuccess('Callback URL accessible');
      logInfo(`Status: ${response.status}`);
      return { success: true };
    } else {
      logWarning(`Callback URL returned status: ${response.status}`);
      return { success: false };
    }
  } catch (error) {
    logError(`Callback URL test error: ${error.message}`);
    return { success: false };
  }
}

// Test 4: Webhook Endpoint
async function testWebhookEndpoint() {
  try {
    logInfo('Testing backend webhook endpoint...');
    
    const webhookData = {
      event: 'charge.success',
      data: {
        reference: 'test-webhook-123',
        amount: CONFIG.testAmount * 100, // Paystack amounts are in kobo
        status: 'success'
      }
    };
    
    const response = await axios.post(`${CONFIG.backendUrl}/api/v1/paystack/webhook`, webhookData, {
      headers: {
        'Content-Type': 'application/json',
        'x-paystack-signature': 'test-signature'
      },
      timeout: 10000
    });
    
    // Expect "Invalid signature" response for test
    if (response.data.error === 'Invalid signature') {
      logSuccess('Webhook endpoint accessible (invalid signature expected)');
      return { success: true };
    } else {
      logWarning(`Webhook response: ${JSON.stringify(response.data)}`);
      return { success: false };
    }
  } catch (error) {
    logError(`Webhook test error: ${error.message}`);
    if (error.response) {
      logError(`Status: ${error.response.status}`);
      logError(`Data: ${JSON.stringify(error.response.data)}`);
    }
    return { success: false };
  }
}

// Main test runner
async function runRealPaymentFlowTest() {
  logHeader('Real Payment Flow Test');
  
  logInfo('Configuration:');
  logInfo(`Backend URL: ${CONFIG.backendUrl}`);
  logInfo(`Frontend URL: ${CONFIG.frontendUrl}`);
  logInfo(`Test Amount: GHS ${CONFIG.testAmount}`);
  logInfo(`Test Email: ${CONFIG.testEmail}`);
  
  let passedTests = 0;
  let totalTests = TEST_CASES.length;
  let depositResult = null;
  
  for (const testCase of TEST_CASES) {
    logHeader(testCase.name);
    logInfo(testCase.description);
    
    try {
      const result = await testCase.test();
      
      if (result.success) {
        logSuccess(`${testCase.name} passed`);
        passedTests++;
        
        // Store deposit result for reference
        if (testCase.name === 'Test Deposit Creation' && result.paystackUrl) {
          depositResult = result;
        }
      } else {
        logError(`${testCase.name} failed`);
      }
    } catch (error) {
      logError(`${testCase.name} error: ${error.message}`);
    }
    
    // Add delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  logHeader('Test Summary');
  logInfo(`Total Tests: ${totalTests}`);
  logInfo(`Passed: ${passedTests}`);
  logInfo(`Failed: ${totalTests - passedTests}`);
  
  if (passedTests === totalTests) {
    logSuccess('All tests passed! 🎉');
  } else {
    logWarning('Some tests failed. Check the issues above.');
  }
  
  // Additional instructions
  if (depositResult && depositResult.paystackUrl) {
    logHeader('Next Steps for Real Payment Testing');
    logInfo('To test a real payment flow:');
    logInfo('1. Open the Paystack URL in your browser:');
    logInfo(`   ${depositResult.paystackUrl}`);
    logInfo('2. Complete the payment using Paystack test credentials');
    logInfo('3. Verify redirect to callback URL');
    logInfo('4. Check payment verification');
    logInfo('5. Confirm wallet balance update');
    
    logWarning('Note: Use Paystack test mode for safe testing');
  }
  
  logHeader('Paystack Test Credentials');
  logInfo('For testing, use these Paystack test credentials:');
  logInfo('Card Number: 4084084084084081');
  logInfo('CVV: 408');
  logInfo('Expiry: Any future date');
  logInfo('PIN: 1234');
  
  return passedTests === totalTests;
}

// CLI interface
if (require.main === module) {
  runRealPaymentFlowTest()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      logError(`Test runner error: ${error.message}`);
      process.exit(1);
    });
}

module.exports = { runRealPaymentFlowTest };
