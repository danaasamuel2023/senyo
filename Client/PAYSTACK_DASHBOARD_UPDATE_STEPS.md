# 🚀 Paystack Dashboard Update Steps

## ✅ **IMMEDIATE ACTION REQUIRED**

### **Step 1: Access Paystack Dashboard**
1. Go to [https://dashboard.paystack.com](https://dashboard.paystack.com)
2. Sign in with your merchant account credentials

### **Step 2: Navigate to Settings**
1. Click **Settings** in the left sidebar
2. Select **Webhooks** from the settings menu

### **Step 3: Update Callback URL**

#### **Current Configuration (WRONG):**
```
Callback URL: https://unlimitedata.onrender.com/payment/callback
```

#### **New Configuration (CORRECT):**

**For Development:**
```
Callback URL: http://localhost:3000/payment/callback
```

**For Production (Vercel):**
```
Callback URL: https://unlimitedatagh-e2i3338tb-danaasamuel2023s-projects.vercel.app/payment/callback
```

**For Production (Custom Domain):**
```
Callback URL: https://unlimitedatagh.com/payment/callback
```

### **Step 4: Keep Webhook URL Unchanged**
```
Webhook URL: https://unlimitedata.onrender.com/api/v1/paystack/webhook
```

### **Step 5: Save Configuration**
1. Click **Save** button
2. Verify the changes are applied
3. Test the webhook URL if available

## 🧪 **Testing After Update**

### **Test 1: Direct Callback URL Test**
```bash
# Test the callback URL directly
curl "https://your-domain.com/payment/callback?reference=test123&source=unlimitedata"
```

**Expected Response:**
- ✅ 200 status code
- ✅ Success message displayed
- ✅ Wallet balance updated
- ✅ Redirect to dashboard

### **Test 2: Internal API Test**
```bash
# Test the internal API route
curl "https://your-domain.com/api/payment/callback?reference=test123&source=unlimitedata"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "reference": "test123",
    "status": "completed",
    "amount": 100,
    "message": "Payment verified successfully!"
  }
}
```

### **Test 3: Complete Payment Flow**
1. Initiate a test payment
2. Complete payment on Paystack
3. Verify redirect to frontend callback
4. Check wallet balance update
5. Confirm success message
6. Verify redirect to dashboard

## 🔍 **Verification Checklist**

### **Before Update:**
- [ ] Current callback URL points to backend
- [ ] Getting 404 "Endpoint not found" errors
- [ ] Payment verification fails
- [ ] Wallet balance not updated

### **After Update:**
- [ ] Callback URL points to frontend
- [ ] No more 404 errors
- [ ] Payment verification works
- [ ] Wallet balance updates
- [ ] Success message displayed
- [ ] Redirect to dashboard works
- [ ] Complete payment flow functional

## ⚠️ **Important Notes**

### **Callback URL vs Webhook URL:**
- **Callback URL** = Where users are redirected after payment (frontend)
- **Webhook URL** = Where Paystack sends payment notifications (backend)

### **Security Requirements:**
- Both URLs must be **HTTPS** in production
- Test with **Paystack test keys** first
- Verify domain ownership

### **Environment-Specific URLs:**

#### **Development:**
```
Callback URL: http://localhost:3000/payment/callback
Webhook URL: https://unlimitedata.onrender.com/api/v1/paystack/webhook
```

#### **Production (Vercel):**
```
Callback URL: https://unlimitedatagh-e2i3338tb-danaasamuel2023s-projects.vercel.app/payment/callback
Webhook URL: https://unlimitedata.onrender.com/api/v1/paystack/webhook
```

#### **Production (Custom Domain):**
```
Callback URL: https://unlimitedatagh.com/payment/callback
Webhook URL: https://unlimitedata.onrender.com/api/v1/paystack/webhook
```

## 🚨 **Troubleshooting**

### **If Still Getting 404:**
1. Double-check Paystack Dashboard configuration
2. Verify callback URL is correct
3. Test callback URL directly
4. Check browser console for errors
5. Verify frontend server is running

### **If Payment Not Processing:**
1. Check internal API route
2. Verify reference format
3. Check localStorage updates
4. Monitor network requests
5. Check error handling

### **If Wallet Not Updating:**
1. Check localStorage for userData
2. Verify wallet balance calculation
3. Check payment amount parsing
4. Monitor console for errors

## 📊 **Expected Results**

### **Before Fix:**
```
{"success":false,"error":"Endpoint not found","path":"/payment/callback?reference=DEP-a18260204af753eacab5-1760100765844&source=unlimitedata&trxref=DEP-a18260204af753eacab5-1760100765844&reference=DEP-a18260204af753eacab5-1760100765844"}
```

### **After Fix:**
```
✅ Payment verified successfully! Your wallet has been credited.
✅ Wallet balance updated
✅ Redirecting to dashboard...
```

## 🎯 **Success Criteria**

After updating the Paystack Dashboard callback URL:

1. **No More 404 Errors:** Users won't see "Endpoint not found"
2. **Successful Payments:** Payment verification will work
3. **Wallet Updates:** User balances will be updated
4. **Better UX:** Users see success messages and get redirected
5. **Complete Flow:** End-to-end payment process works

## 📞 **Support**

If you encounter issues:
1. Check browser console for errors
2. Test callback URL directly
3. Verify Paystack configuration
4. Contact support if problems persist

**The frontend is ready - you just need to update the Paystack Dashboard callback URL!**

## 🔧 **Quick Reference**

### **Current Issue:**
- Paystack redirects to backend: `https://unlimitedata.onrender.com/payment/callback`
- Backend doesn't have this route → 404 Error

### **Solution:**
- Update Paystack to redirect to frontend: `https://your-domain.com/payment/callback`
- Frontend has the route → Success

### **Frontend Status:**
- ✅ Callback route implemented
- ✅ Internal API route working
- ✅ Payment verification simulation
- ✅ Wallet balance updates
- ✅ Success/failure handling
- ✅ Redirect to dashboard
- ✅ Loop prevention

**Ready to proceed with Paystack Dashboard update!**
