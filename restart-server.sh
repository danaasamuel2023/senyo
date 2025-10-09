#!/bin/bash

echo "🚀 Restarting server to apply CORS and rate limiting fixes..."

# Kill any existing server processes
echo "🔧 Stopping existing server processes..."
pkill -f "node.*index.js" || true
pkill -f "node.*server" || true

# Wait a moment
sleep 2

# Start the server
echo "🚀 Starting server with fixes..."
cd server
npm start

echo "✅ Server restarted with CORS and rate limiting fixes applied!"
