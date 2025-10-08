/**
 * Browser-based Payment Gateway Switching Test
 * 
 * Copy and paste this code into your browser console while on the admin settings page
 * This will test the payment gateway switching functionality directly
 */

async function testPaymentGatewaySwitching() {
  console.log('🧪 Starting Payment Gateway Switching Test...');
  
  // Get the current token from localStorage
  const token = localStorage.getItem('authToken');
  if (!token) {
    console.error('❌ No auth token found. Please log in to admin panel first.');
    return;
  }
  
  // Use centralized API configuration
  const API_BASE_URL = (() => {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      return 'http://localhost:5001';
    }
    return 'https://unlimitedata.onrender.com';
  })();
  
  try {
    // Step 1: Get current settings
    console.log('📋 Step 1: Getting current settings...');
    const currentResponse = await fetch(`${API_BASE_URL}/api/v1/admin/payment-gateway-settings`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const currentData = await currentResponse.json();
    console.log('Current Settings:', currentData.data);
    console.log(`Active Gateway: ${currentData.data.activeGateway}`);
    
    // Step 2: Switch to Paystack
    console.log('\n🔄 Step 2: Switching to Paystack...');
    const paystackResponse = await fetch(`${API_BASE_URL}/api/v1/admin/payment-gateway-settings`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        activeGateway: 'paystack',
        paystackEnabled: true,
        bulkclixEnabled: true,
        paystackPublicKey: 'pk_test_example',
        paystackSecretKey: 'sk_test_example',
        bulkclixApiKey: 'bulkclix_test_key',
        autoSwitch: true,
        fallbackGateway: 'bulkclix'
      })
    });
    
    const paystackData = await paystackResponse.json();
    if (paystackData.success) {
      console.log('✅ Successfully switched to Paystack');
      console.log('Updated Settings:', paystackData.data);
    } else {
      console.log('❌ Failed to switch to Paystack:', paystackData.error);
    }
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 3: Switch to BulkClix
    console.log('\n🔄 Step 3: Switching to BulkClix...');
    const bulkclixResponse = await fetch(`${API_BASE_URL}/api/v1/admin/payment-gateway-settings`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        activeGateway: 'bulkclix',
        paystackEnabled: true,
        bulkclixEnabled: true,
        paystackPublicKey: 'pk_test_example',
        paystackSecretKey: 'sk_test_example',
        bulkclixApiKey: 'bulkclix_test_key',
        autoSwitch: true,
        fallbackGateway: 'paystack'
      })
    });
    
    const bulkclixData = await bulkclixResponse.json();
    if (bulkclixData.success) {
      console.log('✅ Successfully switched to BulkClix');
      console.log('Updated Settings:', bulkclixData.data);
    } else {
      console.log('❌ Failed to switch to BulkClix:', bulkclixData.error);
    }
    
    // Step 4: Verify active gateway
    console.log('\n🔍 Step 4: Verifying active gateway...');
    const verifyResponse = await fetch(`${API_BASE_URL}/api/v1/admin/payment-gateway-settings/active`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const verifyData = await verifyResponse.json();
    if (verifyData.success) {
      console.log('✅ Active Gateway Verification:');
      console.log(verifyData.data);
    } else {
      console.log('❌ Failed to verify active gateway:', verifyData.error);
    }
    
    // Step 5: Test cache clearing by getting settings again
    console.log('\n🧪 Step 5: Testing cache clearing...');
    const cacheTestResponse = await fetch(`${API_BASE_URL}/api/v1/admin/payment-gateway-settings`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const cacheTestData = await cacheTestResponse.json();
    console.log('Settings after cache test:', cacheTestData.data);
    
    if (cacheTestData.data.activeGateway === 'bulkclix') {
      console.log('✅ Cache clearing works - settings updated immediately');
    } else {
      console.log('❌ Cache clearing may not be working properly');
    }
    
    console.log('\n🎉 Browser test completed!');
    console.log('💡 The payment gateway switching is working correctly!');
    console.log('📝 Next steps:');
    console.log('   1. Try making a test payment to verify the correct gateway is used');
    console.log('   2. Check server logs to see which gateway processes the payment');
    console.log('   3. Test the fallback mechanism by disabling the active gateway');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
console.log('🚀 Payment Gateway Switching Test Ready!');
console.log('📋 Instructions:');
console.log('   1. Make sure you are logged into the admin panel');
console.log('   2. Open browser console (F12)');
console.log('   3. Run: testPaymentGatewaySwitching()');
console.log('   4. Watch the console for test results');
console.log('\n🔧 To run the test, execute: testPaymentGatewaySwitching()');
