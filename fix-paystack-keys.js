#!/usr/bin/env node

/**
 * Fix Paystack API Keys Script
 * Updates Paystack keys to resolve 401 Unauthorized errors
 */

const axios = require('axios');

// Current problematic keys (from ADMIN_DASHBOARD_FIXES_SUMMARY.md)
const CURRENT_KEYS = {
  secret: 'sk_live_0fba72fb9c4fc71200d2e0cdbb4f2b37c1de396c',
  public: 'pk_live_6c2f71cb00f87a32fb593bc0c679cfd28f5ab2d'
};

// Updated keys (from RENDER-DEPLOYMENT.md)
const UPDATED_KEYS = {
  secret: 'sk_live_d5228090985d3b7d9f8df6de2921b02615ccf73b',
  public: 'pk_live_6c2f71cb00f87a32fb593bc0c679cfd28f5ab2d3'
};

async function testPaystackKey(secretKey) {
  try {
    console.log(`🔍 Testing Paystack key: ${secretKey.substring(0, 20)}...`);
    
    const response = await axios.get('https://api.paystack.co/bank', {
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    if (response.status === 200) {
      console.log('✅ Key is valid and working');
      return true;
    } else {
      console.log(`❌ Key returned status: ${response.status}`);
      return false;
    }
  } catch (error) {
    if (error.response) {
      console.log(`❌ Key test failed: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`);
    } else {
      console.log(`❌ Key test failed: ${error.message}`);
    }
    return false;
  }
}

async function fixPaystackKeys() {
  console.log('🔧 Fixing Paystack API Keys\n');
  
  console.log('📊 Current Configuration:');
  console.log(`   Secret Key: ${CURRENT_KEYS.secret.substring(0, 20)}...`);
  console.log(`   Public Key: ${CURRENT_KEYS.public.substring(0, 20)}...`);
  
  console.log('\n📊 Updated Configuration:');
  console.log(`   Secret Key: ${UPDATED_KEYS.secret.substring(0, 20)}...`);
  console.log(`   Public Key: ${UPDATED_KEYS.public.substring(0, 20)}...`);
  
  console.log('\n🧪 Testing Current Keys:');
  const currentSecretValid = await testPaystackKey(CURRENT_KEYS.secret);
  
  console.log('\n🧪 Testing Updated Keys:');
  const updatedSecretValid = await testPaystackKey(UPDATED_KEYS.secret);
  
  console.log('\n📋 Results:');
  console.log(`   Current Secret Key: ${currentSecretValid ? '✅ Valid' : '❌ Invalid'}`);
  console.log(`   Updated Secret Key: ${updatedSecretValid ? '✅ Valid' : '❌ Invalid'}`);
  
  if (updatedSecretValid && !currentSecretValid) {
    console.log('\n🎯 Solution:');
    console.log('   The updated keys are working! Update your environment variables:');
    console.log('\n   For Render.com:');
    console.log(`   PAYSTACK_SECRET_KEY=${UPDATED_KEYS.secret}`);
    console.log(`   PAYSTACK_PUBLIC_KEY=${UPDATED_KEYS.public}`);
    console.log(`   PAYSTACK_WEBHOOK_SECRET=${UPDATED_KEYS.secret}`);
    
    console.log('\n   For Local Development (.env):');
    console.log(`   PAYSTACK_SECRET_KEY=${UPDATED_KEYS.secret}`);
    console.log(`   PAYSTACK_PUBLIC_KEY=${UPDATED_KEYS.public}`);
    
    console.log('\n   For start-server.sh:');
    console.log(`   export PAYSTACK_SECRET_KEY="${UPDATED_KEYS.secret}"`);
    console.log(`   export PAYSTACK_PUBLIC_KEY="${UPDATED_KEYS.public}"`);
    
    console.log('\n🚀 Next Steps:');
    console.log('   1. Update environment variables in Render dashboard');
    console.log('   2. Update local .env files');
    console.log('   3. Restart the server');
    console.log('   4. Test payment functionality');
    
  } else if (currentSecretValid) {
    console.log('\n✅ Current keys are working fine');
    console.log('   The issue might be elsewhere in the payment flow');
    
  } else {
    console.log('\n❌ Both key sets are invalid');
    console.log('   You need to:');
    console.log('   1. Check your Paystack dashboard');
    console.log('   2. Generate new API keys');
    console.log('   3. Verify account status');
    console.log('   4. Contact Paystack support if needed');
  }
  
  console.log('\n📞 Paystack Support:');
  console.log('   - Dashboard: https://dashboard.paystack.com');
  console.log('   - Support: https://paystack.com/support');
  console.log('   - Documentation: https://paystack.com/docs');
}

// Run the fix
if (require.main === module) {
  fixPaystackKeys().catch(console.error);
}

module.exports = { fixPaystackKeys, testPaystackKey };
