# Paystack Security & Fraud Prevention Guide

## 🛡️ Security Measures Implemented

### 1. **Rate Limiting**
✅ **Max 5 requests per minute** per IP address
✅ Prevents brute force attacks
✅ Automatic 429 response with retry-after header
✅ Separate tracking per IP

**How it works:**
- Tracks requests per IP in sliding window
- Blocks excessive requests automatically
- Returns remaining time until allowed

### 2. **Webhook Signature Verification**
✅ **HMAC SHA-512** signature validation
✅ Prevents fake webhook calls
✅ Rejects unauthorized requests
✅ Logs all verification attempts

**Security:**
```javascript
hash = HMAC-SHA512(webhook_body, secret_key)
if (hash !== x-paystack-signature) → REJECT
```

### 3. **Amount Validation**
✅ **Minimum deposit**: GHS 5
✅ **Maximum deposit**: GHS 10,000
✅ **Fee validation**: Prevents manipulation
✅ **Format check**: Only valid numbers

**Prevents:**
- Negative amounts
- Extremely large amounts
- Invalid number formats
- Fee tampering

### 4. **Duplicate Prevention**
✅ **5-minute cooldown** between deposits
✅ Checks for pending transactions
✅ Prevents spam/DOS attacks
✅ User-specific tracking

**Logic:**
- User can't initiate new deposit if one is pending
- Must wait 5 minutes between attempts
- Prevents accidental double-charges

### 5. **Transaction Locking**
✅ **Processing flag** prevents double-processing
✅ **Atomic updates** using findOneAndUpdate
✅ **Race condition prevention**
✅ **Automatic lock release** on error

**How it works:**
```javascript
1. Check if transaction.processing !== true
2. Set processing = true (atomically)
3. Process payment
4. Release lock when done
```

### 6. **IP Blocking System**
✅ **Tracks suspicious activities**
✅ **10 strikes** then automatic block
✅ **1-hour block duration**
✅ **24-hour activity history**

**Triggers:**
- Rate limit exceeded
- Invalid webhook signatures
- Fee manipulation attempts
- Large deposit attempts (>10k)
- Invalid reference formats
- Injection attempts

### 7. **Input Sanitization**
✅ **XSS prevention**
✅ **SQL injection prevention**
✅ **Script tag detection**
✅ **Malicious code filtering**

**Blocked Patterns:**
- `<script>`
- `javascript:`
- `on*=` (event handlers)
- `${}` (template literals)
- Encoded attacks

### 8. **Audit Logging**
✅ **Full activity trail**
✅ **Timestamp tracking**
✅ **IP logging**
✅ **User agent logging**
✅ **Action logging**

**Logged Actions:**
- DEPOSIT_INITIATED
- PAYSTACK_WEBHOOK
- PAYMENT_VERIFICATION
- PAYMENT_PROCESSED
- WALLET_UPDATED

---

## 🔒 Security Layers

```
Layer 1: IP Blocking (Blocked IPs can't proceed)
   ↓
Layer 2: Rate Limiting (Max 5 req/min)
   ↓
Layer 3: Input Sanitization (No malicious input)
   ↓
Layer 4: Amount Validation (Min/Max limits)
   ↓
Layer 5: Duplicate Prevention (5-min cooldown)
   ↓
Layer 6: Webhook Signature (HMAC verification)
   ↓
Layer 7: Transaction Locking (No double-processing)
   ↓
Layer 8: Audit Logging (Full trail)
```

---

## 🚨 Attack Prevention

### **1. DOS (Denial of Service)**
**Attack**: Flood server with requests

**Prevention:**
- ✅ Rate limiting (5 req/min)
- ✅ IP blocking after threshold
- ✅ Request validation
- ✅ Automatic blocking for 1 hour

### **2. Fraud Attempts**
**Attack**: Fake webhook calls to credit accounts

**Prevention:**
- ✅ Webhook signature verification
- ✅ Only Paystack-signed requests accepted
- ✅ Invalid signatures logged and tracked
- ✅ IP blocked after 10 failed attempts

### **3. Amount Manipulation**
**Attack**: Tamper with deposit amount or fees

**Prevention:**
- ✅ Server-side validation
- ✅ Min/max limits enforced
- ✅ Fee calculation verification
- ✅ Suspicious amounts flagged

### **4. Double-Spending**
**Attack**: Process same transaction multiple times

**Prevention:**
- ✅ Transaction locking mechanism
- ✅ Atomic database updates
- ✅ Status check before processing
- ✅ Processing flag prevents race conditions

