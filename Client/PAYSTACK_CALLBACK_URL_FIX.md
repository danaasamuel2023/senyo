# 🔧 Paystack Callback URL Fix Guide

## 🚨 **Current Issue:**
The payment callback URL is pointing to the backend (`https://unlimitedata.onrender.com/payment/callback`) which doesn't exist, causing 404 errors.

## ✅ **Solution:**
Update the Paystack Dashboard to point the callback URL to your **frontend** instead of the backend.

## 📋 **Step-by-Step Fix:**

### **1. Login to Paystack Dashboard**
- Go to [https://dashboard.paystack.com](https://dashboard.paystack.com)
- Sign in with your merchant account

### **2. Navigate to Settings**
- Click on **Settings** in the left sidebar
- Select **Webhooks** from the settings menu

### **3. Update Callback URL**
**Current (Wrong):** `https://unlimitedata.onrender.com/payment/callback`
**New (Correct):** `https://your-frontend-domain.com/payment/callback`

### **4. For Different Environments:**

#### **Development:**
```
Callback URL: http://localhost:3000/payment/callback
```

#### **Production (Vercel):**
```
Callback URL: https://unlimitedatagh-e2i3338tb-danaasamuel2023s-projects.vercel.app/payment/callback
```

#### **Production (Custom Domain):**
```
Callback URL: https://unlimitedatagh.com/payment/callback
```

### **5. Keep Webhook URL as Backend**
**Webhook URL:** `https://unlimitedata.onrender.com/api/v1/paystack/webhook`

## 🔍 **Why This Fixes the Issue:**

1. **Frontend Callback Route:** `/payment/callback` exists in your Next.js app
2. **Internal API Route:** `/api/payment/callback` handles verification
3. **Wallet Updates:** Frontend updates user balance in localStorage
4. **User Experience:** Users see success message and get redirected

## 🧪 **Testing the Fix:**

### **1. Test Callback URL Directly:**
```bash
# Development
curl "http://localhost:3000/payment/callback?reference=test123&source=unlimitedata"

# Production
curl "https://your-domain.com/payment/callback?reference=test123&source=unlimitedata"
```

### **2. Expected Response:**
- ✅ 200 status code
- ✅ Success message
- ✅ Wallet balance updated
- ✅ Redirect to dashboard

## 📊 **Current Payment Flow:**

```
1. User completes payment on Paystack
2. Paystack redirects to: https://your-frontend-domain.com/payment/callback?reference=...
3. Frontend loads PaymentCallbackClient component
4. Component calls internal API: /api/payment/callback
5. API simulates payment verification
6. Frontend updates wallet balance in localStorage
7. User sees success message
8. User gets redirected to dashboard after 2 seconds
```

## 🚀 **After Making the Change:**

1. **Save** the configuration in Paystack Dashboard
2. **Test** with a real payment
3. **Verify** the callback works without 404 errors
4. **Confirm** wallet balance updates correctly

## ⚠️ **Important Notes:**

- **Callback URL** = Where users are redirected after payment (frontend)
- **Webhook URL** = Where Paystack sends payment notifications (backend)
- Both URLs must be **HTTPS** in production
- Test with **Paystack test keys** first

## 🎯 **Result:**
After updating the callback URL, users will:
- ✅ Not see 404 errors
- ✅ See payment success message
- ✅ Have wallet balance updated
- ✅ Get redirected to dashboard
- ✅ Complete the payment flow successfully
