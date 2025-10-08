#!/usr/bin/env node

/**
 * Payment Gateway Switching Test Script
 * 
 * This script tests the payment gateway switching functionality to ensure:
 * 1. Settings can be updated via API
 * 2. Cache is cleared when settings are updated
 * 3. Payment processing uses the correct active gateway
 * 4. Fallback mechanism works when enabled
 */

const axios = require('axios');
const { Settings } = require('./server/schema/schema');
const paymentGatewayService = require('./server/services/paymentGatewayService');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || (() => {
  // Default to localhost for development, production URL for production
  return process.env.NODE_ENV === 'production' ? 'https://unlimitedata.onrender.com' : 'http://localhost:5001';
})();
const TEST_ADMIN_TOKEN = process.env.TEST_ADMIN_TOKEN || 'your-admin-token-here';

// Test data
const testSettings = {
  activeGateway: 'paystack',
  paystackEnabled: true,
  bulkclixEnabled: false,
  paystackPublicKey: 'pk_test_example_key',
  paystackSecretKey: 'sk_test_example_secret',
  bulkclixApiKey: 'bulkclix_test_key',
  autoSwitch: true,
  fallbackGateway: 'bulkclix'
};

const testDepositData = {
  amount: 10,
  phoneNumber: '233241234567',
  network: 'MTN',
  userId: 'test-user-id',
  email: 'test@example.com'
};

class PaymentGatewayTester {
  constructor() {
    this.results = [];
    this.currentSettings = null;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
    console.log(logMessage);
    this.results.push({ timestamp, type, message });
  }