### **5. Injection Attacks**
**Attack**: SQL injection, XSS, code injection

**Prevention:**
- ✅ Input sanitization
- ✅ Dangerous pattern detection
- ✅ Parameterized queries (Mongoose)
- ✅ Output encoding

---

## 📊 Monitoring & Alerts

### **Suspicious Activity Tracking:**

```javascript
{
  "192.168.1.100": {
    "count": 5,
    "activities": [
      {
        "type": "rate_limit_exceeded",
        "timestamp": "2024-01-15T10:30:00Z"
      },
      {
        "type": "invalid_webhook_signature",
        "timestamp": "2024-01-15T10:31:00Z"
      }
    ],
    "blockedUntil": 1705318200000
  }
}
```

### **When to Alert Admin:**

🚨 **Immediate Alert:**
- 5+ failed webhook verifications from same IP
- Large deposit attempt (>10k GHS)
- Multiple duplicate attempts
- IP reached block threshold

⚠️ **Warning Alert:**
- Rate limit hit 3 times
- Fee manipulation detected
- Invalid reference format

---

## 🔍 Security Logs

### **Console Output Examples:**

**Normal Activity:**
```
[SECURITY] ✅ Deposit amount validated: GHS 50
[AUDIT] DEPOSIT_INITIATED: {"ip":"192.168.1.1","userId":"123"}
[SECURITY] ✅ Paystack webhook signature verified
[PAYMENT] ✅ User wallet updated successfully!
```

**Suspicious Activity:**
```
[SECURITY] ⚠️ Rate limit exceeded for IP: 192.168.1.100
[SECURITY] ❌ Invalid Paystack webhook signature
[SECURITY] ⚠️ Fee manipulation attempt detected
[SECURITY] ⛔ IP 192.168.1.100 BLOCKED for 60 minutes
```

---

## 🎯 Best Practices

### **1. Environment Variables**
✅ Never commit API keys
✅ Use different keys for dev/prod
✅ Rotate keys regularly
✅ Monitor key usage

### **2. Paystack Dashboard**
✅ Enable webhook URL
✅ Whitelist callback URLs
✅ Monitor transaction patterns
✅ Set up email alerts

### **3. Database**
✅ Regular backups
✅ Monitor for anomalies
✅ Index optimization
✅ Query performance monitoring

### **4. Server**
✅ HTTPS only (production)
✅ Firewall rules
✅ DDoS protection (Cloudflare)
✅ Regular updates

---

## 🧪 Testing Security

### **Test Rate Limiting:**
```bash
# Send 6 requests in < 1 minute
# 6th request should be blocked with 429
for i in {1..6}; do
  curl -X POST http://localhost:5000/api/v1/deposit \
    -H "Content-Type: application/json" \
    -d '{"userId":"test","amount":10}'
  sleep 2
done
```

### **Test Amount Validation:**
```bash
# Should be rejected (too low)
curl -X POST http://localhost:5000/api/v1/deposit \
  -d '{"userId":"test","amount":1}'

# Should be rejected (too high)
curl -X POST http://localhost:5000/api/v1/deposit \
  -d '{"userId":"test","amount":20000}'
```

### **Test Duplicate Prevention:**
```bash
# Create pending transaction
# Try another within 5 minutes
# Should be rejected
```

---

## 📋 Security Checklist

### **Before Production:**
- [ ] All security middlewares active
- [ ] Paystack webhook URL configured
- [ ] HTTPS enabled
- [ ] Environment variables set
- [ ] Rate limits configured
- [ ] IP blocking tested
- [ ] Audit logs working
- [ ] Monitoring alerts set up

### **After Deployment:**
- [ ] Test payment flow
- [ ] Verify webhook signature
- [ ] Check rate limiting
- [ ] Monitor suspicious activity logs
- [ ] Review blocked IPs daily
- [ ] Analyze audit trails weekly

---

## 🎊 Security Summary

**Protection Against:**
- ✅ DOS Attacks (Rate limiting)
- ✅ Fake Webhooks (Signature verification)
- ✅ Amount Fraud (Validation)
- ✅ Double-Spending (Transaction locking)
- ✅ Duplicate Requests (Cooldown period)
- ✅ Injection Attacks (Input sanitization)
- ✅ Brute Force (IP blocking)

**Monitoring:**
- ✅ Comprehensive logging
- ✅ Suspicious activity tracking
- ✅ Audit trail
- ✅ Real-time alerts

**The payment system is now enterprise-grade secure! 🔒**
