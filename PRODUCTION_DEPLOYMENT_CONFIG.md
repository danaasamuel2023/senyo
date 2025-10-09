# Production Deployment Configuration

## Overview
This document outlines the production deployment configuration for the Senyo project, including backend serverless deployment on Vercel and frontend production environment setup.

## Backend Serverless Deployment (Vercel)

### Configuration Files Created

#### 1. `server/vercel.json`
```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.js"
    }
  ],
  "env": {
    "NODE_ENV": "production",
    "PORT": "3000"
  },
  "functions": {
    "index.js": {
      "maxDuration": 30
    }
  }
}
```

### Environment Variables for Backend
See `server/production-env-template.env` for all required environment variables.

### Deployment Steps
1. Navigate to server directory: `cd server`
2. Install Vercel CLI: `npm install -g vercel`
3. Login to Vercel: `vercel login`
4. Deploy: `vercel --prod`

## Frontend Production Configuration

### Configuration Files Created

#### 1. `Client/production-env-template.env`
Contains all production environment variables for the frontend.

### Environment Variables for Frontend
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_SITE_URL`: Frontend domain URL
- `NEXT_PUBLIC_APP_NAME`: Application name
- `NEXT_PUBLIC_APP_VERSION`: Application version
- `NEXT_PUBLIC_APP_ENVIRONMENT`: Environment (production)

### Deployment Steps
1. Copy `Client/production-env-template.env` to `Client/.env.production`
2. Update values as needed
3. Deploy to Vercel: `vercel --prod`

## CORS Configuration Updates

### Updated `server/index.js`
Added production domains to CORS allowed origins:

```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://unlimitedata.onrender.com',
  'https://www.unlimitedata.onrender.com',
  'https://unlimiteddatagh.com',
  'https://www.unlimiteddatagh.com',
  'https://senyo-frontend-gr8zusaid-danaasamuel2023s-projects.vercel.app',
  'https://senyo-frontend.vercel.app',
  'https://vercel.app',
  'https://*.vercel.app'
];
```

## Current Deployment Status

### Backend
- **Current**: https://unlimitedata.onrender.com (Render)
- **Alternative**: Ready for Vercel serverless deployment

### Frontend
- **Current**: https://senyo-frontend-gr8zusaid-danaasamuel2023s-projects.vercel.app (Vercel)
- **Status**: Production ready

### Database
- **Current**: MongoDB Atlas
- **Status**: Connected and operational

## Security Considerations

### Backend Security
- JWT secret should be at least 32 characters
- Enable rate limiting in production
- Use HTTPS for all communications
- Validate all environment variables

### Frontend Security
- Enable Content Security Policy (CSP)
- Enable HTTP Strict Transport Security (HSTS)
- Use secure cookies
- Validate all user inputs

## Monitoring and Logging

### Backend Monitoring
- Enable request logging
- Set log level to 'error' in production
- Monitor API response times
- Track error rates

### Frontend Monitoring
- Enable error reporting
- Enable performance monitoring
- Track user analytics
- Monitor Core Web Vitals

## Deployment Checklist

### Backend Deployment
- [ ] Copy `server/production-env-template.env` to `.env.production`
- [ ] Update all environment variables
- [ ] Test database connection
- [ ] Verify Paystack integration
- [ ] Deploy to Vercel
- [ ] Test all API endpoints
- [ ] Verify CORS configuration

### Frontend Deployment
- [ ] Copy `Client/production-env-template.env` to `.env.production`
- [ ] Update all environment variables
- [ ] Test API connectivity
- [ ] Deploy to Vercel
- [ ] Test all functionality
- [ ] Verify security headers

### Post-Deployment
- [ ] Test all critical functionality
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify security settings
- [ ] Update documentation

## Troubleshooting

### Common Issues
1. **CORS Errors**: Check allowed origins in backend
2. **Environment Variables**: Verify all required variables are set
3. **Database Connection**: Check MongoDB URI and credentials
4. **API Keys**: Verify Paystack keys are valid
5. **Build Errors**: Check Node.js version compatibility

### Support
- Check logs in Vercel dashboard
- Monitor Render logs for backend
- Use browser developer tools for frontend issues
- Check MongoDB Atlas logs for database issues

## Next Steps

1. **Custom Domain**: Configure custom domain in Vercel
2. **SSL Certificate**: Ensure HTTPS is enabled
3. **CDN**: Consider using Vercel's CDN for better performance
4. **Monitoring**: Set up monitoring and alerting
5. **Backup**: Implement backup strategies
6. **Scaling**: Plan for horizontal scaling if needed