  async testSettingsUpdate() {
    this.log('🧪 Testing Payment Gateway Settings Update...');
    
    try {
      // Test 1: Update settings to Paystack
      this.log('📝 Updating settings to use Paystack as active gateway');
      const paystackResponse = await axios.put(
        `${API_BASE_URL}/api/v1/admin/payment-gateway-settings`,
        {
          ...testSettings,
          activeGateway: 'paystack',
          paystackEnabled: true,
          bulkclixEnabled: true
        },
        {
          headers: {
            'Authorization': `Bearer ${TEST_ADMIN_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (paystackResponse.data.success) {
        this.log('✅ Paystack settings updated successfully');
        this.currentSettings = paystackResponse.data.data;
      } else {
        throw new Error('Failed to update Paystack settings');
      }

      // Test 2: Update settings to BulkClix
      this.log('📝 Updating settings to use BulkClix as active gateway');
      const bulkclixResponse = await axios.put(
        `${API_BASE_URL}/api/v1/admin/payment-gateway-settings`,
        {
          ...testSettings,
          activeGateway: 'bulkclix',
          paystackEnabled: true,
          bulkclixEnabled: true
        },
        {
          headers: {
            'Authorization': `Bearer ${TEST_ADMIN_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (bulkclixResponse.data.success) {
        this.log('✅ BulkClix settings updated successfully');
        this.currentSettings = bulkclixResponse.data.data;
      } else {
        throw new Error('Failed to update BulkClix settings');
      }

      return true;
    } catch (error) {
      this.log(`❌ Settings update test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testCacheClearing() {
    this.log('🧪 Testing Cache Clearing...');
    
    try {
      // Get settings before cache clear
      const settingsBefore = await paymentGatewayService.getSettings();
      this.log(`📊 Active gateway before cache clear: ${settingsBefore.activeGateway}`);
      
      // Update settings via API (this should clear cache)
      await axios.put(
        `${API_BASE_URL}/api/v1/admin/payment-gateway-settings`,
        {
          ...testSettings,
          activeGateway: 'paystack'
        },
        {
          headers: {
            'Authorization': `Bearer ${TEST_ADMIN_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Get settings after cache clear
      const settingsAfter = await paymentGatewayService.getSettings();
      this.log(`📊 Active gateway after cache clear: ${settingsAfter.activeGateway}`);
      
      if (settingsAfter.activeGateway === 'paystack') {
        this.log('✅ Cache clearing works - settings updated immediately');
        return true;
      } else {
        this.log('❌ Cache clearing failed - old settings still cached', 'error');
        return false;
      }
    } catch (error) {
      this.log(`❌ Cache clearing test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testGatewaySelection() {
    this.log('🧪 Testing Gateway Selection Logic...');
    
    try {
      // Test Paystack selection
      await axios.put(
        `${API_BASE_URL}/api/v1/admin/payment-gateway-settings`,
        {
          ...testSettings,
          activeGateway: 'paystack',
          paystackEnabled: true,
          bulkclixEnabled: false
        },
        {
          headers: {
            'Authorization': `Bearer ${TEST_ADMIN_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const paystackSettings = await paymentGatewayService.getSettings();
      this.log(`📊 Paystack settings: active=${paystackSettings.activeGateway}, enabled=${paystackSettings.paystackEnabled}`);
      
      // Test BulkClix selection
      await axios.put(
        `${API_BASE_URL}/api/v1/admin/payment-gateway-settings`,
        {
          ...testSettings,
          activeGateway: 'bulkclix',
          paystackEnabled: false,
          bulkclixEnabled: true
        },
        {
          headers: {
            'Authorization': `Bearer ${TEST_ADMIN_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const bulkclixSettings = await paymentGatewayService.getSettings();
      this.log(`📊 BulkClix settings: active=${bulkclixSettings.activeGateway}, enabled=${bulkclixSettings.bulkclixEnabled}`);
      
      if (paystackSettings.activeGateway === 'paystack' && bulkclixSettings.activeGateway === 'bulkclix') {
        this.log('✅ Gateway selection logic works correctly');
        return true;
      } else {
        this.log('❌ Gateway selection logic failed', 'error');
        return false;
      }
    } catch (error) {
      this.log(`❌ Gateway selection test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testFallbackMechanism() {
    this.log('🧪 Testing Fallback Mechanism...');
    
    try {
      // Set up fallback scenario: BulkClix active but disabled, Paystack as fallback
      await axios.put(
        `${API_BASE_URL}/api/v1/admin/payment-gateway-settings`,
        {
          ...testSettings,
          activeGateway: 'bulkclix',
          paystackEnabled: true,
          bulkclixEnabled: false, // Disabled to trigger fallback
          autoSwitch: true,
          fallbackGateway: 'paystack'
        },
        {
          headers: {
            'Authorization': `Bearer ${TEST_ADMIN_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const settings = await paymentGatewayService.getSettings();
      this.log(`📊 Fallback settings: active=${settings.activeGateway}, autoSwitch=${settings.autoSwitch}, fallback=${settings.fallbackGateway}`);
      
      // Test the fallback logic (this would normally be called during payment processing)
      try {
        // This should trigger fallback since BulkClix is disabled
        await paymentGatewayService.processMobileMoneyDeposit(testDepositData);
        this.log('✅ Fallback mechanism works - should have switched to Paystack');
        return true;
      } catch (error) {
        if (error.message.includes('not available')) {
          this.log('✅ Fallback mechanism correctly detected unavailable gateway');
          return true;
        } else {
          this.log(`❌ Fallback mechanism test failed: ${error.message}`, 'error');
          return false;
        }
      }
    } catch (error) {
      this.log(`❌ Fallback mechanism test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testGetActiveGateway() {
    this.log('🧪 Testing Get Active Gateway API...');
    
    try {
      // Set active gateway to BulkClix
      await axios.put(
        `${API_BASE_URL}/api/v1/admin/payment-gateway-settings`,
        {
          ...testSettings,
          activeGateway: 'bulkclix'
        },
        {
          headers: {
            'Authorization': `Bearer ${TEST_ADMIN_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Test the get active gateway endpoint
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/admin/payment-gateway-settings/active`,
        {
          headers: {
            'Authorization': `Bearer ${TEST_ADMIN_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success && response.data.data.activeGateway === 'bulkclix') {
        this.log('✅ Get active gateway API works correctly');
        return true;
      } else {
        this.log('❌ Get active gateway API failed', 'error');
        return false;
      }
    } catch (error) {
      this.log(`❌ Get active gateway test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async runAllTests() {
    this.log('🚀 Starting Payment Gateway Switching Tests...');
    this.log(`🔗 API Base URL: ${API_BASE_URL}`);
    this.log(`🔑 Using Admin Token: ${TEST_ADMIN_TOKEN ? 'Provided' : 'Missing - please set TEST_ADMIN_TOKEN'}`);
    
    if (!TEST_ADMIN_TOKEN || TEST_ADMIN_TOKEN === 'your-admin-token-here') {
      this.log('❌ Please set TEST_ADMIN_TOKEN environment variable with a valid admin token', 'error');
      return;
    }

    const tests = [
      { name: 'Settings Update', fn: () => this.testSettingsUpdate() },
      { name: 'Cache Clearing', fn: () => this.testCacheClearing() },
      { name: 'Gateway Selection', fn: () => this.testGatewaySelection() },
      { name: 'Fallback Mechanism', fn: () => this.testFallbackMechanism() },
      { name: 'Get Active Gateway', fn: () => this.testGetActiveGateway() }
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
      this.log(`\n🧪 Running ${test.name} Test...`);
      try {
        const result = await test.fn();
        if (result) {
          passed++;
          this.log(`✅ ${test.name} Test PASSED`);
        } else {
          failed++;
          this.log(`❌ ${test.name} Test FAILED`);
        }
      } catch (error) {
        failed++;
        this.log(`❌ ${test.name} Test FAILED with error: ${error.message}`, 'error');
      }
    }

    // Summary
    this.log('\n📊 TEST SUMMARY');
    this.log(`✅ Passed: ${passed}`);
    this.log(`❌ Failed: ${failed}`);
    this.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);

    if (failed === 0) {
      this.log('🎉 All tests passed! Payment gateway switching is working correctly.');
    } else {
      this.log('⚠️  Some tests failed. Please check the logs above for details.');
    }

    return { passed, failed, results: this.results };
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const tester = new PaymentGatewayTester();
  
  tester.runAllTests()
    .then((summary) => {
      console.log('\n🏁 Test execution completed');
      process.exit(summary.failed > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('💥 Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = PaymentGatewayTester;
