const axios = require('axios');

// Test Paystack verification
const testPaystackVerification = async () => {
  try {
    console.log('🔍 Testing Paystack Verification\n');
    
    const reference = 'DEP-26d4a128ba6c68c54e38-1760011267939';
    
    // Use the same Paystack secret key as the server
    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
    
    if (!PAYSTACK_SECRET_KEY) {
      console.log('❌ PAYSTACK_SECRET_KEY not found in environment');
      console.log('   Available env vars:', Object.keys(process.env).filter(key => key.includes('PAYSTACK')));
      return;
    }
    
    console.log(`🔑 Using Paystack Secret Key: ${PAYSTACK_SECRET_KEY.substring(0, 10)}...`);
    
    // Test Paystack verification
    console.log(`\n📡 Verifying transaction with Paystack: ${reference}`);
    
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const data = response.data;
    
    console.log(`\n✅ Paystack Response:`);
    console.log(`   Status: ${data.status}`);
    console.log(`   Message: ${data.message}`);
    
    if (data.data) {
      console.log(`\n📊 Transaction Data:`);
      console.log(`   Reference: ${data.data.reference}`);
      console.log(`   Status: ${data.data.status}`);
      console.log(`   Amount: ${data.data.amount} pesewas`);
      console.log(`   Gateway Response: ${data.data.gateway_response}`);
      console.log(`   Paid At: ${data.data.paid_at}`);
      console.log(`   Created At: ${data.data.created_at}`);
      console.log(`   Channel: ${data.data.channel}`);
      console.log(`   Currency: ${data.data.currency}`);
      
      if (data.data.customer) {
        console.log(`\n👤 Customer:`);
        console.log(`   Email: ${data.data.customer.email}`);
        console.log(`   Customer Code: ${data.data.customer.customer_code}`);
      }
      
      if (data.data.authorization) {
        console.log(`\n💳 Authorization:`);
        console.log(`   Authorization Code: ${data.data.authorization.authorization_code}`);
        console.log(`   Bank: ${data.data.authorization.bank}`);
        console.log(`   Brand: ${data.data.authorization.brand}`);
        console.log(`   Channel: ${data.data.authorization.channel}`);
      }
    }
    
    // Determine if this should be considered successful
    if (data.status && data.data.status === 'success') {
      console.log(`\n✅ Payment should be considered SUCCESSFUL`);
    } else {
      console.log(`\n❌ Payment should be considered FAILED`);
      console.log(`   Reason: ${data.data.gateway_response || data.message}`);
    }
    
  } catch (error) {
    console.error('❌ Paystack verification failed:', error.message);
    
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Response:`, error.response.data);
    }
  }
};

// Run the test
testPaystackVerification();
