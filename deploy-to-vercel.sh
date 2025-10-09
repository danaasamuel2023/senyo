#!/bin/bash

echo "🚀 Deploying Senyo Frontend to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Navigate to frontend directory
cd Client

echo "🔑 Logging into Vercel..."
vercel login

echo "🌐 Deploying to production..."
vercel --prod

echo "✅ Deployment complete!"
echo "📋 Next steps:"
echo "1. Add your custom domain in Vercel dashboard"
echo "2. Configure DNS records"
echo "3. Update backend CORS on Render to include your domain"
echo "4. Test all functionality"
