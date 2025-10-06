# 🚀 Quick Start Guide - UnlimitedData GH v2.0

## What's New?

Your site now has **8 major new features** that make it market-leading:

1. ✅ **API Rate Limiting** - DDoS protection
2. ✅ **Email Receipts** - Professional transaction emails
3. ✅ **PWA** - Installable mobile app
4. ✅ **Digital Wallet** - Fast checkout
5. ✅ **Referral System** - Viral growth
6. ✅ **Promo Codes** - Marketing campaigns
7. ✅ **2FA** - Enhanced security
8. ✅ **Enhanced Docs** - Complete guides

---

## ⚡ 3-Minute Setup

### Step 1: Install New Dependencies
```bash
# Server
cd server
npm install

# Client
cd Client
npm install
```

### Step 2: Update Environment Variables

**Server `.env`** (add these new variables):
```env
# Email Service (Required for receipts & 2FA)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
SUPPORT_EMAIL=support@unlimiteddata.gh

# Already have these (just verify)
MONGODB_USERNAME=your_username
MONGODB_PASSWORD=your_password
JWT_SECRET_VERIFYNOW=your_secret
CLIENT_URL=http://localhost:3000
```

**Client `.env.local`** (no changes needed, but verify):
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Step 3: Start Servers
```bash
# Terminal 1 - Server
cd server
PORT=5001 npm start

# Terminal 2 - Client
cd Client  
PORT=3000 npm run dev
```

### Step 4: Test!
Visit: http://localhost:3000

---

## 🎯 How to Use New Features

### For Users

#### 1. **Wallet** (Faster Checkout)
1. Sign up/Login
2. Go to Profile → Wallet
3. Add funds via Paystack
4. Use wallet for purchases (no card needed!)

#### 2. **Referrals** (Earn GHS 5 per friend)
1. Dashboard → Referral Code
2. Copy your unique link
3. Share with friends
4. Earn 10% of their first purchase (max GHS 5)
5. Money goes to your wallet!

#### 3. **Promo Codes** (Discounts)
1. At checkout, enter promo code
2. Click "Apply"
3. See discount instantly
4. Pay reduced amount

#### 4. **2FA** (Extra Security)
1. Settings → Security
2. Enable 2FA (Email or App)
3. Get 10 backup codes (save them!)
4. Next login requires code

#### 5. **PWA** (Install App)
1. Browse site for 30 seconds
2. Click "Install" prompt
3. App appears on home screen
4. Works offline!

### For Admins

#### 1. **Create Promo Codes**
```http
POST /api/promo/create
Authorization: Bearer {admin_token}

{
  "code": "WELCOME20",
  "description": "20% off first purchase",
  "discountType": "percentage",
  "discountValue": 20,
  "minPurchase": 5,
  "maxDiscount": 20,
  "usageLimit": 100,
  "perUserLimit": 1,
  "validFrom": "2025-01-01",
  "validUntil": "2025-12-31",
  "applicableNetworks": ["ALL"]
}
```

#### 2. **View Promo Stats**
```http
GET /api/promo/all?active=true
Authorization: Bearer {admin_token}
```

#### 3. **Monitor Referrals**
Check MongoDB `referrals` collection for analytics

#### 4. **Freeze/Unfreeze Wallets**
Access wallet records in MongoDB and set `frozen: true/false`

---

## 📧 Email Setup (CRITICAL)

### Gmail Setup (Recommended)
1. **Enable 2-Factor Authentication**
   - Go to Google Account → Security
   - Enable 2-Step Verification

2. **Generate App Password**
   - Security → 2-Step Verification
   - Scroll to "App passwords"
   - Select "Mail" and "Other (Custom name)"
   - Copy the 16-character password

3. **Add to `.env`**
   ```env
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=abcd efgh ijkl mnop  # App password
   ```

### Alternative Email Services
- **SendGrid**: Better for production (20k emails/month free)
- **Mailgun**: Good for transactional emails
- **AWS SES**: Cheapest for high volume

---

## 🧪 Testing Checklist

### Test 1: Email Receipts
```bash
# Make a test purchase
# Check email for receipt
# Should arrive within 30 seconds
```

### Test 2: Wallet
```bash
# Add GHS 10 to wallet
# Make GHS 5 purchase
# Check balance = GHS 5
# View transaction history
```

### Test 3: Referrals
```bash
# Get referral code
# Sign up new user with code
# New user makes purchase
# Check wallet for bonus
```

### Test 4: Promo Codes
```bash
# Create promo: NEWYEAR2025 (20% off)
# Apply at checkout
# Verify discount applied
```

### Test 5: 2FA
```bash
# Enable 2FA
# Logout
# Login again
# Enter code from email
```

### Test 6: PWA
```bash
# Open in Chrome
# DevTools → Application → Manifest
# Check service worker registered
# Click "Install" prompt
```

