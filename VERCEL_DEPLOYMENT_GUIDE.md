# Vercel Deployment Guide for Senyo Frontend

## Overview
This guide will help you deploy the Senyo frontend to Vercel and connect it to your existing backend at https://unlimitedata.onrender.com.

## Prerequisites
- Backend already deployed on Render: https://unlimitedata.onrender.com
- Domain name ready for configuration
- Vercel account (free tier available)

## Step 1: Deploy Frontend to Vercel

### Option A: Using the Deployment Script
```bash
cd /Users/samtech/Senyo1/senyo
./deploy-to-vercel.sh
```

### Option B: Manual Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Navigate to frontend directory
cd Client

# Deploy to production
vercel --prod
```

## Step 2: Configure Environment Variables

In Vercel dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add these variables:

```
NEXT_PUBLIC_API_URL=https://unlimitedata.onrender.com
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## Step 3: Configure Custom Domain

### In Vercel Dashboard:
1. Go to your project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Copy the DNS configuration instructions

### At Your Domain Registrar:
Add these DNS records:

**For Root Domain (your-domain.com):**
```
Type: A
Name: @
Value: 76.76.19.19

Type: A
Name: @
Value: 76.76.19.61
```

**For WWW Subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

## Step 4: Update Backend CORS (on Render)

After getting your Vercel URL, update the backend CORS configuration:

1. Go to your Render dashboard
2. Navigate to your backend service
3. Go to "Environment" tab
4. Add/update these variables:

```
FRONTEND_URL=https://your-domain.com
```

5. Redeploy the backend service

## Step 5: Test Deployment

Test these endpoints:
- `https://your-domain.com` - Frontend homepage
- `https://unlimitedata.onrender.com/api/health` - Backend health check
- `https://your-domain.com/login` - Login functionality
- `https://your-domain.com/admin-users` - Admin dashboard

## Configuration Files Updated

The following files have been updated for production deployment:

### Client/vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "NEXT_PUBLIC_API_URL": "https://unlimitedata.onrender.com"
  }
}
```

### Client/next.config.mjs
```javascript
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: false,
  experimental: {
    optimizeCss: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://unlimitedata.onrender.com',
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com',
  }
};
```

### Client/utils/adminApi.js
Updated to use production backend instead of localhost.

### Client/.vercelignore
Created to exclude unnecessary files from deployment.

## Troubleshooting

### Common Issues:

1. **CORS Errors**
   - Ensure backend CORS includes your Vercel domain
   - Check that FRONTEND_URL is set correctly on Render

2. **Environment Variables Not Working**
   - Verify variables are set in Vercel dashboard
   - Redeploy after adding new variables

3. **Domain Not Working**
   - Check DNS propagation (can take up to 24 hours)
   - Verify DNS records are correct
   - Ensure domain is verified in Vercel

4. **API Calls Failing**
   - Check that NEXT_PUBLIC_API_URL is correct
   - Verify backend is running on Render
   - Check browser console for errors

## Security Considerations

- Use HTTPS for all URLs
- Keep API keys secure
- Enable Vercel's security headers
- Consider upgrading to Vercel Pro for better performance

## Monitoring

- Monitor Vercel analytics for performance
- Set up error tracking
- Monitor Render backend logs
- Use Vercel's built-in monitoring tools

## Next Steps

After successful deployment:
1. Set up monitoring and alerts
2. Configure backup strategies
3. Plan for scaling
4. Consider upgrading to paid plans for better performance
5. Set up CI/CD for automatic deployments

## Support

If you encounter issues:
1. Check Vercel documentation
2. Review Render logs
3. Test locally first
4. Contact support if needed
