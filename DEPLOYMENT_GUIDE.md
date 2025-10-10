# Production Deployment Guide

## Backend Environment Variables (Render.com)

### Required Environment Variables
Update these in your Render.com dashboard under "Environment":

```bash
# Server Configuration
NODE_ENV=production
PORT=3000

# Database Configuration (usually auto-provided by Render)
MONGODB_URI=mongodb+srv://dajounimarket:0246783840Sa@cluster0.kp8c2.mongodb.net/unlimiteddata?retryWrites=true&w=majority&appName=Cluster0

# JWT Configuration
JWT_SECRET=DatAmArt_Production_Secure_Key_2024

# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_live_0fba72fb9c4fc71200d2e0cdbb4f2b37c1de396c
PAYSTACK_PUBLIC_KEY=pk_live_6c2f71cb00f87a32fb593bc0c679cfd28f5ab2d

# Frontend URLs
FRONTEND_URL=https://senyo-frontend.vercel.app
SERVER_URL=https://unlimitedata.onrender.com

# Support Configuration
SUPPORT_EMAIL=Unlimiteddatagh@gmail.com
SUPPORT_PHONE=+233256702995
WHATSAPP_GROUP=https://chat.whatsapp.com/LEfSM2A3RVKJ1yY8JB5osP

# Email Configuration
EMAIL_USER=Unlimiteddatagh@gmail.com
EMAIL_PASS=Kingfred4190$

# Security Configuration
ENABLE_RATE_LIMITING=true
ENABLE_SECURITY_HEADERS=true
ENABLE_CORS=true
```

### How to Update Environment Variables on Render.com

1. **Log into Render.com Dashboard**
2. **Navigate to your backend service** (unlimitedata.onrender.com)
3. **Go to "Environment" tab**
4. **Add/Update the variables** listed above
5. **Save changes** - this will trigger a redeploy
6. **Wait for deployment** to complete (usually 2-3 minutes)

## Frontend Deployment (Vercel)

### Current Status
- ✅ Backend is working with authentication middleware
- ❌ Frontend needs to be deployed to Vercel
- ❌ Frontend URL needs to be updated in backend environment variables

### Steps to Deploy Frontend

1. **Deploy to Vercel:**
   ```bash
   cd Client
   npx vercel --prod --yes
   ```

2. **Get the deployment URL** from Vercel dashboard

3. **Update backend environment variable:**
   - Go to Render.com dashboard
   - Update `FRONTEND_URL` with the new Vercel URL
   - Save to trigger redeploy

### Alternative Frontend URLs
If the main Vercel deployment fails, try these alternatives:
- `https://senyo-frontend-gr8zusaid-danaasamuel2023s-projects.vercel.app`
- `https://unlimiteddatagh.com`
- `https://www.unlimiteddatagh.com`

## Verification Steps

### 1. Test Backend Authentication
```bash
curl "https://unlimitedata.onrender.com/api/v1/data/purchase-history/test-user-id"
# Should return: {"success":false,"message":"No token provided, authorization denied","error":"Authentication required"}
```

### 2. Test Frontend
- Visit the deployed frontend URL
- Navigate to `/orders` page
- Should load without 404 errors

### 3. Test Full Integration
- Login to frontend
- Navigate to orders page
- Should display purchase history or proper authentication error

## Current Issues Resolved

✅ **Authentication Middleware**: Added to `/api/v1/data/purchase-history/:userId` endpoint
✅ **Server Crashes**: Fixed by adding cookie-parser middleware
✅ **Local Development**: Working correctly
✅ **Production Backend**: Authentication working correctly

## Remaining Tasks

❌ **Frontend Deployment**: Deploy to Vercel
❌ **Environment Variables**: Update FRONTEND_URL in production
❌ **CORS Configuration**: Verify frontend URL is in allowed origins
❌ **End-to-End Testing**: Test complete user flow

## Troubleshooting

### If Frontend Shows 404 Errors
1. Check if frontend is deployed to Vercel
2. Verify FRONTEND_URL in backend environment variables
3. Check CORS configuration includes the frontend URL
4. Test backend authentication endpoint directly

### If Authentication Still Fails
1. Verify JWT_SECRET is set in production
2. Check if authentication middleware is applied to the route
3. Test with valid authentication token

### If CORS Errors Occur
1. Add frontend URL to allowed origins in server/index.js
2. Update FRONTEND_URL environment variable
3. Redeploy backend after changes
