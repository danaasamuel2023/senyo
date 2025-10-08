# 🚀 Production Deployment Guide

## ✅ **Ready for Production Deployment**

Your site is now ready to be deployed to production! All login connectivity issues have been fixed and the codebase is optimized for live deployment.

---

## 🎯 **Deployment Overview**

### **What We're Deploying**
- **Backend Server**: Node.js/Express API server
- **Frontend**: Next.js React application
- **Database**: MongoDB Atlas
- **Payment**: Paystack integration
- **Mobile Money**: Moolre API integration

### **Deployment Platforms**
- **Backend**: Render.com (recommended) or Heroku
- **Frontend**: Vercel (recommended) or Netlify
- **Database**: MongoDB Atlas (already configured)

---

## 🔧 **Step 1: Deploy Backend Server**

### **Option A: Render.com (Recommended)**

1. **Go to [Render.com](https://render.com)** and sign up/login
2. **Create New Web Service**
3. **Connect GitHub Repository**
   - Select your `senyo` repository
   - Branch: `main`
4. **Configure Build Settings**
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Root Directory**: `server`
5. **Add Environment Variables**
   ```env
   NODE_ENV=production
   PORT=5000
   FRONTEND_URL=https://your-domain.com
   MONGODB_URI=mongodb+srv://dajounimarket:0246783840Sa@cluster0.kp8c2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=DatAmArt
   PAYSTACK_SECRET_KEY=sk_live_0fba72fb9c4fc71200d2e0cdbb4f2b37c1de396c
   PAYSTACK_PUBLIC_KEY=pk_live_your_public_key
   MOOLRE_API_USER=your_moolre_username
   MOOLRE_API_PUBKEY=your_moolre_public_key
   MOOLRE_API_KEY=your_moolre_private_key
   MOOLRE_ACCOUNT_NUMBER=your_moolre_account
   SUPPORT_EMAIL=Unlimiteddatagh@gmail.com
   SUPPORT_PHONE=+233256702995
   ```
6. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note the URL (e.g., `https://your-app.onrender.com`)

### **Option B: Heroku**

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   heroku login
   ```

2. **Create Heroku App**
   ```bash
   cd server
   heroku create your-app-name
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set FRONTEND_URL=https://your-domain.com
   heroku config:set MONGODB_URI=mongodb+srv://dajounimarket:0246783840Sa@cluster0.kp8c2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   heroku config:set JWT_SECRET=DatAmArt
   heroku config:set PAYSTACK_SECRET_KEY=sk_live_0fba72fb9c4fc71200d2e0cdbb4f2b37c1de396c
   # ... add all other environment variables
   ```

4. **Deploy**
   ```bash
   git add .
   git commit -m "Deploy to production"
   git push heroku main
   ```

---

## 🌐 **Step 2: Deploy Frontend**

### **Option A: Vercel (Recommended)**

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy from Client Directory**
   ```bash
   cd Client
   vercel
   ```

3. **Configure Environment Variables**
   In Vercel dashboard, add:
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
   NEXT_PUBLIC_SITE_URL=https://your-domain.com
   ```

4. **Deploy to Production**
   ```bash
   vercel --prod
   ```

### **Option B: Netlify**

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy**
   ```bash
   cd Client
   netlify deploy --prod --dir=.next
   ```

3. **Add Environment Variables**
   In Netlify dashboard, add the same environment variables as above.

---

## 🔗 **Step 3: Configure Domain**

### **Custom Domain Setup**

1. **Buy Domain** (if not already done)
   - Recommended: Namecheap, GoDaddy, or Cloudflare

2. **Configure DNS**
   - **A Record**: Point to your frontend deployment IP
   - **CNAME**: Point to your backend deployment URL

3. **SSL Certificate**
   - Vercel/Netlify provide free SSL certificates
   - Render provides free SSL for custom domains

---

## ⚙️ **Step 4: Environment Variables**

### **Backend Environment Variables**
```env
# Server Configuration
NODE_ENV=production
PORT=5000

# URLs
FRONTEND_URL=https://your-domain.com
SERVER_URL=https://your-backend-url.onrender.com

# Database
MONGODB_URI=mongodb+srv://dajounimarket:0246783840Sa@cluster0.kp8c2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

# Authentication
JWT_SECRET=DatAmArt

# Payment Gateway
PAYSTACK_SECRET_KEY=sk_live_0fba72fb9c4fc71200d2e0cdbb4f2b37c1de396c
PAYSTACK_PUBLIC_KEY=pk_live_your_public_key

# Mobile Money
MOOLRE_API_USER=your_moolre_username
MOOLRE_API_PUBKEY=your_moolre_public_key
MOOLRE_API_KEY=your_moolre_private_key
MOOLRE_ACCOUNT_NUMBER=your_moolre_account

# Contact Information
SUPPORT_EMAIL=Unlimiteddatagh@gmail.com
SUPPORT_PHONE=+233256702995
WHATSAPP_GROUP=https://chat.whatsapp.com/LEfSM2A3RVKJ1yY8JB5osP
```

### **Frontend Environment Variables**
```env
# API Configuration
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

---

## 🧪 **Step 5: Testing Production**

### **Pre-Deployment Checklist**
- [ ] Backend server deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Environment variables configured
- [ ] Database connection working
- [ ] Payment gateway configured
- [ ] Mobile money API configured

### **Post-Deployment Testing**
1. **Test Login**
   - Go to your live site
   - Try to login with test credentials
   - Verify no "unable to connect server" errors

2. **Test Payment Flow**
   - Make a test deposit
   - Verify Paystack integration works
   - Check wallet balance updates

3. **Test Mobile Money**
   - Try mobile money deposit
   - Verify Moolre API integration
   - Check OTP flow works

4. **Test Admin Panel**
   - Login as admin
   - Verify dashboard loads
   - Test user management
   - Test payment gateway settings

---

## 🚨 **Troubleshooting**

### **Common Issues**

#### **1. Login Not Working**
- **Check**: Environment variables are set correctly
- **Check**: Backend server is running and accessible
- **Check**: CORS configuration allows your frontend domain
- **Solution**: Use the API proxy routes we created

#### **2. Payment Not Working**
- **Check**: Paystack keys are production keys (not test)
- **Check**: Callback URL is set to your production domain
- **Check**: Webhook URL is configured in Paystack dashboard

#### **3. Mobile Money Not Working**
- **Check**: Moolre API credentials are production credentials
- **Check**: Account is activated for production
- **Check**: API endpoints are correct

#### **4. Database Connection Issues**
- **Check**: MongoDB Atlas IP whitelist includes your server IP
- **Check**: Database credentials are correct
- **Check**: Network access is enabled

---

## 📊 **Monitoring & Maintenance**

### **Performance Monitoring**
- **Uptime**: Use UptimeRobot or Pingdom
- **Errors**: Monitor server logs
- **Performance**: Use Vercel Analytics or Google Analytics

### **Regular Maintenance**
- **Updates**: Keep dependencies updated
- **Backups**: Regular database backups
- **Security**: Monitor for security updates
- **Performance**: Optimize based on usage patterns

---

## 🎉 **Success!**

Once deployed, your site will be:
- ✅ **Live and accessible** to users worldwide
- ✅ **Secure** with SSL certificates
- ✅ **Fast** with CDN and optimizations
- ✅ **Scalable** to handle growing traffic
- ✅ **Reliable** with proper error handling

### **Your Live URLs**
- **Frontend**: `https://your-domain.com`
- **Backend**: `https://your-backend-url.onrender.com`
- **Admin Panel**: `https://your-domain.com/admin`

---

## 🆘 **Need Help?**

If you encounter any issues during deployment:
1. Check the troubleshooting section above
2. Review server logs for error messages
3. Test API endpoints directly
4. Verify environment variables are set correctly
5. Check DNS configuration

**Your site is ready for production deployment!** 🚀
