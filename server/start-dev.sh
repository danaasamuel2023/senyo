#!/bin/bash

# Development server startup script
# This ensures NODE_ENV=development is always set

echo "🚀 Starting Senyo server in development mode..."
echo "🔧 NODE_ENV will be set to: development"
echo "✅ Rate limiting will be DISABLED"
echo ""

# Kill any existing server processes
echo "🔄 Stopping any existing server processes..."
pkill -f "node index.js" 2>/dev/null || true

# Wait a moment for processes to stop
sleep 2

# Start the server with development environment
echo "▶️  Starting server..."
NODE_ENV=development node index.js
