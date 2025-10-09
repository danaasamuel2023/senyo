# Paystack Dashboard Configuration Guide

## 🔧 **Step 1: Update Paystack Dashboard Settings**

### **Callback URL Configuration**

1. **Login to Paystack Dashboard**
   - Go to [https://dashboard.paystack.com](https://dashboard.paystack.com)
   - Sign in with your merchant account

2. **Navigate to Settings**
   - Click on **Settings** in the left sidebar
   - Select **Webhooks** from the settings menu

3. **Configure Callback URL**
   - **Callback URL**: `https://yourdomain.com/payment/callback`
   - **Webhook URL**: `https://unlimitedata.onrender.com/api/v1/paystack/webhook`
   - **Events to Listen For**: 
     - `charge.success`
     - `transfer.success`
     - `transfer.failed`

4. **Save Configuration**
   - Click **Save** to apply the changes
   - Test the webhook URL to ensure it's working

### **Important Notes:**
- Replace `yourdomain.com` with your actual domain name
- The callback URL is where users are redirected after payment
- The webhook URL is where Paystack sends payment notifications
- Both URLs must be HTTPS in production

## 🧪 **Step 2: Testing Checklist**

### **Development Environment Testing**

#### **Prerequisites:**
- [ ] Local backend server running on `http://localhost:5001`
- [ ] Frontend running on `http://localhost:3000`
- [ ] Paystack test keys configured
- [ ] Environment variables set correctly

#### **Test Scenarios:**

1. **Basic Payment Flow**
   - [ ] Initiate a test payment from `/topup` page
   - [ ] Complete payment on Paystack test page
   - [ ] Verify redirect to `/payment/callback`
   - [ ] Check payment verification success
   - [ ] Confirm wallet balance update

2. **Error Scenarios**
   - [ ] Test with invalid payment reference
   - [ ] Test network timeout (disconnect internet)
   - [ ] Test server error (stop backend)
   - [ ] Verify error messages are user-friendly

3. **Edge Cases**
   - [ ] Test with empty payment reference
   - [ ] Test with malformed payment reference
   - [ ] Test multiple rapid payment attempts
   - [ ] Test payment cancellation

### **Production Environment Testing**

#### **Prerequisites:**
- [ ] Production backend deployed and running
- [ ] Frontend deployed and accessible
- [ ] Paystack live keys configured
- [ ] SSL certificate valid
- [ ] Environment variables set in production

#### **Test Scenarios:**

1. **Live Payment Flow**
   - [ ] Test with small real payment (₵1-₵5)
   - [ ] Verify callback URL works
   - [ ] Check webhook receives notifications
   - [ ] Confirm database updates
   - [ ] Test email notifications (if configured)

2. **Performance Testing**
   - [ ] Test payment verification speed
   - [ ] Check timeout handling
   - [ ] Verify retry logic works
   - [ ] Monitor error rates

3. **Security Testing**
   - [ ] Test with invalid signatures
   - [ ] Verify HTTPS enforcement
   - [ ] Check for CORS issues
   - [ ] Test rate limiting

## 🔍 **Step 3: Monitoring and Debugging**

### **Log Monitoring**

Check these logs for issues:

1. **Frontend Logs**
   ```javascript
   // Check browser console for:
   console.log('🔍 Payment callback processing started');
   console.log('🔍 Server action: Verifying payment for reference:', reference);
   console.log('🔍 Server action: API response:', { status: response.status, data });
   ```

2. **Backend Logs**
   - Payment verification requests
   - Webhook notifications
   - Database updates
   - Error messages

3. **Paystack Dashboard**
   - Transaction logs
   - Webhook delivery status
   - Failed webhook attempts

### **Common Issues and Solutions**

#### **Issue: Callback URL Not Working**
**Symptoms**: Users not redirected after payment
**Solutions**:
- Verify callback URL is correctly set in Paystack dashboard
- Check if URL is accessible (not returning 404)
- Ensure HTTPS is working
- Check for CORS issues

#### **Issue: Payment Verification Failing**
**Symptoms**: Payment shows as pending or failed
**Solutions**:
- Check backend API endpoint is working
- Verify payment reference format
- Check authentication headers
- Review error logs for specific error messages

#### **Issue: Webhook Not Receiving Notifications**
**Symptoms**: Payments not updating in database
**Solutions**:
- Verify webhook URL is accessible
- Check webhook signature validation
- Ensure webhook endpoint returns 200 status
- Check firewall/security settings

## 📋 **Step 4: Testing Commands**

### **Development Testing**

```bash
# Start backend server
cd backend
npm start

# Start frontend
cd frontend
npm run dev

# Test payment verification endpoint
curl -X GET "http://localhost:5001/api/v1/verify-payment?reference=test_ref_123" \
  -H "Content-Type: application/json"
```

### **Production Testing**

```bash
# Test callback URL accessibility
curl -I https://yourdomain.com/payment/callback

# Test webhook endpoint
curl -X POST https://unlimitedata.onrender.com/api/v1/paystack/webhook \
  -H "Content-Type: application/json" \
  -d '{"event":"charge.success","data":{"reference":"test_ref_123"}}'
```

## 🚨 **Step 5: Go-Live Checklist**

Before going live, ensure:

- [ ] Paystack live keys are configured
- [ ] Callback URL is set to production domain
- [ ] Webhook URL is accessible
- [ ] SSL certificate is valid
- [ ] Error monitoring is set up
- [ ] Database backups are configured
- [ ] Support team is notified
- [ ] Rollback plan is ready

## 📞 **Support Contacts**

If you encounter issues:

1. **Paystack Support**: [support@paystack.com](mailto:support@paystack.com)
2. **Technical Issues**: Check error logs and monitoring
3. **Business Issues**: Contact your account manager

## 🔄 **Step 6: Post-Launch Monitoring**

After going live:

1. **Monitor for 24-48 hours**
   - Check payment success rates
   - Monitor error logs
   - Verify webhook deliveries
   - Check user feedback

2. **Set up alerts**
   - Payment verification failures
   - Webhook delivery failures
   - High error rates
   - Performance issues

3. **Regular maintenance**
   - Review error logs weekly
   - Update dependencies monthly
   - Test payment flow quarterly
   - Review security settings annually
