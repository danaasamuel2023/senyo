# 🧪 Payment System Testing Setup Guide

## 🚀 **Quick Start Testing**

### **Step 1: Start Development Servers**

```bash
# Terminal 1 - Start Backend Server
cd /path/to/your/backend
npm start
# Server should run on http://localhost:5001

# Terminal 2 - Start Frontend Server  
cd /Users/samtech/Senyo1/senyo/Client
npm run dev
# Server should run on http://localhost:3000
```

### **Step 2: Run Automated Tests**

```bash
# Run the test script
cd /Users/samtech/Senyo1/senyo/Client
node scripts/test-payment-flow.js development

# Or run individual tests
node scripts/test-payment-flow.js production
```

### **Step 3: Use Web Interface**

1. Open your browser to `http://localhost:3000/test-payment`
2. Click "Run All Tests" to test the payment system
3. Review results and fix any issues

## 🔧 **Paystack Dashboard Configuration**

### **1. Login to Paystack Dashboard**
- Go to [https://dashboard.paystack.com](https://dashboard.paystack.com)
- Sign in with your merchant account

### **2. Configure Callback URL**
- Navigate to **Settings** → **Webhooks**
- Set **Callback URL**: `https://yourdomain.com/payment/callback`
- Set **Webhook URL**: `https://unlimitedata.onrender.com/api/v1/paystack/webhook`

### **3. Test Webhook**
- Click "Test Webhook" in Paystack dashboard
- Verify it returns a 200 status code

## 🧪 **Testing Scenarios**

### **Development Testing**

#### **Prerequisites:**
- [ ] Backend server running on `localhost:5001`
- [ ] Frontend server running on `localhost:3000`
- [ ] Paystack test keys configured
- [ ] Environment variables set

#### **Test Cases:**

1. **Basic Payment Flow**
   ```bash
   # Test payment verification endpoint
   curl -X GET "http://localhost:5001/api/v1/verify-payment?reference=test_ref_123" \
     -H "Content-Type: application/json"
   ```

2. **Error Scenarios**
   ```bash
   # Test invalid reference
   curl -X GET "http://localhost:5001/api/v1/verify-payment?reference=invalid" \
     -H "Content-Type: application/json"
   
   # Test empty reference
   curl -X GET "http://localhost:5001/api/v1/verify-payment?reference=" \
     -H "Content-Type: application/json"
   ```

3. **Callback URL Test**
   ```bash
   # Test callback URL accessibility
   curl -I http://localhost:3000/payment/callback
   ```

### **Production Testing**

#### **Prerequisites:**
- [ ] Production backend deployed
- [ ] Frontend deployed and accessible
- [ ] Paystack live keys configured
- [ ] SSL certificate valid

#### **Test Cases:**

1. **Live Payment Test**
   - Make a small real payment (₵1-₵5)
   - Verify callback URL works
   - Check webhook receives notifications

2. **API Endpoint Test**
   ```bash
   # Test production API
   curl -X GET "https://unlimitedata.onrender.com/api/v1/verify-payment?reference=live_ref_123" \
     -H "Content-Type: application/json"
   ```

## 🔍 **Troubleshooting**

### **Common Issues:**

#### **1. Backend Server Not Running**
**Symptoms**: All tests fail with connection errors
**Solution**:
```bash
# Check if backend is running
curl -I http://localhost:5001/api/v1/admin/dashboard/statistics

# Start backend if not running
cd /path/to/backend
npm start
```

#### **2. Frontend Server Not Running**
**Symptoms**: Callback URL tests fail
**Solution**:
```bash
# Check if frontend is running
curl -I http://localhost:3000

# Start frontend if not running
cd /Users/samtech/Senyo1/senyo/Client
npm run dev
```

#### **3. API Endpoint Not Found**
**Symptoms**: 404 errors on payment verification
**Solution**:
- Check backend routes are properly configured
- Verify API endpoint path: `/api/v1/verify-payment`
- Check backend server logs for errors

#### **4. CORS Issues**
**Symptoms**: Network errors in browser
**Solution**:
- Check CORS configuration in backend
- Verify allowed origins include frontend URL
- Check browser console for CORS errors

#### **5. Environment Variables**
**Symptoms**: Wrong API URLs being used
**Solution**:
```bash
# Check environment variables
echo $NEXT_PUBLIC_API_URL

# Set environment variables
export NEXT_PUBLIC_API_URL=http://localhost:5001  # Development
export NEXT_PUBLIC_API_URL=https://unlimitedata.onrender.com  # Production
```

## 📊 **Test Results Interpretation**

### **Success Indicators:**
- ✅ API Health Check: Status 200 or 401
- ✅ Payment Verification: Status 200 for valid references
- ✅ Error Handling: Status 400 for invalid references
- ✅ Callback URL: Status 200
- ✅ Webhook URL: Status 200 or 400

### **Failure Indicators:**
- ❌ Connection refused: Server not running
- ❌ 404 Not Found: Endpoint not configured
- ❌ 500 Internal Server Error: Backend error
- ❌ Timeout: Network or server issues

## 🚀 **Production Deployment Checklist**

Before going live:

- [ ] **Paystack Configuration**
  - [ ] Live keys configured
  - [ ] Callback URL set to production domain
  - [ ] Webhook URL accessible
  - [ ] Webhook tested successfully

- [ ] **Server Configuration**
  - [ ] Backend deployed and running
  - [ ] Frontend deployed and accessible
  - [ ] SSL certificate valid
  - [ ] Environment variables set

- [ ] **Testing**
  - [ ] All automated tests pass
  - [ ] Manual payment flow tested
  - [ ] Error scenarios tested
  - [ ] Performance tested

- [ ] **Monitoring**
  - [ ] Error logging configured
  - [ ] Performance monitoring set up
  - [ ] Alert system configured
  - [ ] Backup system in place

## 📞 **Support**

If you encounter issues:

1. **Check Logs**: Review server and browser console logs
2. **Run Tests**: Use the automated test suite
3. **Verify Configuration**: Check Paystack dashboard settings
4. **Test Manually**: Use the web interface at `/test-payment`

## 🔄 **Regular Maintenance**

- **Weekly**: Review error logs and test results
- **Monthly**: Update dependencies and run full test suite
- **Quarterly**: Review security settings and performance
- **Annually**: Audit payment flow and update documentation
