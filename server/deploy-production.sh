#!/bin/bash

# Production Deployment Script
# This script deploys the Senyo application with proper environment configuration

echo "🚀 Starting Production Deployment..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please copy production-env-template.env to .env and configure it."
    exit 1
fi

# Check if JWT_SECRET is configured
if grep -q "your_strong_jwt_secret_key_here" .env; then
    echo "❌ JWT_SECRET not configured. Please update .env file."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Start the application
echo "🎯 Starting application..."
npm start

echo "✅ Deployment completed!"
