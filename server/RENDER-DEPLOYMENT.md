# Render Deployment Configuration

## 🚀 Render Environment Variables

To fix the 500 error on `https://unlimitedata.onrender.com`, update the following environment variables in your Render dashboard:

### Required Environment Variables

```env
NODE_ENV=production
PORT=3000
PAYSTACK_SECRET_KEY=sk_live_d5228090985d3b7d9f8df6de2921b02615ccf73b
PAYSTACK_PUBLIC_KEY=pk_live_6c2f71cb00f87a32fb593bc0c679cfd28f5ab2d3
PAYSTACK_WEBHOOK_SECRET=sk_live_d5228090985d3b7d9f8df6de2921b02615ccf73b
MONGODB_URI=mongodb+srv://dajounimarket:0246783840Sa@cluster0.kp8c2.mongodb.net/unlimiteddata?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=DatAmArt_Production_Secure_Key_2024
FRONTEND_URL=https://www.unlimiteddatagh.com
SERVER_URL=https://unlimitedata.onrender.com
```

## 🔧 How to Update Render Environment Variables

1. **Go to Render Dashboard**
   - Visit [render.com](https://render.com)
   - Sign in to your account
   - Navigate to your `unlimitedata` service

2. **Update Environment Variables**
   - Click on "Environment" tab
   - Add/Update the following variables:
     - `PAYSTACK_SECRET_KEY` = `sk_live_d5228090985d3b7d9f8df6de2921b02615ccf73b`
     - `PAYSTACK_PUBLIC_KEY` = `pk_live_6c2f71cb00f87a32fb593bc0c679cfd28f5ab2d3`
     - `PAYSTACK_WEBHOOK_SECRET` = `sk_live_d5228090985d3b7d9f8df6de2921b02615ccf73b`

3. **Redeploy the Service**
   - Click "Manual Deploy" → "Deploy latest commit"
   - Or push a new commit to trigger automatic deployment

## 🐛 Common Issues and Solutions

### 500 Internal Server Error
- **Cause**: Missing or incorrect Paystack keys
- **Solution**: Update environment variables as shown above

### Database Connection Issues
- **Cause**: Incorrect MongoDB URI
- **Solution**: Verify `MONGODB_URI` is correct

### Port Issues
- **Cause**: Wrong port configuration
- **Solution**: Ensure `PORT=3000` (Render uses port 3000 by default)

## 📊 Health Check Endpoints

After deployment, test these endpoints:

```bash
# Health check
curl https://unlimitedata.onrender.com/api/v1/health

# Deposit test (with valid user ID)
curl -X POST https://unlimitedata.onrender.com/api/v1/deposit \
  -H "Content-Type: application/json" \
  -d '{"userId":"VALID_USER_ID","amount":100,"email":"test@example.com"}'
```

## 🔄 Deployment Process

1. **Update Environment Variables** (as shown above)
2. **Redeploy Service** (Manual deploy or push new commit)
3. **Test Endpoints** (Verify functionality)
4. **Monitor Logs** (Check for any errors)

## 📝 Render Service Configuration

- **Build Command**: `npm install`
- **Start Command**: `node index.js`
- **Node Version**: 18.x or higher
- **Port**: 3000 (automatically set by Render)

## 🚨 Important Notes

- Render automatically restarts the service when environment variables are updated
- The service may be temporarily unavailable during deployment
- Always test the endpoints after deployment
- Monitor the logs for any runtime errors

## 📞 Support

If issues persist after updating environment variables:
1. Check Render service logs
2. Verify all environment variables are set correctly
3. Test the Paystack API keys directly
4. Ensure the MongoDB connection is working
