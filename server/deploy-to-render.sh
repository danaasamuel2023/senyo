#!/bin/bash

# Deploy Senyo Server to Render
# This script helps update the Render service with latest changes

echo "🚀 Deploying Senyo Server to Render..."

# Check if we're in the right directory
if [ ! -f "index.js" ]; then
    echo "❌ Error: index.js not found. Please run this script from the server directory."
    exit 1
fi

# Check if git is clean
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Warning: You have uncommitted changes."
    echo "   Consider committing your changes first:"
    echo "   git add . && git commit -m 'Update for production deployment'"
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Deployment cancelled."
        exit 1
    fi
fi

# Push to main branch (this will trigger Render deployment)
echo "📤 Pushing to main branch..."
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ Code pushed successfully!"
    echo ""
    echo "🔄 Render will automatically deploy the latest changes."
    echo "⏱️  Deployment typically takes 2-5 minutes."
    echo ""
    echo "📋 Next steps:"
    echo "1. Go to https://render.com/dashboard"
    echo "2. Navigate to your 'unlimitedata' service"
    echo "3. Check the 'Environment' tab"
    echo "4. Ensure these variables are set:"
    echo "   - PAYSTACK_SECRET_KEY=sk_live_d5228090985d3b7d9f8df6de2921b02615ccf73b"
    echo "   - PAYSTACK_PUBLIC_KEY=pk_live_6c2f71cb00f87a32fb593bc0c679cfd28f5ab2d3"
    echo "   - PAYSTACK_WEBHOOK_SECRET=sk_live_d5228090985d3b7d9f8df6de2921b02615ccf73b"
    echo ""
    echo "🧪 Test the deployment:"
    echo "   curl https://unlimitedata.onrender.com/api/v1/health"
    echo ""
    echo "📊 Monitor deployment progress in the Render dashboard."
else
    echo "❌ Failed to push to main branch."
    echo "   Check your git configuration and try again."
    exit 1
fi
