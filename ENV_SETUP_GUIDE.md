# Environment Variables Setup Guide

This document outlines all required environment variables for the UnlimitedData GH application.

## Server Environment Variables

Create a `.env` file in the `/server` directory with the following variables:

### Database Configuration
```env
# MongoDB Connection
MONGODB_USERNAME=your_mongodb_username
MONGODB_PASSWORD=your_mongodb_password
MONGODB_CLUSTER=your_cluster_url.mongodb.net
```

### Authentication & Security
```env
# JWT Secret Keys
JWT_SECRET_VERIFYNOW=your_very_secure_random_string_here
JWT_SECRET=your_jwt_secret_key

# Session Secret
SESSION_SECRET=your_session_secret
```

### Email Service (for transaction receipts & 2FA)
```env
# SMTP Configuration (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password
SUPPORT_EMAIL=support@unlimiteddata.gh
```

**Note:** For Gmail, you need to:
1. Enable 2-factor authentication on your Google account
2. Generate an "App Password" specifically for this application
3. Use the app password (not your regular Gmail password)

### Application URLs
```env
# Client URL
CLIENT_URL=http://localhost:3000

# Server URL
SERVER_URL=http://localhost:5001
```

### Payment Integration
```env
# Paystack API Keys
PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key
```

### API Keys & External Services
```env
# Hubtel/SMS Service
HUBTEL_CLIENT_ID=your_hubtel_client_id
HUBTEL_CLIENT_SECRET=your_hubtel_client_secret

# Other third-party APIs
EXTERNAL_API_KEY=your_external_api_key
```

### Server Configuration
```env
# Port
PORT=5001

# Environment
NODE_ENV=development  # Change to 'production' in production
```

---

## Client Environment Variables

Create a `.env.local` file in the `/Client` directory with the following variables:

### API Configuration
```env
# API Base URL
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

### Site Configuration
```env
# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Site Name
NEXT_PUBLIC_SITE_NAME=UnlimitedData GH
```

### Analytics
```env
# Google Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Google Search Console Verification
NEXT_PUBLIC_GOOGLE_VERIFICATION=your_verification_code
```

### Payment (Client-side)
```env
# Paystack Public Key (same as server)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key
```

### Feature Flags
```env
# Enable/Disable features
NEXT_PUBLIC_ENABLE_2FA=true
NEXT_PUBLIC_ENABLE_WALLET=true
NEXT_PUBLIC_ENABLE_REFERRAL=true
NEXT_PUBLIC_ENABLE_PWA=true
```

---

## Security Best Practices

### 1. Never Commit `.env` Files
Add to `.gitignore`:
```gitignore
# Environment variables
.env
.env.local
.env*.local
```

### 2. Use Strong Secrets
Generate secure random strings for JWT secrets:
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Using OpenSSL
openssl rand -hex 64
```

### 3. Different Keys for Different Environments
- Use **different** secrets for development, staging, and production
- Never reuse production keys in development

### 4. Paystack Keys
- Use `pk_test_` and `sk_test_` keys for development
- Switch to `pk_live_` and `sk_live_` keys only in production
- Keep secret keys on the server only, never expose to client

### 5. Email Service
For Gmail:
1. Go to Google Account Settings → Security
2. Enable 2-Factor Authentication
3. Go to "App passwords"
4. Generate a new app password
5. Use this 16-character password in `EMAIL_PASSWORD`

For other email providers:
- Mailgun, SendGrid, AWS SES are production-ready alternatives
- Update `EMAIL_HOST` and `EMAIL_PORT` accordingly

---

## Production Deployment

### Vercel (Client)
1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add all `NEXT_PUBLIC_*` variables
4. Redeploy your application

### Railway/Heroku/DigitalOcean (Server)
1. Access your deployment platform's dashboard
2. Navigate to environment variables section
3. Add all server environment variables
4. Set `NODE_ENV=production`
5. Restart your application

### Environment-Specific Variables
```env
# Development
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Production
NODE_ENV=production
CLIENT_URL=https://www.unlimiteddata.gh
```

---

## Testing Your Setup

### Server
```bash
cd server
node -e "require('dotenv').config(); console.log('MongoDB User:', process.env.MONGODB_USERNAME); console.log('Email configured:', !!process.env.EMAIL_USER);"
```

### Client
```bash
cd Client
node -e "require('dotenv').config({ path: '.env.local' }); console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);"
```

---

## Common Issues

### Issue: "Cannot find module 'dotenv'"
**Solution:** Install dotenv
```bash
npm install dotenv
```

### Issue: Email not sending
**Solution:**
- Verify SMTP credentials
- Check if 2FA is enabled on Gmail
- Ensure app password is used (not regular password)
- Check firewall/port 587 is open

### Issue: "Invalid JWT token"
**Solution:**
- Ensure client and server use the same JWT secret
- Verify secret is loaded correctly: `console.log(process.env.JWT_SECRET)`

### Issue: MongoDB connection failed
**Solution:**
- Verify username, password, and cluster URL
- Check MongoDB Atlas IP whitelist (add 0.0.0.0/0 for development)
- Ensure network access is configured

---

## Example `.env` Files

### Server `.env` (Example)
```env
# Database
MONGODB_USERNAME=unlimiteddata_admin
MONGODB_PASSWORD=SuperSecure123!
MONGODB_CLUSTER=cluster0.abc123.mongodb.net

# Auth
JWT_SECRET_VERIFYNOW=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
JWT_SECRET=DatAmArt

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=noreply@unlimiteddata.gh
EMAIL_PASSWORD=abcd efgh ijkl mnop
SUPPORT_EMAIL=support@unlimiteddata.gh

# URLs
CLIENT_URL=http://localhost:3000
SERVER_URL=http://localhost:5001

# Payment
PAYSTACK_SECRET_KEY=sk_test_abc123xyz789
PAYSTACK_PUBLIC_KEY=pk_test_abc123xyz789

# Config
PORT=5001
NODE_ENV=development
```

### Client `.env.local` (Example)
```env
# API
NEXT_PUBLIC_API_URL=http://localhost:5001/api

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=UnlimitedData GH

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GOOGLE_VERIFICATION=abc123xyz789

# Payment
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_abc123xyz789

# Features
NEXT_PUBLIC_ENABLE_2FA=true
NEXT_PUBLIC_ENABLE_WALLET=true
NEXT_PUBLIC_ENABLE_REFERRAL=true
NEXT_PUBLIC_ENABLE_PWA=true
```

---

## Next Steps

1. **Copy example files:**
   ```bash
   # Server
   cd server
   cp .env.example .env  # Edit with your values
   
   # Client
   cd Client
   cp .env.local.example .env.local  # Edit with your values
   ```

2. **Verify configuration:**
   ```bash
   # Start server
   cd server && npm start
   
   # Start client (in new terminal)
   cd Client && npm run dev
   ```

3. **Test features:**
   - Email receipts
   - 2FA authentication
   - Wallet transactions
   - Referral system
   - PWA installation

---

## Support

If you encounter issues with environment configuration:
- Check the console for specific error messages
- Verify all required variables are set
- Ensure no typos in variable names
- Contact: support@unlimiteddata.gh

