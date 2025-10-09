#!/bin/bash

# Start Server Script for Senyo Admin Dashboard
# This script sets up the environment variables and starts the server

echo "🚀 Starting Senyo Admin Dashboard Server..."

# Set environment variables
export NODE_ENV=development
export PORT=5001
export JWT_SECRET=DatAmArt
export MONGODB_USERNAME=dajounimarket
export MONGODB_PASSWORD=0246783840Sa
export MONGODB_CLUSTER=cluster0.kp8c2.mongodb.net
export MONGODB_URI="mongodb+srv://dajounimarket:0246783840Sa@cluster0.kp8c2.mongodb.net/unlimiteddata?retryWrites=true&w=majority&appName=Cluster0"
export PAYSTACK_SECRET_KEY=sk_live_0fba72fb9c4fc71200d2e0cdbb4f2b37c1de396c
export PAYSTACK_PUBLIC_KEY=pk_live_6c2f71cb00f87a32fb593bc0c679cfd28f5ab2d
export FRONTEND_URL=http://localhost:3000
export SERVER_URL=http://localhost:5001
export SUPPORT_EMAIL=Unlimiteddatagh@gmail.com
export SUPPORT_PHONE=+233256702995
export WHATSAPP_GROUP=https://chat.whatsapp.com/LEfSM2A3RVKJ1yY8JB5osP

echo "✅ Environment variables set"
echo "🔑 PAYSTACK_SECRET_KEY: ${PAYSTACK_SECRET_KEY:0:20}..."
echo "🌐 Server will run on port $PORT"
echo "📊 Admin Dashboard will be available at http://localhost:5001"
echo ""

# Start the server
node server/index.js
