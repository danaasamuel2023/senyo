# Moolre API Integration Guide

## 🔍 Current Issue: OTP Not Being Sent to Real Phone Numbers

### **Problem Analysis**
The Moolre API is responding correctly with "OTP verification required" but users are not receiving actual OTP codes on their phones. This is likely due to:

1. **Sandbox/Test Environment**: The current configuration appears to be in test mode
2. **Test Phone Numbers**: Using test numbers that don't trigger real OTP sending
3. **Account Status**: The Moolre account may need to be activated for production use

### **Current Configuration**
```javascript
// Current settings (likely test/sandbox)
const MOOLRE_API_USER = 'datamart';
const MOOLRE_ACCOUNT_NUMBER = '10661106047264';
const MOOLRE_BASE_URL = 'https://api.moolre.com';
```

## 🚀 Solutions

### **1. Production Environment Setup**

#### **Environment Variables**
Create a `.env` file in the server directory with production credentials:

```env
# Moolre Production Configuration
MOOLRE_API_USER=your_production_username
MOOLRE_API_PUBKEY=your_production_public_key
MOOLRE_API_KEY=your_production_private_key
MOOLRE_ACCOUNT_NUMBER=your_production_account_number
MOOLRE_BASE_URL=https://api.moolre.com

# Alternative: Use sandbox for testing
# MOOLRE_BASE_URL=https://sandbox-api.moolre.com
```

#### **Account Activation**
1. **Contact Moolre Support**: Request production account activation
2. **Verify Account Status**: Ensure your account is approved for live transactions
3. **Update Credentials**: Replace test credentials with production ones

### **2. Testing with Real Phone Numbers**

#### **Valid Test Numbers (if in sandbox)**
- **MTN**: 0241234567, 0240000000
- **Vodafone**: 0201234567, 0200000000  
- **AirtelTigo**: 0261234567, 0260000000

#### **Production Testing**
- Use real phone numbers with active mobile money accounts
- Ensure the phone numbers are registered with the respective networks
- Test with small amounts first

### **3. API Response Codes**

#### **Common Moolre Response Codes**
- **TP14**: OTP verification required
- **SS07**: Transaction not found
- **SS01**: Success
- **SS02**: Failed

#### **Debugging Steps**
1. Check server logs for detailed API responses
2. Use the test endpoint: `GET /api/v1/moolre/status`
3. Monitor transaction status: `GET /api/v1/verify-payments?reference=REF123`

## 🔧 Implementation

### **Test Endpoints Added**

#### **1. API Status Check**
```bash
curl http://localhost:5001/api/v1/moolre/status
```

#### **2. OTP Bypass (Development Only)**
```bash
curl -X POST http://localhost:5001/api/v1/test-otp-bypass \
  -H "Content-Type: application/json" \
  -d '{"reference":"DEP-123456789"}'
```

### **Enhanced Logging**
The system now logs:
- API requests and responses
- Account information
- Transaction details
- Error messages

## 📱 User Experience Improvements

### **Frontend Updates**
1. **Clear Messaging**: Users are informed if OTP might not arrive in test mode
2. **Alternative Options**: Provide manual verification or support contact
3. **Status Indicators**: Show when system is in test vs production mode

### **Error Handling**
- Graceful handling of missing OTPs
- Clear error messages for users
- Fallback options for testing

## 🎯 Next Steps

### **Immediate Actions**
1. **Contact Moolre**: Verify account status and production readiness
2. **Update Credentials**: Switch to production API keys
3. **Test with Real Numbers**: Use actual mobile money numbers
4. **Monitor Logs**: Check server logs for detailed API responses

### **Production Deployment**
1. Set environment variables in production
2. Update frontend messaging for production
3. Remove test endpoints from production
4. Implement proper error monitoring

## 📞 Support

### **Moolre Support**
- **Website**: https://moolre.com
- **Documentation**: Check their API documentation
- **Support**: Contact their technical support team

### **Common Issues**
1. **Account not activated**: Contact Moolre to activate production account
2. **Invalid credentials**: Verify API keys are correct
3. **Network issues**: Check phone number format and network compatibility
4. **Rate limiting**: Implement proper retry logic

---

**Note**: The current implementation is working correctly from a technical standpoint. The issue is likely related to the Moolre account being in test/sandbox mode rather than production mode.
