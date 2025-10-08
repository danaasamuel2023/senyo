#!/bin/bash

# Production Deployment Script
# This script helps deploy your site to production

echo "🚀 Starting Production Deployment..."
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -d "Client" ] && [ ! -d "server" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "Project structure verified"

# Step 1: Check Git status
echo ""
echo "📋 Step 1: Checking Git Status"
echo "=============================="

if git status --porcelain | grep -q .; then
    print_warning "You have uncommitted changes"
    read -p "Do you want to commit them now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        git commit -m "Pre-production deployment commit"
        print_status "Changes committed"
    else
        print_warning "Continuing with uncommitted changes"
    fi
else
    print_status "No uncommitted changes"
fi

# Step 2: Push to GitHub
echo ""
echo "📤 Step 2: Pushing to GitHub"
echo "============================"

git push origin main
if [ $? -eq 0 ]; then
    print_status "Code pushed to GitHub successfully"
else
    print_error "Failed to push to GitHub"
    exit 1
fi

# Step 3: Backend Deployment Options
echo ""
echo "🔧 Step 3: Backend Deployment"
echo "============================="

echo "Choose your backend deployment platform:"
echo "1) Render.com (Recommended)"
echo "2) Heroku"
echo "3) Skip backend deployment"
read -p "Enter your choice (1-3): " -n 1 -r
echo

case $REPLY in
    1)
        print_info "Render.com Deployment Instructions:"
        echo "1. Go to https://render.com"
        echo "2. Create new Web Service"
        echo "3. Connect your GitHub repository"
        echo "4. Set build command: cd server && npm install"
        echo "5. Set start command: cd server && npm start"
        echo "6. Set root directory: server"
        echo "7. Add environment variables (see PRODUCTION_DEPLOYMENT_GUIDE.md)"
        echo "8. Deploy"
        ;;
    2)
        print_info "Heroku Deployment Instructions:"
        echo "1. Install Heroku CLI: npm install -g heroku"
        echo "2. Login: heroku login"
        echo "3. Create app: cd server && heroku create your-app-name"
        echo "4. Set environment variables (see PRODUCTION_DEPLOYMENT_GUIDE.md)"
        echo "5. Deploy: git push heroku main"
        ;;
    3)
        print_warning "Skipping backend deployment"
        ;;
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

# Step 4: Frontend Deployment Options
echo ""
echo "🌐 Step 4: Frontend Deployment"
echo "=============================="

echo "Choose your frontend deployment platform:"
echo "1) Vercel (Recommended)"
echo "2) Netlify"
echo "3) Skip frontend deployment"
read -p "Enter your choice (1-3): " -n 1 -r
echo

case $REPLY in
    1)
        print_info "Vercel Deployment Instructions:"
        echo "1. Install Vercel CLI: npm install -g vercel"
        echo "2. Deploy: cd Client && vercel"
        echo "3. Add environment variables in Vercel dashboard:"
        echo "   - NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com"
        echo "   - NEXT_PUBLIC_SITE_URL=https://your-domain.com"
        echo "4. Deploy to production: vercel --prod"
        ;;
    2)
        print_info "Netlify Deployment Instructions:"
        echo "1. Install Netlify CLI: npm install -g netlify-cli"
        echo "2. Deploy: cd Client && netlify deploy --prod --dir=.next"
        echo "3. Add environment variables in Netlify dashboard"
        ;;
    3)
        print_warning "Skipping frontend deployment"
        ;;
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

# Step 5: Environment Variables Checklist
echo ""
echo "⚙️  Step 5: Environment Variables Checklist"
echo "=========================================="

print_info "Backend Environment Variables Required:"
echo "- NODE_ENV=production"
echo "- PORT=5000"
echo "- FRONTEND_URL=https://your-domain.com"
echo "- MONGODB_URI=mongodb+srv://dajounimarket:0246783840Sa@cluster0.kp8c2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
echo "- JWT_SECRET=DatAmArt"
echo "- PAYSTACK_SECRET_KEY=sk_live_0fba72fb9c4fc71200d2e0cdbb4f2b37c1de396c"
echo "- PAYSTACK_PUBLIC_KEY=pk_live_your_public_key"
echo "- MOOLRE_API_USER=your_moolre_username"
echo "- MOOLRE_API_PUBKEY=your_moolre_public_key"
echo "- MOOLRE_API_KEY=your_moolre_private_key"
echo "- MOOLRE_ACCOUNT_NUMBER=your_moolre_account"

print_info "Frontend Environment Variables Required:"
echo "- NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com"
echo "- NEXT_PUBLIC_SITE_URL=https://your-domain.com"

# Step 6: Testing Instructions
echo ""
echo "🧪 Step 6: Testing Your Live Site"
echo "================================="

print_info "After deployment, test these features:"
echo "1. ✅ Login functionality"
echo "2. ✅ User registration"
echo "3. ✅ Payment processing"
echo "4. ✅ Mobile money deposits"
echo "5. ✅ Admin panel access"
echo "6. ✅ Dashboard loading"
echo "7. ✅ API connectivity"

# Step 7: Final Instructions
echo ""
echo "🎉 Deployment Complete!"
echo "======================"

print_status "Your site is ready for production!"
print_info "Next steps:"
echo "1. Complete the deployment on your chosen platforms"
echo "2. Configure environment variables"
echo "3. Test all functionality"
echo "4. Set up monitoring and backups"
echo "5. Configure custom domain (optional)"

print_info "For detailed instructions, see: PRODUCTION_DEPLOYMENT_GUIDE.md"

echo ""
echo "🚀 Happy deploying!"
