#!/bin/bash

# Production Server Startup Script
# This script ensures the server runs continuously in production mode

echo "🚀 Starting Senyo Server in Production Mode..."

# Set production environment variables
export NODE_ENV=production
export PORT=3001

# Kill any existing server processes
echo "🔄 Stopping existing server processes..."
pkill -f "node index.js" || true
sleep 2

# Start the server
echo "✅ Starting server on port $PORT..."
echo "🌍 Environment: $NODE_ENV"
echo "🔑 Paystack Secret Key: ${PAYSTACK_SECRET_KEY:0:20}..."

# Start server with auto-restart on crash
while true; do
    echo "📅 $(date): Starting server..."
    node index.js
    
    # If server crashes, wait 5 seconds and restart
    echo "⚠️  Server crashed at $(date). Restarting in 5 seconds..."
    sleep 5
done
