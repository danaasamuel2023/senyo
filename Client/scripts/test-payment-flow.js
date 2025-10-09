#!/usr/bin/env node

/**
 * Payment Flow Testing Script
 * Tests the complete payment verification flow
 */

const https = require('https');
const http = require('http');

// Configuration
const CONFIG = {
  development: {
    apiUrl: 'https://unlimitedata.onrender.com',
    frontendUrl: 'http://localhost:3000',
    callbackUrl: 'http://localhost:3000/payment/callback'
  },
  production: {
    apiUrl: 'https://unlimitedata.onrender.com',
    frontendUrl: 'https://unlimitedatagh.com',
    callbackUrl: 'https://unlimitedatagh.com/payment/callback'
  }
};

// Test cases
const TEST_CASES = [
  {
    name: 'Valid Payment Reference',
    reference: 'T1234567890',
    expectedStatus: 200,
    description: 'Test with a valid payment reference format'
  },
  {
    name: 'Invalid Payment Reference',
    reference: 'invalid_ref',
    expectedStatus: 400,
    description: 'Test with an invalid payment reference'
  },
  {
    name: 'Empty Payment Reference',
    reference: '',
    expectedStatus: 400,
    description: 'Test with empty payment reference'
  },
  {
    name: 'Malformed Payment Reference',
    reference: 'ref@#$%^&*()',
    expectedStatus: 400,
    description: 'Test with malformed payment reference'
  }
];

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Helper functions
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

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

// HTTP request helper
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    
    const req = client.request(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Senyo-Payment-Test/1.0',
        ...options.headers
      },
      timeout: options.timeout || 30000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: jsonData,
            headers: res.headers
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: data,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

// Test functions
async function testApiHealth(apiUrl) {
  logInfo(`Testing API health: ${apiUrl}`);
  
  try {
    const response = await makeRequest(`${apiUrl}/api/v1/admin/dashboard/statistics`, {
      method: 'HEAD',
      timeout: 10000
    });
    
    if (response.status === 200 || response.status === 401) {
      logSuccess('API is accessible');
      return true;
    } else {
      logError(`API returned status: ${response.status}`);
      return false;
    }
  } catch (error) {
    logError(`API health check failed: ${error.message}`);
    return false;
  }
}

async function testPaymentVerification(apiUrl, testCase) {
  logInfo(`Testing: ${testCase.name}`);
  logInfo(`Reference: ${testCase.reference || '(empty)'}`);
  logInfo(`Expected Status: ${testCase.expectedStatus}`);
  
  try {
    const url = `${apiUrl}/api/v1/verify-payment?reference=${encodeURIComponent(testCase.reference)}`;
    const response = await makeRequest(url);
    
    if (response.status === testCase.expectedStatus) {
      logSuccess(`Status matches expected: ${response.status}`);
      
      // Check response structure
      if (response.data && typeof response.data === 'object') {
        if (response.data.hasOwnProperty('success')) {
          logSuccess('Response has success field');
        } else {
          logWarning('Response missing success field');
        }
        
        if (response.data.hasOwnProperty('data')) {
          logSuccess('Response has data field');
        } else {
          logWarning('Response missing data field');
        }
      }
      
      return true;
    } else {
      logError(`Status mismatch. Expected: ${testCase.expectedStatus}, Got: ${response.status}`);
      return false;
    }
  } catch (error) {
    logError(`Test failed: ${error.message}`);
    return false;
  }
}

async function testCallbackUrl(callbackUrl) {
  logInfo(`Testing callback URL: ${callbackUrl}`);
  
  try {
    const response = await makeRequest(callbackUrl, {
      method: 'GET',
      timeout: 10000
    });
    
    if (response.status === 200) {
      logSuccess('Callback URL is accessible');
      return true;
    } else {
      logError(`Callback URL returned status: ${response.status}`);
      return false;
    }
  } catch (error) {
    logError(`Callback URL test failed: ${error.message}`);
    return false;
  }
}

async function testWebhookUrl(apiUrl) {
  logInfo(`Testing webhook URL: ${apiUrl}/api/v1/paystack/webhook`);
  
  try {
    const response = await makeRequest(`${apiUrl}/api/v1/paystack/webhook`, {
      method: 'POST',
      body: {
        event: 'charge.success',
        data: {
          reference: 'test_ref_123',
          amount: 1000,
          status: 'success'
        }
      }
    });
    
    // Webhook should return 200 even if it's a test
    if (response.status === 200 || response.status === 400) {
      logSuccess('Webhook URL is accessible');
      return true;
    } else {
      logError(`Webhook URL returned status: ${response.status}`);
      return false;
    }
  } catch (error) {
    logError(`Webhook URL test failed: ${error.message}`);
    return false;
  }
}

// Main test function
async function runTests(environment = 'development') {
  logHeader(`Payment Flow Testing - ${environment.toUpperCase()}`);
  
  const config = CONFIG[environment];
  if (!config) {
    logError(`Invalid environment: ${environment}`);
    process.exit(1);
  }
  
  logInfo(`Environment: ${environment}`);
  logInfo(`API URL: ${config.apiUrl}`);
  logInfo(`Frontend URL: ${config.frontendUrl}`);
  logInfo(`Callback URL: ${config.callbackUrl}`);
  
  let passedTests = 0;
  let totalTests = 0;
  
  // Test 1: API Health Check
  logHeader('API Health Check');
  totalTests++;
  if (await testApiHealth(config.apiUrl)) {
    passedTests++;
  }
  
  // Test 2: Payment Verification Tests
  logHeader('Payment Verification Tests');
  for (const testCase of TEST_CASES) {
    totalTests++;
    if (await testPaymentVerification(config.apiUrl, testCase)) {
      passedTests++;
    }
  }
  
  // Test 3: Callback URL Test
  logHeader('Callback URL Test');
  totalTests++;
  if (await testCallbackUrl(config.callbackUrl)) {
    passedTests++;
  }
  
  // Test 4: Webhook URL Test
  logHeader('Webhook URL Test');
  totalTests++;
  if (await testWebhookUrl(config.apiUrl)) {
    passedTests++;
  }
  
  // Summary
  logHeader('Test Summary');
  logInfo(`Total Tests: ${totalTests}`);
  logInfo(`Passed: ${passedTests}`);
  logInfo(`Failed: ${totalTests - passedTests}`);
  
  if (passedTests === totalTests) {
    logSuccess('All tests passed! 🎉');
    process.exit(0);
  } else {
    logError('Some tests failed. Please check the issues above.');
    process.exit(1);
  }
}

// CLI interface
function showHelp() {
  console.log(`
${colors.bold}Payment Flow Testing Script${colors.reset}

Usage: node test-payment-flow.js [environment]

Environments:
  development  Test against local development servers
  production   Test against production servers

Examples:
  node test-payment-flow.js development
  node test-payment-flow.js production

Options:
  --help, -h   Show this help message
`);
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  showHelp();
  process.exit(0);
}

const environment = args[0] || 'development';

if (!['development', 'production'].includes(environment)) {
  logError(`Invalid environment: ${environment}`);
  showHelp();
  process.exit(1);
}

// Run tests
runTests(environment).catch(error => {
  logError(`Test runner failed: ${error.message}`);
  process.exit(1);
});
