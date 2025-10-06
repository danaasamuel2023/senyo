#!/bin/bash

# UnlimitedData GH v2.0 Setup Script
# This script helps you set up all the new features

echo "🚀 UnlimitedData GH v2.0 Setup"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running in correct directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Please run this script from the project root directory${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Step 1: Installing Server Dependencies...${NC}"
cd server
if npm install; then
    echo -e "${GREEN}✅ Server dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install server dependencies${NC}"
    exit 1
fi
cd ..

echo ""
echo -e "${YELLOW}📦 Step 2: Installing Client Dependencies...${NC}"
cd Client
if npm install; then
    echo -e "${GREEN}✅ Client dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install client dependencies${NC}"
    exit 1
fi
cd ..

echo ""
echo -e "${YELLOW}🔧 Step 3: Checking Environment Files...${NC}"

# Check server .env
if [ -f "server/.env" ]; then
    echo -e "${GREEN}✅ Server .env exists${NC}"
    
    # Check for required variables
    if grep -q "EMAIL_USER" server/.env; then
        echo -e "${GREEN}  ✅ EMAIL_USER configured${NC}"
    else
        echo -e "${YELLOW}  ⚠️  EMAIL_USER not found - Email features won't work${NC}"
    fi
    
    if grep -q "EMAIL_PASSWORD" server/.env; then
        echo -e "${GREEN}  ✅ EMAIL_PASSWORD configured${NC}"
    else
        echo -e "${YELLOW}  ⚠️  EMAIL_PASSWORD not found - Email features won't work${NC}"
    fi
    
    if grep -q "MONGODB_USERNAME" server/.env; then
        echo -e "${GREEN}  ✅ MongoDB configured${NC}"
    else
        echo -e "${YELLOW}  ⚠️  MongoDB not configured${NC}"
    fi
else
    echo -e "${RED}❌ Server .env not found${NC}"
    echo -e "${YELLOW}  Creating template...${NC}"
    cat > server/.env << EOL
# Database Configuration
MONGODB_USERNAME=your_mongodb_username
MONGODB_PASSWORD=your_mongodb_password
MONGODB_CLUSTER=your_cluster.mongodb.net

# JWT Secrets
JWT_SECRET_VERIFYNOW=your_jwt_secret_here
JWT_SECRET=DatAmArt

# Email Configuration (REQUIRED for new features)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
SUPPORT_EMAIL=support@unlimiteddata.gh

# Application URLs
CLIENT_URL=http://localhost:3000
SERVER_URL=http://localhost:5001

# Server Configuration
PORT=5001
NODE_ENV=development
EOL
    echo -e "${YELLOW}  ⚠️  Please edit server/.env with your actual values${NC}"
fi

# Check client .env.local
if [ -f "Client/.env.local" ]; then
    echo -e "${GREEN}✅ Client .env.local exists${NC}"
else
    echo -e "${RED}❌ Client .env.local not found${NC}"
    echo -e "${YELLOW}  Creating template...${NC}"
    cat > Client/.env.local << EOL
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5001/api

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=UnlimitedData GH

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Feature Flags
NEXT_PUBLIC_ENABLE_2FA=true
NEXT_PUBLIC_ENABLE_WALLET=true
NEXT_PUBLIC_ENABLE_REFERRAL=true
NEXT_PUBLIC_ENABLE_PWA=true
EOL
    echo -e "${YELLOW}  ⚠️  Please edit Client/.env.local with your actual values${NC}"
fi

echo ""
echo -e "${YELLOW}🔍 Step 4: Verifying Installation...${NC}"

# Check if PWA files exist
if [ -f "Client/public/sw.js" ]; then
    echo -e "${GREEN}✅ PWA service worker exists${NC}"
else
    echo -e "${RED}❌ PWA service worker missing${NC}"
fi

if [ -f "Client/public/manifest.json" ]; then
    echo -e "${GREEN}✅ PWA manifest exists${NC}"
else
    echo -e "${RED}❌ PWA manifest missing${NC}"
fi

if [ -f "Client/component/PWAInstaller.jsx" ]; then
    echo -e "${GREEN}✅ PWA installer component exists${NC}"
else
    echo -e "${RED}❌ PWA installer component missing${NC}"
fi

# Check if new routes exist
if [ -f "server/walletRoutes/wallet.js" ]; then
    echo -e "${GREEN}✅ Wallet routes exist${NC}"
else
    echo -e "${RED}❌ Wallet routes missing${NC}"
fi

if [ -f "server/referralRoutes/referral.js" ]; then
    echo -e "${GREEN}✅ Referral routes exist${NC}"
else
    echo -e "${RED}❌ Referral routes missing${NC}"
fi

if [ -f "server/promoRoutes/promo.js" ]; then
    echo -e "${GREEN}✅ Promo routes exist${NC}"
else
    echo -e "${RED}❌ Promo routes missing${NC}"
fi

if [ -f "server/authRoutes/twoFactor.js" ]; then
    echo -e "${GREEN}✅ 2FA routes exist${NC}"
else
    echo -e "${RED}❌ 2FA routes missing${NC}"
fi

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "${YELLOW}📚 Next Steps:${NC}"
echo ""
echo "1. Configure environment variables:"
echo "   - Edit server/.env (especially EMAIL_USER and EMAIL_PASSWORD)"
echo "   - Edit Client/.env.local (if needed)"
echo ""
echo "2. Start the servers:"
echo "   Terminal 1: cd server && PORT=5001 npm start"
echo "   Terminal 2: cd Client && PORT=3000 npm run dev"
echo ""
echo "3. Read the documentation:"
echo "   - QUICK_START.md (Start here!)"
echo "   - NEW_FEATURES_GUIDE.md (Complete guide)"
echo "   - ENV_SETUP_GUIDE.md (Environment setup)"
echo "   - WHATS_NEW.md (Feature overview)"
echo ""
echo "4. Test new features:"
echo "   - Wallet system"
echo "   - Referral system"
echo "   - Promo codes"
echo "   - 2FA authentication"
echo "   - PWA installation"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Set up email service before testing!${NC}"
echo "   Follow the Gmail setup instructions in ENV_SETUP_GUIDE.md"
echo ""
echo -e "${GREEN}🚀 Ready to dominate the market!${NC}"
echo ""

