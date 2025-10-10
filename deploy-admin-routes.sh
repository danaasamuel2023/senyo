#!/bin/bash

# Deploy Admin Routes to Production
# This script ensures admin routes are deployed to production

echo "🚀 Deploying Admin Routes to Production..."
echo "=========================================="

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
        git commit -m "Deploy admin routes to production"
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

# Step 3: Check Render.com deployment
echo ""
echo "🔧 Step 3: Render.com Deployment Check"
echo "======================================"

print_info "Render.com Auto-Deploy Instructions:"
echo "1. Go to https://render.com/dashboard"
echo "2. Find your 'unlimitedata' service"
echo "3. Check if 'Auto-Deploy' is enabled"
echo "4. If disabled, enable it and connect to GitHub"
echo "5. If enabled, manually trigger a deploy"
echo "6. Wait for deployment to complete (5-10 minutes)"

# Step 4: Test production endpoints
echo ""
echo "🧪 Step 4: Testing Production Endpoints"
echo "======================================="

print_info "Testing admin endpoints after deployment..."

# Wait for user to confirm deployment
read -p "Press Enter after Render.com deployment is complete..."

# Test endpoints
echo "Testing /api/v1/admin/prices..."
if curl -s https://unlimitedata.onrender.com/api/v1/admin/prices | grep -q "success\|error"; then
    print_status "Price management endpoint responding"
else
    print_warning "Price management endpoint not responding"
fi

echo "Testing /api/v1/admin/daily-summary..."
if curl -s https://unlimitedata.onrender.com/api/v1/admin/daily-summary | grep -q "success\|error"; then
    print_status "Daily summary endpoint responding"
else
    print_warning "Daily summary endpoint not responding"
fi

echo "Testing /api/v1/admin/statistics..."
if curl -s https://unlimitedata.onrender.com/api/v1/admin/statistics | grep -q "success\|error"; then
    print_status "Statistics endpoint responding"
else
    print_warning "Statistics endpoint not responding"
fi

# Step 5: Final instructions
echo ""
echo "🎉 Admin Routes Deployment Complete!"
echo "===================================="

print_status "Admin routes should now be available in production!"
print_info "Next steps:"
echo "1. ✅ Test all admin endpoints"
echo "2. ✅ Verify admin panel functionality"
echo "3. ✅ Check price management system"
echo "4. ✅ Test daily summary and statistics"
echo "5. ✅ Monitor for any remaining 404 errors"

print_info "If endpoints still return 404:"
echo "1. Check Render.com service logs"
echo "2. Verify environment variables"
echo "3. Restart the Render.com service"
echo "4. Check for any build errors"

echo ""
echo "🚀 Admin routes deployment process complete!"