---

## 📊 Quick API Reference

### Wallet
```javascript
GET  /api/wallet/balance          // Get balance
GET  /api/wallet/transactions     // Transaction history
POST /api/wallet/add-funds        // Add money
POST /api/wallet/deduct           // Pay from wallet
```

### Referrals
```javascript
GET  /api/referral/my-code        // Get my referral code
GET  /api/referral/history        // My referrals
POST /api/referral/validate-code  // Check if valid
```

### Promo Codes (Admin)
```javascript
POST /api/promo/create            // Create code
GET  /api/promo/all               // List codes
GET  /api/promo/:id/stats         // Code statistics
```

### 2FA
```javascript
POST /api/2fa/enable-email        // Enable email 2FA
POST /api/2fa/send-code           // Send code
POST /api/2fa/verify-code         // Verify code
```

---

## 🚨 Troubleshooting

### Email Not Sending
```bash
# Check .env file
cat server/.env | grep EMAIL

# Test SMTP connection
node -e "require('nodemailer').createTransport({host:'smtp.gmail.com',port:587,auth:{user:process.env.EMAIL_USER,pass:process.env.EMAIL_PASSWORD}}).verify(console.log)"

# Check server logs
cd server && npm start  # Look for email errors
```

### Wallet Balance Wrong
```bash
# Check MongoDB
mongo "your_connection_string"
use your_database
db.wallets.find({userId: ObjectId("user_id")})

# Verify transactions
db.wallets.aggregate([
  {$unwind: "$transactions"},
  {$group: {_id: null, total: {$sum: "$transactions.amount"}}}
])
```

### PWA Not Installing
```bash
# Must use HTTPS or localhost
# Check manifest
curl http://localhost:3000/manifest.json

# Check service worker
# Chrome DevTools → Application → Service Workers
```

### 2FA Code Not Received
```bash
# Check spam folder
# Verify email configuration
# Check rate limiting (max 5 codes/15 min)
# Try "Resend Code"
```

---

## 🎓 Full Documentation

- **NEW_FEATURES_GUIDE.md** - Complete feature documentation
- **ENV_SETUP_GUIDE.md** - Environment variables setup
- **IMPLEMENTATION_SUMMARY.md** - Technical implementation details

---

## 📈 Monitor Your Success

### Daily Checks
- Email delivery rate (should be > 95%)
- Wallet transaction accuracy
- Referral bonus awards
- API response times

### Weekly Reviews
- Promo code performance
- Referral conversion rates
- 2FA adoption rate
- PWA install rate
- Security logs

### Monthly Analysis
- Revenue increase from wallet
- New user acquisition via referrals
- Average order value with promos
- Customer satisfaction scores

---

## 💰 Revenue Optimization Tips

### 1. Promo Codes Strategy
```javascript
// First-time users
CREATE CODE: WELCOME10 (10% off, min GHS 5)

// Inactive users (monthly)
CREATE CODE: COMEBACK20 (20% off, expires in 7 days)

// Bulk purchases
CREATE CODE: BULK50 (GHS 50 off min GHS 500)

// Referral bonus boost
CREATE CODE: REFER5 (GHS 5 bonus for each referral)
```

### 2. Referral Campaign
```javascript
// Announce: "Refer 10 friends, earn GHS 50!"
// Post on social media
// Send email to all users
// Track via /api/referral/history
```

### 3. Wallet Incentive
```javascript
// "Add GHS 100, get GHS 10 bonus!"
// Encourage wallet usage
// Faster repeat purchases
// Higher customer lifetime value
```

### 4. Email Marketing
```javascript
// Weekly newsletter (via nodemailer)
// Promo code announcements
// New package alerts
// Referral reminders
```

---

## 🔒 Security Best Practices

### Production Checklist
- [ ] Change all default passwords
- [ ] Use strong JWT secrets (64+ characters)
- [ ] Enable HTTPS
- [ ] Set NODE_ENV=production
- [ ] Different keys for dev/prod
- [ ] Regular security audits
- [ ] Monitor failed login attempts
- [ ] Regular database backups

### User Education
- Encourage 2FA adoption
- Warn about phishing
- Secure password requirements
- Referral link safety
- Wallet balance monitoring

---

## 🎉 You're Ready!

Your site now has enterprise-level features that put you ahead of the competition. The combination of wallet, referrals, promos, and PWA will drive significant growth.

### Next Steps
1. Set up email service (most important!)
2. Test all features locally
3. Deploy to production
4. Create your first promo codes
5. Announce new features to users
6. Monitor analytics
7. Iterate based on data

### Need Help?
- Email: support@unlimiteddata.gh
- Check logs: `cd server && npm start`
- Review docs: Read the 3 comprehensive guides

---

**Good luck dominating the market! 🚀**

**Version:** 2.0.0  
**Last Updated:** January 2025

