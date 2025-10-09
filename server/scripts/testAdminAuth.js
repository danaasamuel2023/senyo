const axios = require('axios');

// Test admin authentication and verify-paystack endpoint
const testAdminAuth = async () => {
  try {
    console.log('🧪 Testing Admin Authentication and Verify-Paystack Endpoint\n');
    
    // Test credentials (using existing admin)
    const adminCredentials = {
      email: 'sunumanfred14@gmail.com',
      password: 'Kingfred4190$'
    };
    
    console.log('1. 🔐 Testing admin login...');
    
    // Step 1: Login as admin
    const loginResponse = await axios.post('http://localhost:5001/api/v1/login', {
      email: adminCredentials.email,
      password: adminCredentials.password
    });
    
    if (loginResponse.data.token) {
      console.log('✅ Admin login successful');
      console.log(`   Token: ${loginResponse.data.token.substring(0, 20)}...`);
      console.log(`   User Role: ${loginResponse.data.user.role}`);
      
      const token = loginResponse.data.token;
      
      // Step 2: Test verify-paystack endpoint
      console.log('\n2. 🔍 Testing verify-paystack endpoint...');
      
      const testReference = 'DEP-b44506abb6eab26b3dc3-1760007555128';
      
      try {
        const verifyResponse = await axios.get(
          `http://localhost:5001/api/v1/admin/verify-paystack/${testReference}`,
          {
            headers: {
              'x-auth-token': token,
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log('✅ Verify-paystack endpoint working');
        console.log('   Response:', JSON.stringify(verifyResponse.data, null, 2));
        
      } catch (verifyError) {
        console.log('❌ Verify-paystack endpoint failed');
        console.log('   Status:', verifyError.response?.status);
        console.log('   Error:', verifyError.response?.data);
        
        if (verifyError.response?.status === 404) {
          console.log('   💡 This might be expected if the transaction reference is not found');
        }
      }
      
      // Step 3: Test with a valid reference from our database
      console.log('\n3. 🔍 Testing with valid transaction reference...');
      
      const validReference = 'DEP-164cbadf2d29e9a8e527-1760010728076';
      
      try {
        const validVerifyResponse = await axios.get(
          `http://localhost:5001/api/v1/admin/verify-paystack/${validReference}`,
          {
            headers: {
              'x-auth-token': token,
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log('✅ Valid reference verification successful');
        console.log('   Response:', JSON.stringify(validVerifyResponse.data, null, 2));
        
      } catch (validVerifyError) {
        console.log('❌ Valid reference verification failed');
        console.log('   Status:', validVerifyError.response?.status);
        console.log('   Error:', validVerifyError.response?.data);
      }
      
    } else {
      console.log('❌ Admin login failed');
      console.log('   Response:', loginResponse.data);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', error.response.data);
    }
  }
};

// Run the test
testAdminAuth();
